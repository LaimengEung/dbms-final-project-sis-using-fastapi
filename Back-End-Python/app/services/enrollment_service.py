"""Mirrors Back-End/src/services/enrollmentService.js"""

from datetime import datetime

from sqlalchemy import text
from sqlalchemy.orm import Session

ALLOWED_STATUSES = {"enrolled", "dropped", "withdrawn", "completed"}


def _normalize_status(value: str, fallback: str = "enrolled") -> str | None:
    status = str(value or fallback).lower()
    return status if status in ALLOWED_STATUSES else None


_ENROLLMENT_SELECT = """
SELECT e.enrollment_id, e.student_id, e.section_id, e.status, e.enrollment_date,
       s.student_number, s.gpa AS student_gpa,
       su.first_name AS student_first_name, su.last_name AS student_last_name,
       su.email AS student_email,
       m.major_name,
       cs.section_number, cs.csn AS section_csn, cs.schedule, cs.max_capacity,
       c.course_id, c.course_code, c.course_name, c.credits AS course_credits,
       sem.semester_id, sem.semester_name, sem.semester_year,
       f.faculty_id, fu.first_name AS faculty_first_name, fu.last_name AS faculty_last_name,
       COALESCE(ec.enrolled_count, 0) AS enrolled_count
"""

_ENROLLMENT_FROM = """
FROM enrollments e
JOIN students s ON s.student_id = e.student_id
JOIN users su ON su.user_id = s.user_id
LEFT JOIN majors m ON m.major_id = s.major_id
JOIN class_sections cs ON cs.section_id = e.section_id
LEFT JOIN courses c ON c.course_id = cs.course_id
LEFT JOIN semesters sem ON sem.semester_id = cs.semester_id
LEFT JOIN faculty f ON f.faculty_id = cs.faculty_id
LEFT JOIN users fu ON fu.user_id = f.user_id
LEFT JOIN (
    SELECT section_id, COUNT(*) FILTER (WHERE status='enrolled') AS enrolled_count
    FROM enrollments GROUP BY section_id
) ec ON ec.section_id = cs.section_id
"""


def _map_enrollment(r) -> dict:
    return {
        "enrollment_id": int(r["enrollment_id"]),
        "student_id": int(r["student_id"]),
        "section_id": int(r["section_id"]),
        "status": r["status"],
        "enrollment_date": r["enrollment_date"],
        "student": {
            "student_id": int(r["student_id"]),
            "student_number": r["student_number"],
            "gpa": float(r["student_gpa"] or 0),
            "user": {
                "first_name": r["student_first_name"],
                "last_name": r["student_last_name"],
                "email": r["student_email"],
            },
            "major": {"major_name": r["major_name"] or "Undeclared"},
        },
        "section": {
            "section_id": int(r["section_id"]),
            "section_number": r["section_number"],
            "section_csn": r["section_csn"],
            "schedule": r["schedule"],
            "max_capacity": int(r["max_capacity"] or 0),
            "enrolled_count": int(r["enrolled_count"] or 0),
            "course": {
                "course_id": int(r["course_id"]) if r["course_id"] else None,
                "course_code": r["course_code"],
                "course_name": r["course_name"],
                "credits": int(r["course_credits"] or 0),
            },
            "faculty": {
                "faculty_id": int(r["faculty_id"]),
                "user": {
                    "first_name": r["faculty_first_name"],
                    "last_name": r["faculty_last_name"],
                },
            } if r["faculty_id"] else None,
            "semester": {
                "semester_id": int(r["semester_id"]),
                "semester_name": r["semester_name"],
                "semester_year": int(r["semester_year"]),
            } if r["semester_id"] else None,
        },
    }


def list_enrollments(
    db: Session,
    page: int = 1,
    limit: int = 10,
    status: str | None = None,
    search: str | None = None,
    semester_id: int | None = None,
    section_id: int | None = None,
    student_id: int | None = None,
    faculty_id: int | None = None,
) -> dict:
    p = max(int(page or 1), 1)
    l = max(int(limit or 10), 1)
    where = []
    params: dict = {}

    if status:
        where.append("LOWER(e.status) = :status")
        params["status"] = str(status).lower()
    if semester_id:
        where.append("cs.semester_id = :semester_id")
        params["semester_id"] = int(semester_id)
    if section_id:
        where.append("e.section_id = :section_id")
        params["section_id"] = int(section_id)
    if student_id:
        where.append("e.student_id = :student_id")
        params["student_id"] = int(student_id)
    if faculty_id:
        where.append("cs.faculty_id = :faculty_id")
        params["faculty_id"] = int(faculty_id)
    if search:
        where.append(
            "(LOWER(su.first_name || ' ' || su.last_name) LIKE :search "
            "OR LOWER(s.student_number) LIKE :search)"
        )
        params["search"] = f"%{str(search).lower()}%"

    where_sql = ("WHERE " + " AND ".join(where)) if where else ""

    total_row = db.execute(
        text(f"SELECT COUNT(*)::int AS total {_ENROLLMENT_FROM} {where_sql}"), params
    ).mappings().first()
    total = int(total_row["total"] or 0)

    params["limit"] = l
    params["offset"] = (p - 1) * l

    rows = db.execute(
        text(
            f"{_ENROLLMENT_SELECT} {_ENROLLMENT_FROM} {where_sql} "
            "ORDER BY e.enrollment_date DESC, e.enrollment_id DESC "
            "LIMIT :limit OFFSET :offset"
        ),
        params,
    ).mappings().all()

    return {
        "data": [_map_enrollment(r) for r in rows],
        "pagination": {"page": p, "limit": l, "total": total, "totalPages": -(-total // l)},
    }


def get_enrollment_by_id(db: Session, enrollment_id: int) -> dict | None:
    row = db.execute(
        text(f"{_ENROLLMENT_SELECT} {_ENROLLMENT_FROM} WHERE e.enrollment_id = :eid"),
        {"eid": int(enrollment_id)},
    ).mappings().first()
    return _map_enrollment(row) if row else None


def create_enrollment(db: Session, payload: dict) -> dict:
    student_id = int(payload.get("student_id", 0))
    section_id = int(payload.get("section_id", 0))
    status = _normalize_status(payload.get("status", "enrolled"))

    if not student_id or not section_id:
        return {"error": {"status": 400, "message": "student_id and section_id are required"}}
    if not status:
        return {"error": {"status": 400, "message": "Invalid enrollment status"}}

    section_row = db.execute(
        text(
            """
            SELECT cs.section_id, cs.max_capacity, cs.status AS section_status,
                   cs.schedule, cs.semester_id, cs.course_id,
                   c.course_code, COALESCE(c.credits,0) AS target_credits,
                   COALESCE(ec.enrolled_count,0) AS enrolled_count
            FROM class_sections cs
            JOIN courses c ON c.course_id = cs.course_id
            LEFT JOIN (
                SELECT section_id, COUNT(*) FILTER (WHERE status='enrolled') AS enrolled_count
                FROM enrollments GROUP BY section_id
            ) ec ON ec.section_id = cs.section_id
            WHERE cs.section_id = :sid
            """
        ),
        {"sid": section_id},
    ).mappings().first()

    if not section_row:
        return {"error": {"status": 404, "message": "Section not found"}}
    if str(section_row["section_status"] or "").lower() not in ("open", "active"):
        return {"error": {"status": 409, "message": "Section is not open for enrollment"}}

    if int(section_row["enrolled_count"]) >= int(section_row["max_capacity"]):
        return {"error": {"status": 409, "message": "Section is full"}}

    student = db.execute(
        text("SELECT student_id FROM students WHERE student_id = :sid"),
        {"sid": student_id},
    ).mappings().first()
    if not student:
        return {"error": {"status": 404, "message": "Student not found"}}

    dup = db.execute(
        text(
            "SELECT enrollment_id FROM enrollments "
            "WHERE student_id=:sid AND section_id=:secid AND status IN ('enrolled','completed') LIMIT 1"
        ),
        {"sid": student_id, "secid": section_id},
    ).mappings().first()
    if dup:
        return {"error": {"status": 409, "message": "Student is already enrolled in this section"}}

    dup_course = db.execute(
        text(
            """
            SELECT e.enrollment_id FROM enrollments e
            JOIN class_sections cs ON cs.section_id = e.section_id
            WHERE e.student_id=:sid AND cs.semester_id=:semid
              AND cs.course_id=:cid AND e.status IN ('enrolled','completed') LIMIT 1
            """
        ),
        {"sid": student_id, "semid": int(section_row["semester_id"]), "cid": int(section_row["course_id"])},
    ).mappings().first()
    if dup_course:
        return {"error": {"status": 409, "message": "Student already has this course in the selected semester"}}

    db.execute(
        text(
            "INSERT INTO enrollments(student_id, section_id, status) VALUES (:sid, :secid, :status)"
        ),
        {"sid": student_id, "secid": section_id, "status": status},
    )
    row = db.execute(
        text(
            "SELECT enrollment_id FROM enrollments "
            "WHERE student_id=:sid AND section_id=:secid ORDER BY enrollment_id DESC LIMIT 1"
        ),
        {"sid": student_id, "secid": section_id},
    ).mappings().first()
    db.commit()
    return {"data": get_enrollment_by_id(db, int(row["enrollment_id"]))}


def update_enrollment(db: Session, enrollment_id: int, payload: dict) -> dict | None:
    eid = int(enrollment_id)
    existing = get_enrollment_by_id(db, eid)
    if not existing:
        return None
    status = _normalize_status(payload.get("status", existing["status"]))
    if not status:
        return {"error": {"status": 400, "message": "Invalid enrollment status"}}
    db.execute(
        text("UPDATE enrollments SET status=:status WHERE enrollment_id=:eid"),
        {"status": status, "eid": eid},
    )
    db.commit()
    return get_enrollment_by_id(db, eid)


def delete_enrollment(db: Session, enrollment_id: int) -> bool:
    result = db.execute(
        text("DELETE FROM enrollments WHERE enrollment_id=:eid RETURNING enrollment_id"),
        {"eid": int(enrollment_id)},
    ).mappings().first()
    db.commit()
    return result is not None
