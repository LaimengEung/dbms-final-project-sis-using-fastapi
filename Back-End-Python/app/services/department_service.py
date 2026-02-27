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
