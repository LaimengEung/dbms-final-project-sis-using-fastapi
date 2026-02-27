"""Mirrors Back-End/src/services/financeService.js"""

from sqlalchemy import text
from sqlalchemy.orm import Session


def _map_finance(r) -> dict:
    return {
        "finance_id": int(r["finance_id"]),
        "student_id": int(r["student_id"]),
        "semester_id": int(r["semester_id"]),
        "amount": float(r["amount"] or 0),
        "transaction_type": r["transaction_type"],
        "description": r["description"],
        "transaction_date": r["transaction_date"],
        "payment_method": r["payment_method"],
        "reference_number": r["reference_number"],
        "status": r["status"],
        "created_at": r["created_at"],
    }


_SELECT = (
    "SELECT finance_id, student_id, semester_id, amount, transaction_type, description, "
    "transaction_date, payment_method, reference_number, status, created_at FROM finance_records"
)


def list_finance_records(
    db: Session,
    student_id: int | None = None,
    semester_id: int | None = None,
    status: str | None = None,
    transaction_type: str | None = None,
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
    if transaction_type:
        where.append("LOWER(transaction_type) = :transaction_type")
        params["transaction_type"] = str(transaction_type).lower()

    where_sql = ("WHERE " + " AND ".join(where)) if where else ""
    rows = db.execute(
        text(f"{_SELECT} {where_sql} ORDER BY finance_id DESC"), params
    ).mappings().all()
    return [_map_finance(r) for r in rows]


def get_finance_by_id(db: Session, finance_id: int) -> dict | None:
    row = db.execute(
        text(f"{_SELECT} WHERE finance_id = :fid"),
        {"fid": int(finance_id)},
    ).mappings().first()
    return _map_finance(row) if row else None


def create_finance_record(db: Session, payload: dict) -> dict:
    db.execute(
        text(
            "INSERT INTO finance_records(student_id, semester_id, amount, transaction_type, "
            "description, transaction_date, payment_method, reference_number, status) "
            "VALUES (:sid, :semid, :amount, :ttype, :desc, :tdate, :pmethod, :refnum, :status)"
        ),
        {
            "sid": int(payload["student_id"]),
            "semid": int(payload["semester_id"]),
            "amount": float(payload["amount"]),
            "ttype": payload["transaction_type"],
            "desc": payload.get("description"),
            "tdate": payload.get("transaction_date"),
            "pmethod": payload.get("payment_method"),
            "refnum": payload.get("reference_number"),
            "status": payload.get("status", "pending"),
        },
    )
    row = db.execute(
        text(
            "SELECT finance_id FROM finance_records WHERE student_id=:sid ORDER BY finance_id DESC LIMIT 1"
        ),
        {"sid": int(payload["student_id"])},
    ).mappings().first()
    db.commit()
    return get_finance_by_id(db, int(row["finance_id"]))


def update_finance_record(db: Session, finance_id: int, payload: dict) -> dict | None:
    db.execute(
        text(
            "UPDATE finance_records SET student_id=:sid, semester_id=:semid, amount=:amount, "
            "transaction_type=:ttype, description=:desc, transaction_date=:tdate, "
            "payment_method=:pmethod, reference_number=:refnum, status=:status "
            "WHERE finance_id=:fid"
        ),
        {
            "sid": int(payload["student_id"]),
            "semid": int(payload["semester_id"]),
            "amount": float(payload["amount"]),
            "ttype": payload["transaction_type"],
            "desc": payload.get("description"),
            "tdate": payload.get("transaction_date"),
            "pmethod": payload.get("payment_method"),
            "refnum": payload.get("reference_number"),
            "status": payload.get("status", "pending"),
            "fid": int(finance_id),
        },
    )
    db.commit()
    return get_finance_by_id(db, finance_id)


def delete_finance_record(db: Session, finance_id: int) -> bool:
    result = db.execute(
        text("DELETE FROM finance_records WHERE finance_id=:fid RETURNING finance_id"),
        {"fid": int(finance_id)},
    ).mappings().first()
    db.commit()
    return result is not None
