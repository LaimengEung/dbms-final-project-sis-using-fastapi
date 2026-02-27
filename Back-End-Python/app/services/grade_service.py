"""Mirrors Back-End/src/services/gradeService.js"""

from sqlalchemy import text
from sqlalchemy.orm import Session

LETTER_POINTS = {
    "a": 4.0, "a-": 3.7, "b+": 3.3, "b": 3.0, "b-": 2.7,
    "c+": 2.3, "c": 2.0, "c-": 1.7, "d+": 1.3, "d": 1.0, "f": 0.0,
}


def _map_grade(r) -> dict:
    return {
        "grade_id": int(r["grade_id"]),
        "enrollment_id": int(r["enrollment_id"]),
        "letter_grade": r["letter_grade"],
        "numeric_grade": float(r["numeric_grade"]) if r["numeric_grade"] is not None else None,
        "grade_points": float(r["grade_points"]) if r["grade_points"] is not None else None,
        "semester_id": int(r["semester_id"]) if r["semester_id"] is not None else None,
        "posted_date": r["posted_date"],
        "posted_by": int(r["posted_by"]) if r["posted_by"] is not None else None,
    }


_GRADE_SELECT = (
    "SELECT g.grade_id, g.enrollment_id, g.letter_grade, g.numeric_grade, "
    "g.grade_points, g.semester_id, g.posted_date, g.posted_by"
)


def list_grades(
    db: Session,
    student_id: int | None = None,
    enrollment_id: int | None = None,
    semester_id: int | None = None,
    faculty_id: int | None = None,
) -> list:
    where = []
    params: dict = {}

    if student_id:
        where.append("e.student_id = :student_id")
        params["student_id"] = int(student_id)
    if enrollment_id:
        where.append("g.enrollment_id = :enrollment_id")
        params["enrollment_id"] = int(enrollment_id)
    if semester_id:
        where.append("g.semester_id = :semester_id")
        params["semester_id"] = int(semester_id)
    if faculty_id:
        where.append("cs.faculty_id = :faculty_id")
        params["faculty_id"] = int(faculty_id)

    where_sql = ("WHERE " + " AND ".join(where)) if where else ""
    rows = db.execute(
        text(
            f"{_GRADE_SELECT} FROM grades g "
            "JOIN enrollments e ON e.enrollment_id = g.enrollment_id "
            "JOIN class_sections cs ON cs.section_id = e.section_id "
            f"{where_sql} ORDER BY g.grade_id DESC"
        ),
        params,
    ).mappings().all()
    return [_map_grade(r) for r in rows]


def get_grade_by_id(db: Session, grade_id: int) -> dict | None:
    row = db.execute(
        text(
            f"{_GRADE_SELECT}, e.student_id, cs.faculty_id "
            "FROM grades g "
            "JOIN enrollments e ON e.enrollment_id = g.enrollment_id "
            "JOIN class_sections cs ON cs.section_id = e.section_id "
            "WHERE g.grade_id = :gid"
        ),
        {"gid": int(grade_id)},
    ).mappings().first()
    if not row:
        return None
    mapped = _map_grade(row)
    mapped["student_id"] = int(row["student_id"])
    mapped["faculty_id"] = int(row["faculty_id"]) if row["faculty_id"] is not None else None
    return mapped


def _get_enrollment_context(db: Session, enrollment_id: int) -> dict | None:
    row = db.execute(
        text(
            "SELECT e.enrollment_id, e.student_id, cs.faculty_id "
            "FROM enrollments e "
            "JOIN class_sections cs ON cs.section_id = e.section_id "
            "WHERE e.enrollment_id = :eid LIMIT 1"
        ),
        {"eid": int(enrollment_id)},
    ).mappings().first()
    if not row:
        return None
    return {
        "enrollment_id": int(row["enrollment_id"]),
        "student_id": int(row["student_id"]),
        "faculty_id": int(row["faculty_id"]) if row["faculty_id"] is not None else None,
    }


def _resolve_points(grade_points, letter_grade) -> float | None:
    if grade_points is not None:
        try:
            return float(grade_points)
        except (ValueError, TypeError):
            pass
    key = str(letter_grade or "").strip().lower()
    return LETTER_POINTS.get(key)


def _recalculate_student_gpa(db: Session, student_id: int) -> float:
    rows = db.execute(
        text(
            "SELECT g.grade_points, g.letter_grade, c.credits "
            "FROM grades g "
            "JOIN enrollments e ON e.enrollment_id = g.enrollment_id "
            "JOIN class_sections cs ON cs.section_id = e.section_id "
            "JOIN courses c ON c.course_id = cs.course_id "
            "WHERE e.student_id = :sid"
        ),
        {"sid": int(student_id)},
    ).mappings().all()

    total_pts = 0.0
    total_cred = 0.0
    for r in rows:
        credits = float(r["credits"] or 0)
        pts = _resolve_points(r["grade_points"], r["letter_grade"])
        if credits <= 0 or pts is None:
            continue
        total_pts += pts * credits
        total_cred += credits

    gpa = round(total_pts / total_cred, 2) if total_cred > 0 else 0.0
    db.execute(
        text("UPDATE students SET gpa = :gpa WHERE student_id = :sid"),
        {"gpa": gpa, "sid": int(student_id)},
    )
    return gpa


def create_grade(db: Session, payload: dict) -> dict:
    db.execute(
        text(
            "INSERT INTO grades(enrollment_id, letter_grade, numeric_grade, grade_points, "
            "semester_id, posted_date, posted_by) "
            "VALUES (:eid, :lg, :ng, :gp, :semid, :pd, :pb)"
        ),
        {
            "eid": int(payload["enrollment_id"]),
            "lg": payload.get("letter_grade"),
            "ng": float(payload["numeric_grade"]) if payload.get("numeric_grade") is not None else None,
            "gp": float(payload["grade_points"]) if payload.get("grade_points") is not None else None,
            "semid": int(payload["semester_id"]) if payload.get("semester_id") else None,
            "pd": payload.get("posted_date"),
            "pb": int(payload["posted_by"]) if payload.get("posted_by") else None,
        },
    )
    row = db.execute(
        text("SELECT grade_id FROM grades WHERE enrollment_id=:eid ORDER BY grade_id DESC LIMIT 1"),
        {"eid": int(payload["enrollment_id"])},
    ).mappings().first()
    db.commit()

    ctx = _get_enrollment_context(db, int(payload["enrollment_id"]))
    if ctx and ctx.get("student_id"):
        _recalculate_student_gpa(db, ctx["student_id"])
        db.commit()

    return get_grade_by_id(db, int(row["grade_id"]))


def update_grade(db: Session, grade_id: int, payload: dict) -> dict | None:
    existing = get_grade_by_id(db, grade_id)
    if not existing:
        return None

    db.execute(
        text(
            "UPDATE grades SET enrollment_id=:eid, letter_grade=:lg, numeric_grade=:ng, "
            "grade_points=:gp, semester_id=:semid, posted_date=:pd, posted_by=:pb "
            "WHERE grade_id=:gid"
        ),
        {
            "eid": int(payload.get("enrollment_id", existing["enrollment_id"])),
            "lg": payload.get("letter_grade", existing["letter_grade"]),
            "ng": float(payload["numeric_grade"]) if payload.get("numeric_grade") is not None else None,
            "gp": float(payload["grade_points"]) if payload.get("grade_points") is not None else None,
            "semid": int(payload["semester_id"]) if payload.get("semester_id") else None,
            "pd": payload.get("posted_date", existing["posted_date"]),
            "pb": int(payload["posted_by"]) if payload.get("posted_by") else None,
            "gid": int(grade_id),
        },
    )
    db.commit()

    if existing.get("student_id"):
        _recalculate_student_gpa(db, existing["student_id"])
        db.commit()

    return get_grade_by_id(db, grade_id)


def delete_grade(db: Session, grade_id: int) -> bool:
    existing = get_grade_by_id(db, grade_id)
    result = db.execute(
        text("DELETE FROM grades WHERE grade_id=:gid RETURNING grade_id"),
        {"gid": int(grade_id)},
    ).mappings().first()
    db.commit()
    if result and existing and existing.get("student_id"):
        _recalculate_student_gpa(db, existing["student_id"])
        db.commit()
    return result is not None
