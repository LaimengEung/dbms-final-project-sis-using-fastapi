"""Mirrors Back-End/src/services/departmentService.js"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def list_departments(db: Session) -> list:
    rows = db.execute(
        text(
            "SELECT department_id, department_code, department_name, description "
            "FROM departments ORDER BY department_name"
        )
    ).mappings().all()
    return [dict(r) for r in rows]


def get_department_by_id(db: Session, department_id: int) -> dict | None:
    row = db.execute(
        text(
            "SELECT department_id, department_code, department_name, description "
            "FROM departments WHERE department_id = :did"
        ),
        {"did": int(department_id)},
    ).mappings().first()
    return dict(row) if row else None


def create_department(db: Session, payload: dict) -> dict:
    row = db.execute(
        text(
            "INSERT INTO departments(department_code, department_name, description) "
            "VALUES(:code, :name, :desc) RETURNING department_id, department_code, department_name, description"
        ),
        {
            "code": payload.get("department_code", "").strip(),
            "name": payload.get("department_name", "").strip(),
            "desc": payload.get("description", "") or None,
        },
    ).mappings().first()
    db.commit()
    return dict(row)


def update_department(db: Session, department_id: int, payload: dict) -> dict | None:
    existing = get_department_by_id(db, department_id)
    if not existing:
        return None
    db.execute(
        text(
            "UPDATE departments SET department_code=:code, department_name=:name, description=:desc "
            "WHERE department_id=:did"
        ),
        {
            "code": payload.get("department_code", existing["department_code"]),
            "name": payload.get("department_name", existing["department_name"]),
            "desc": payload.get("description", existing["description"]),
            "did": int(department_id),
        },
    )
    db.commit()
    return get_department_by_id(db, department_id)


def delete_department(db: Session, department_id: int) -> bool:
    result = db.execute(
        text("DELETE FROM departments WHERE department_id=:did"),
        {"did": int(department_id)},
    )
    db.commit()
    return result.rowcount > 0
