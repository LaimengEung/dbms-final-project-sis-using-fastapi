"""Mirrors Back-End/src/services/courseService.js"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def _map_course(r) -> dict:
    return {
        "course_id": int(r["course_id"]),
        "course_code": r["course_code"],
        "course_name": r["course_name"],
        "description": r["description"],
        "credits": int(r["credits"] or 0),
        "department_id": int(r["department_id"]) if r["department_id"] is not None else None,
    }


def list_courses(db: Session) -> list:
    rows = db.execute(
        text(
            "SELECT course_id, course_code, course_name, description, credits, department_id "
            "FROM courses ORDER BY course_id DESC"
        )
    ).mappings().all()
    return [_map_course(r) for r in rows]


def get_course_by_id(db: Session, course_id: int) -> dict | None:
    row = db.execute(
        text(
            "SELECT course_id, course_code, course_name, description, credits, department_id "
            "FROM courses WHERE course_id = :cid"
        ),
        {"cid": int(course_id)},
    ).mappings().first()
    return _map_course(row) if row else None


def create_course(db: Session, payload: dict) -> dict:
    db.execute(
        text(
            "INSERT INTO courses(course_code, course_name, description, credits, department_id) "
            "VALUES (:code, :name, :desc, :credits, :did)"
        ),
        {
            "code": str(payload.get("course_code", "")).strip(),
            "name": str(payload.get("course_name", "")).strip(),
            "desc": payload.get("description"),
            "credits": int(payload.get("credits", 3)),
            "did": int(payload["department_id"]) if payload.get("department_id") else None,
        },
    )
    row = db.execute(
        text(
            "SELECT course_id FROM courses WHERE course_code = :code ORDER BY course_id DESC LIMIT 1"
        ),
        {"code": str(payload.get("course_code", "")).strip()},
    ).mappings().first()
    db.commit()
    return get_course_by_id(db, int(row["course_id"]))


def update_course(db: Session, course_id: int, payload: dict) -> dict | None:
    db.execute(
        text(
            "UPDATE courses SET course_code=:code, course_name=:name, description=:desc, "
            "credits=:credits, department_id=:did WHERE course_id=:cid"
        ),
        {
            "code": str(payload.get("course_code", "")).strip(),
            "name": str(payload.get("course_name", "")).strip(),
            "desc": payload.get("description"),
            "credits": int(payload.get("credits", 3)),
            "did": int(payload["department_id"]) if payload.get("department_id") else None,
            "cid": int(course_id),
        },
    )
    db.commit()
    return get_course_by_id(db, course_id)


def delete_course(db: Session, course_id: int) -> bool:
    result = db.execute(
        text("DELETE FROM courses WHERE course_id = :cid RETURNING course_id"),
        {"cid": int(course_id)},
    ).mappings().first()
    db.commit()
    return result is not None
