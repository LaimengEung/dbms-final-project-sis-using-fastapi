"""Mirrors Back-End/src/services/sectionService.js"""

from sqlalchemy import text
from sqlalchemy.orm import Session

_SECTION_SQL = """
SELECT cs.section_id, cs.csn AS section_csn, cs.section_number,
       cs.course_id, cs.semester_id, cs.faculty_id,
       cs.schedule, cs.max_capacity, cs.status AS section_status,
       c.course_code, c.course_name, c.credits AS course_credits,
       sem.semester_name, sem.semester_year,
       uf.first_name AS faculty_first_name, uf.last_name AS faculty_last_name,
       COALESCE(ec.enrolled_count, 0) AS enrolled_count
FROM class_sections cs
LEFT JOIN courses c ON c.course_id = cs.course_id
LEFT JOIN semesters sem ON sem.semester_id = cs.semester_id
LEFT JOIN faculty f ON f.faculty_id = cs.faculty_id
LEFT JOIN users uf ON uf.user_id = f.user_id
LEFT JOIN (
    SELECT section_id, COUNT(*) FILTER (WHERE status='enrolled') AS enrolled_count
    FROM enrollments GROUP BY section_id
) ec ON ec.section_id = cs.section_id
"""


def _map_section(r) -> dict:
    return {
        "section_id": int(r["section_id"]),
        "section_number": r["section_number"],
        "section_csn": r["section_csn"],
        "course_id": int(r["course_id"]) if r["course_id"] is not None else None,
        "faculty_id": int(r["faculty_id"]) if r["faculty_id"] is not None else None,
        "semester_id": int(r["semester_id"]) if r["semester_id"] is not None else None,
        "max_capacity": int(r["max_capacity"] or 0),
        "enrolled_count": int(r["enrolled_count"] or 0),
        "schedule": r["schedule"],
        "status": r["section_status"],
        "course": {
            "course_id": int(r["course_id"]),
            "course_code": r["course_code"],
            "course_name": r["course_name"],
            "credits": int(r["course_credits"] or 0),
        } if r["course_id"] else None,
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
    }


def list_sections(
    db: Session,
    semester_id: int | None = None,
    status: str | None = None,
    course_id: int | None = None,
    limit: int | None = None,
) -> list:
    where = []
    params: dict = {}

    if semester_id:
        where.append("cs.semester_id = :semester_id")
        params["semester_id"] = int(semester_id)
    if status:
        where.append("LOWER(cs.status) = :status")
        params["status"] = str(status).lower()
    if course_id:
        where.append("cs.course_id = :course_id")
        params["course_id"] = int(course_id)

    where_sql = ("WHERE " + " AND ".join(where)) if where else ""
    limit_sql = "LIMIT :limit" if limit else ""
    if limit:
        params["limit"] = int(limit)

    rows = db.execute(
        text(f"{_SECTION_SQL} {where_sql} ORDER BY cs.section_id DESC {limit_sql}"),
        params,
    ).mappings().all()
    return [_map_section(r) for r in rows]


def get_section_by_id(db: Session, section_id: int) -> dict | None:
    row = db.execute(
        text(f"{_SECTION_SQL} WHERE cs.section_id = :sid"),
        {"sid": int(section_id)},
    ).mappings().first()
    return _map_section(row) if row else None


def get_section_capacity(db: Session, section_id: int) -> dict | None:
    row = db.execute(
        text(
            "SELECT cs.section_id, cs.max_capacity, COALESCE(ec.enrolled_count,0) AS enrolled_count "
            "FROM class_sections cs "
            "LEFT JOIN (SELECT section_id, COUNT(*) FILTER (WHERE status='enrolled') AS enrolled_count "
            "FROM enrollments GROUP BY section_id) ec ON ec.section_id = cs.section_id "
            "WHERE cs.section_id = :sid"
        ),
        {"sid": int(section_id)},
    ).mappings().first()
    if not row:
        return None
    return {
        "section_id": int(row["section_id"]),
        "enrolled_count": int(row["enrolled_count"] or 0),
        "max_capacity": int(row["max_capacity"] or 0),
        "has_capacity": int(row["enrolled_count"] or 0) < int(row["max_capacity"] or 0),
    }


def create_section_for_course(db: Session, course_id: int, payload: dict) -> dict | None:
    cid = int(course_id)
    check = db.execute(
        text("SELECT course_id FROM courses WHERE course_id = :cid"), {"cid": cid}
    ).mappings().first()
    if not check:
        return None

    semester_id = int(payload.get("semester_id", 1))
    section_number = payload.get("section_number")

    if not section_number:
        next_row = db.execute(
            text(
                "SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(section_number, '[^0-9]', '', 'g'), '')::int), 0) + 1 AS next_num "
                "FROM class_sections WHERE course_id=:cid AND semester_id=:semid"
            ),
            {"cid": cid, "semid": semester_id},
        ).mappings().first()
        section_number = str(int(next_row["next_num"])).zfill(3)

    import time
    csn = payload.get("section_csn") or payload.get("csn") or f"CSN{int(time.time() * 1000)}"

    db.execute(
        text(
            "INSERT INTO class_sections(csn, course_id, semester_id, section_number, faculty_id, "
            "classroom, schedule, start_date, end_date, max_capacity, status) "
            "VALUES (:csn, :cid, :semid, :snum, :fid, :cls, :sched, :start, :end, :cap, :status)"
        ),
        {
            "csn": str(csn),
            "cid": cid,
            "semid": semester_id,
            "snum": str(section_number),
            "fid": int(payload["faculty_id"]) if payload.get("faculty_id") else None,
            "cls": payload.get("classroom"),
            "sched": payload.get("schedule"),
            "start": payload.get("start_date"),
            "end": payload.get("end_date"),
            "cap": int(payload.get("max_capacity", 30)),
            "status": payload.get("status", "open"),
        },
    )
    row = db.execute(
        text("SELECT section_id FROM class_sections WHERE csn=:csn ORDER BY section_id DESC LIMIT 1"),
        {"csn": str(csn)},
    ).mappings().first()
    db.commit()
    return get_section_by_id(db, int(row["section_id"]))


def update_section(db: Session, section_id: int, payload: dict) -> dict | None:
    check = db.execute(
        text("SELECT section_id FROM class_sections WHERE section_id = :sid"),
        {"sid": int(section_id)},
    ).mappings().first()
    if not check:
        return None

    db.execute(
        text(
            "UPDATE class_sections SET faculty_id=:fid, classroom=:cls, schedule=:sched, "
            "start_date=:start, end_date=:end, max_capacity=:cap, status=:status "
            "WHERE section_id=:sid"
        ),
        {
            "fid": int(payload["faculty_id"]) if payload.get("faculty_id") else None,
            "cls": payload.get("classroom"),
            "sched": payload.get("schedule"),
            "start": payload.get("start_date"),
            "end": payload.get("end_date"),
            "cap": int(payload.get("max_capacity", 30)),
            "status": payload.get("status", "open"),
            "sid": int(section_id),
        },
    )
    db.commit()
    return get_section_by_id(db, section_id)


def delete_section(db: Session, section_id: int) -> bool:
    check = db.execute(
        text("SELECT section_id FROM class_sections WHERE section_id = :sid"),
        {"sid": int(section_id)},
    ).mappings().first()
    if not check:
        return False
    db.execute(text("DELETE FROM class_sections WHERE section_id = :sid"), {"sid": int(section_id)})
    db.commit()
    return True
