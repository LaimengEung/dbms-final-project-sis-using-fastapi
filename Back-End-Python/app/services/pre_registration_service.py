"""Mirrors Back-End/src/services/preRegistrationService.js"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def _map_pre_reg(r) -> dict:
    return {
        "pre_reg_id": int(r["pre_reg_id"]),
        "student_id": int(r["student_id"]),
        "section_id": int(r["section_id"]),
        "semester_id": int(r["semester_id"]),
        "requested_date": r["requested_date"],
        "status": r["status"],
        "approved_by": int(r["approved_by"]) if r["approved_by"] is not None else None,
        "approved_date": r["approved_date"],
        "notes": r["notes"],
    }


_SELECT = (
    "SELECT pre_reg_id, student_id, section_id, semester_id, requested_date, "
    "status, approved_by, approved_date, notes FROM pre_registered_courses"
)


def list_pre_regs(
    db: Session,
    student_id: int | None = None,
    semester_id: int | None = None,
    status: str | None = None,
) -> list:
    where = []
    params: dict = {}

    if student_id:
        where.append("student_id = :student_id")
        params["student_id"] = int(student_id)
    if semester_id:
        where.append("semester_id = :semester_id")
        params["semester_id"] = int(semester_id)
    if status:
        where.append("LOWER(status) = :status")
        params["status"] = str(status).lower()

    where_sql = ("WHERE " + " AND ".join(where)) if where else ""
    rows = db.execute(
        text(f"{_SELECT} {where_sql} ORDER BY pre_reg_id DESC"), params
    ).mappings().all()
    return [_map_pre_reg(r) for r in rows]


def get_pre_reg_by_id(db: Session, pre_reg_id: int) -> dict | None:
    row = db.execute(
        text(f"{_SELECT} WHERE pre_reg_id = :pid"),
        {"pid": int(pre_reg_id)},
    ).mappings().first()
    return _map_pre_reg(row) if row else None


def create_pre_reg(db: Session, payload: dict) -> dict:
    db.execute(
        text(
            "INSERT INTO pre_registered_courses(student_id, section_id, semester_id, "
            "status, approved_by, approved_date, notes) "
            "VALUES (:sid, :secid, :semid, :status, :approved_by, :approved_date, :notes)"
        ),
        {
            "sid": int(payload["student_id"]),
            "secid": int(payload["section_id"]),
            "semid": int(payload["semester_id"]),
            "status": payload.get("status", "pending"),
            "approved_by": int(payload["approved_by"]) if payload.get("approved_by") else None,
            "approved_date": payload.get("approved_date"),
            "notes": payload.get("notes"),
        },
    )
    row = db.execute(
        text(
            "SELECT pre_reg_id FROM pre_registered_courses "
            "WHERE student_id=:sid ORDER BY pre_reg_id DESC LIMIT 1"
        ),
        {"sid": int(payload["student_id"])},
    ).mappings().first()
    db.commit()
    return get_pre_reg_by_id(db, int(row["pre_reg_id"]))


def update_pre_reg(db: Session, pre_reg_id: int, payload: dict) -> dict | None:
    db.execute(
        text(
            "UPDATE pre_registered_courses SET student_id=:sid, section_id=:secid, "
            "semester_id=:semid, status=:status, approved_by=:approved_by, "
            "approved_date=:approved_date, notes=:notes WHERE pre_reg_id=:pid"
        ),
        {
            "sid": int(payload["student_id"]),
            "secid": int(payload["section_id"]),
            "semid": int(payload["semester_id"]),
            "status": payload.get("status", "pending"),
            "approved_by": int(payload["approved_by"]) if payload.get("approved_by") else None,
            "approved_date": payload.get("approved_date"),
            "notes": payload.get("notes"),
            "pid": int(pre_reg_id),
        },
    )
    db.commit()
    return get_pre_reg_by_id(db, pre_reg_id)


def delete_pre_reg(db: Session, pre_reg_id: int) -> bool:
    result = db.execute(
        text("DELETE FROM pre_registered_courses WHERE pre_reg_id=:pid RETURNING pre_reg_id"),
        {"pid": int(pre_reg_id)},
    ).mappings().first()
    db.commit()
    return result is not None
