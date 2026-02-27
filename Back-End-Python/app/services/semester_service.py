"""Mirrors Back-End/src/services/semesterService.js"""

from datetime import datetime

from sqlalchemy import text
from sqlalchemy.orm import Session


def _map_semester(r) -> dict:
    return {
        "semester_id": int(r["semester_id"]),
        "semester_name": r["semester_name"],
        "semester_year": int(r["semester_year"]),
        "start_date": r["start_date"],
        "end_date": r["end_date"],
        "registration_start": r["registration_start"],
        "registration_end": r["registration_end"],
        "is_current": bool(r["is_current"]),
    }


_SELECT = (
    "SELECT semester_id, semester_name, semester_year, start_date, end_date, "
    "registration_start, registration_end, is_current FROM semesters"
)


def list_semesters(db: Session, limit: int | None = None) -> list:
    params = {}
    limit_sql = ""
    if limit:
        limit_sql = "LIMIT :limit"
        params["limit"] = int(limit)
    rows = db.execute(
        text(f"{_SELECT} ORDER BY semester_year DESC, semester_id DESC {limit_sql}"), params
    ).mappings().all()
    return [_map_semester(r) for r in rows]


def get_semester_by_id(db: Session, semester_id: int) -> dict | None:
    row = db.execute(
        text(f"{_SELECT} WHERE semester_id = :sid"), {"sid": int(semester_id)}
    ).mappings().first()
    return _map_semester(row) if row else None


def _validate(data: dict) -> str | None:
    required = ["semester_name", "semester_year", "start_date", "end_date",
                 "registration_start", "registration_end"]
    for key in required:
        if data.get(key) is None or data.get(key) == "":
            return f"{key} is required"

    def _d(val):
        try:
            return datetime.fromisoformat(str(val))
        except Exception:
            return None

    start = _d(data.get("start_date"))
    end = _d(data.get("end_date"))
    reg_start = _d(data.get("registration_start"))
    reg_end = _d(data.get("registration_end"))

    if start and end and start > end:
        return "start_date must be on or before end_date"
    if reg_start and reg_end and reg_start > reg_end:
        return "registration_start must be on or before registration_end"
    if reg_end and start and reg_end > start:
        return "registration_end must be on or before start_date"
    return None


def create_semester(db: Session, payload: dict) -> dict:
    err = _validate(payload)
    if err:
        return {"error": {"status": 400, "message": err}}

    dup = db.execute(
        text(
            "SELECT semester_id FROM semesters "
            "WHERE LOWER(semester_name) = LOWER(:name) AND semester_year = :year LIMIT 1"
        ),
        {"name": payload["semester_name"], "year": int(payload["semester_year"])},
    ).mappings().first()
    if dup:
        return {"error": {"status": 409, "message": "Semester already exists for this year"}}

    if payload.get("is_current"):
        db.execute(text("UPDATE semesters SET is_current = false WHERE is_current = true"))

    db.execute(
        text(
            "INSERT INTO semesters(semester_name, semester_year, start_date, end_date, "
            "registration_start, registration_end, is_current) "
            "VALUES (:name, :year, :start, :end, :reg_start, :reg_end, :current)"
        ),
        {
            "name": payload["semester_name"],
            "year": int(payload["semester_year"]),
            "start": payload["start_date"],
            "end": payload["end_date"],
            "reg_start": payload["registration_start"],
            "reg_end": payload["registration_end"],
            "current": bool(payload.get("is_current", False)),
        },
    )
    row = db.execute(
        text(
            "SELECT semester_id FROM semesters "
            "WHERE LOWER(semester_name)=LOWER(:name) AND semester_year=:year "
            "ORDER BY semester_id DESC LIMIT 1"
        ),
        {"name": payload["semester_name"], "year": int(payload["semester_year"])},
    ).mappings().first()
    db.commit()
    return {"data": get_semester_by_id(db, int(row["semester_id"]))}


def update_semester(db: Session, semester_id: int, payload: dict) -> dict | None:
    sid = int(semester_id)
    existing = get_semester_by_id(db, sid)
    if not existing:
        return None

    data = {
        "semester_name": payload.get("semester_name", existing["semester_name"]),
        "semester_year": int(payload.get("semester_year", existing["semester_year"])),
        "start_date": payload.get("start_date", existing["start_date"]),
        "end_date": payload.get("end_date", existing["end_date"]),
        "registration_start": payload.get("registration_start", existing["registration_start"]),
        "registration_end": payload.get("registration_end", existing["registration_end"]),
        "is_current": bool(payload.get("is_current", existing["is_current"])),
    }

    err = _validate(data)
    if err:
        return {"error": {"status": 400, "message": err}}

    dup = db.execute(
        text(
            "SELECT semester_id FROM semesters "
            "WHERE LOWER(semester_name)=LOWER(:name) AND semester_year=:year AND semester_id<>:sid LIMIT 1"
        ),
        {"name": data["semester_name"], "year": data["semester_year"], "sid": sid},
    ).mappings().first()
    if dup:
        return {"error": {"status": 409, "message": "Semester already exists for this year"}}

    if data["is_current"]:
        db.execute(
            text("UPDATE semesters SET is_current=false WHERE is_current=true AND semester_id<>:sid"),
            {"sid": sid},
        )

    db.execute(
        text(
            "UPDATE semesters SET semester_name=:name, semester_year=:year, start_date=:start, "
            "end_date=:end, registration_start=:reg_start, registration_end=:reg_end, "
            "is_current=:current WHERE semester_id=:sid"
        ),
        {
            "name": data["semester_name"],
            "year": data["semester_year"],
            "start": data["start_date"],
            "end": data["end_date"],
            "reg_start": data["registration_start"],
            "reg_end": data["registration_end"],
            "current": data["is_current"],
            "sid": sid,
        },
    )
    db.commit()
    return {"data": get_semester_by_id(db, sid)}


def set_current_semester(db: Session, semester_id: int) -> dict | None:
    sid = int(semester_id)
    existing = get_semester_by_id(db, sid)
    if not existing:
        return None
    db.execute(text("UPDATE semesters SET is_current = false WHERE is_current = true"))
    db.execute(text("UPDATE semesters SET is_current = true WHERE semester_id = :sid"), {"sid": sid})
    db.commit()
    return get_semester_by_id(db, sid)


def delete_semester(db: Session, semester_id: int) -> bool:
    result = db.execute(
        text("DELETE FROM semesters WHERE semester_id = :sid RETURNING semester_id"),
        {"sid": int(semester_id)},
    ).mappings().first()
    db.commit()
    return result is not None
