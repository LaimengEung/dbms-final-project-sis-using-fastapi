"""Mirrors Back-End/src/services/majorService.js"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def _map_major(r) -> dict:
    return {
        "major_id": int(r["major_id"]),
        "major_code": r["major_code"],
        "major_name": r["major_name"],
        "department_id": int(r["department_id"]) if r["department_id"] is not None else None,
        "department_name": r["department_name"] or None,
        "required_credits": int(r["required_credits"] or 0),
        "description": r["description"],
    }


_BASE_SQL = """
SELECT m.major_id, m.major_code, m.major_name, m.department_id,
       m.required_credits, m.description, d.department_name
FROM majors m
LEFT JOIN departments d ON d.department_id = m.department_id
"""


def list_majors(db: Session, department_id: int | None = None) -> list:
    params: dict = {}
    where = ""
    if department_id:
        where = "WHERE m.department_id = :did"
        params["did"] = int(department_id)
    rows = db.execute(text(f"{_BASE_SQL} {where} ORDER BY m.major_name"), params).mappings().all()
    return [_map_major(r) for r in rows]


def get_major_by_id(db: Session, major_id: int) -> dict | None:
    row = db.execute(
        text(f"{_BASE_SQL} WHERE m.major_id = :mid"), {"mid": int(major_id)}
    ).mappings().first()
    return _map_major(row) if row else None


def create_major(db: Session, payload: dict) -> dict:
    db.execute(
        text(
            "INSERT INTO majors(major_code, major_name, department_id, required_credits, description) "
            "VALUES (:code, :name, :did, :cred, :desc)"
        ),
        {
            "code": str(payload.get("major_code", "")).strip(),
            "name": str(payload.get("major_name", "")).strip(),
            "did": int(payload["department_id"]) if payload.get("department_id") else None,
            "cred": int(payload.get("required_credits", 0)),
            "desc": payload.get("description"),
        },
    )
    row = db.execute(
        text("SELECT major_id FROM majors WHERE major_code=:code ORDER BY major_id DESC LIMIT 1"),
        {"code": str(payload.get("major_code", "")).strip()},
    ).mappings().first()
    db.commit()
    return get_major_by_id(db, int(row["major_id"]))


def update_major(db: Session, major_id: int, payload: dict) -> dict | None:
    db.execute(
        text(
            "UPDATE majors SET major_code=:code, major_name=:name, department_id=:did, "
            "required_credits=:cred, description=:desc WHERE major_id=:mid"
        ),
        {
            "code": str(payload.get("major_code", "")).strip(),
            "name": str(payload.get("major_name", "")).strip(),
            "did": int(payload["department_id"]) if payload.get("department_id") else None,
            "cred": int(payload.get("required_credits", 0)),
            "desc": payload.get("description"),
            "mid": int(major_id),
        },
    )
    db.commit()
    return get_major_by_id(db, major_id)


def delete_major(db: Session, major_id: int) -> bool:
    result = db.execute(
        text("DELETE FROM majors WHERE major_id=:mid RETURNING major_id"),
        {"mid": int(major_id)},
    ).mappings().first()
    db.commit()
    return result is not None
