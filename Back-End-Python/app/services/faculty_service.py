"""Mirrors Back-End/src/services/facultyService.js"""

from passlib.context import CryptContext
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services import auth_security_service

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

_BASE_SQL = """
SELECT f.faculty_id, f.user_id, f.faculty_number, f.department_id,
       f.title, f.office_location,
       u.first_name, u.last_name, u.email, u.is_active,
       d.department_name
FROM faculty f
JOIN users u ON u.user_id = f.user_id
LEFT JOIN departments d ON d.department_id = f.department_id
"""


def _map_faculty(r) -> dict:
    return {
        "faculty_id": int(r["faculty_id"]),
        "user_id": int(r["user_id"]),
        "faculty_number": r["faculty_number"],
        "first_name": r["first_name"],
        "last_name": r["last_name"],
        "email": r["email"],
        "title": r["title"],
        "department_id": int(r["department_id"]) if r["department_id"] is not None else None,
        "department_name": r["department_name"] or "",
        "office_location": r["office_location"],
        "is_active": r["is_active"],
    }


def list_faculty(db: Session) -> list:
    rows = db.execute(text(f"{_BASE_SQL} ORDER BY f.faculty_id DESC")).mappings().all()
    return [_map_faculty(r) for r in rows]


def get_faculty_by_id(db: Session, faculty_id: int) -> dict | None:
    row = db.execute(
        text(f"{_BASE_SQL} WHERE f.faculty_id = :fid"),
        {"fid": int(faculty_id)},
    ).mappings().first()
    return _map_faculty(row) if row else None


def create_faculty(db: Session, payload: dict) -> dict:
    password_hash = pwd_context.hash(str(payload.get("password", "")))

    db.execute(
        text(
            "INSERT INTO users(email, password_hash, role, first_name, last_name, is_active) "
            "VALUES (:email, :hash, 'faculty', :first, :last, :active)"
        ),
        {
            "email": str(payload.get("email", "")).strip().lower(),
            "hash": password_hash,
            "first": str(payload.get("first_name", "")).strip(),
            "last": str(payload.get("last_name", "")).strip(),
            "active": payload.get("is_active", True),
        },
    )
    db.flush()

    user_row = db.execute(
        text("SELECT user_id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1"),
        {"email": str(payload.get("email", "")).strip().lower()},
    ).mappings().first()

    user_id = int(user_row["user_id"])
    faculty_number = payload.get("faculty_number") or f"FAC{str(user_id).zfill(6)}"

    db.execute(
        text(
            "INSERT INTO faculty(user_id, faculty_number, department_id, title, office_location) "
            "VALUES (:uid, :fnum, :did, :title, :office)"
        ),
        {
            "uid": user_id,
            "fnum": faculty_number,
            "did": int(payload["department_id"]) if payload.get("department_id") else None,
            "title": str(payload.get("title", "")).strip(),
            "office": payload.get("office_location"),
        },
    )
    db.commit()

    auth_security_service.set_must_change_password(db, user_id, True)

    fac_row = db.execute(
        text("SELECT faculty_id FROM faculty WHERE user_id = :uid LIMIT 1"),
        {"uid": user_id},
    ).mappings().first()

    return get_faculty_by_id(db, int(fac_row["faculty_id"]))


def update_faculty(db: Session, faculty_id: int, payload: dict) -> dict | None:
    existing = get_faculty_by_id(db, faculty_id)
    if not existing:
        return None

    db.execute(
        text(
            "UPDATE users SET first_name = :first, last_name = :last, email = :email, "
            "is_active = :active, updated_at = NOW() WHERE user_id = :uid"
        ),
        {
            "first": payload.get("first_name", existing["first_name"]),
            "last": payload.get("last_name", existing["last_name"]),
            "email": str(payload.get("email", existing["email"])).strip().lower(),
            "active": payload.get("is_active", existing["is_active"]),
            "uid": existing["user_id"],
        },
    )

    db.execute(
        text(
            "UPDATE faculty SET faculty_number = :fnum, department_id = :did, "
            "title = :title, office_location = :office WHERE faculty_id = :fid"
        ),
        {
            "fnum": payload.get("faculty_number", existing["faculty_number"]),
            "did": int(payload["department_id"]) if payload.get("department_id") else existing["department_id"],
            "title": payload.get("title", existing["title"]),
            "office": payload.get("office_location", existing["office_location"]),
            "fid": int(faculty_id),
        },
    )
    db.commit()
    return get_faculty_by_id(db, faculty_id)


def delete_faculty(db: Session, faculty_id: int) -> bool:
    fid = int(faculty_id)
    row = db.execute(
        text("SELECT user_id FROM faculty WHERE faculty_id = :fid FOR UPDATE"),
        {"fid": fid},
    ).mappings().first()

    if not row:
        db.rollback()
        return False

    user_id = int(row["user_id"])
    db.execute(text("UPDATE students SET advisor_id = NULL WHERE advisor_id = :fid"), {"fid": fid})
    db.execute(text("UPDATE class_sections SET faculty_id = NULL WHERE faculty_id = :fid"), {"fid": fid})
    db.execute(text("DELETE FROM faculty WHERE faculty_id = :fid"), {"fid": fid})
    db.execute(
        text(
            "DELETE FROM users WHERE user_id = :uid AND LOWER(role) = 'faculty' "
            "AND NOT EXISTS (SELECT 1 FROM faculty WHERE user_id = :uid) "
            "AND NOT EXISTS (SELECT 1 FROM students WHERE user_id = :uid)"
        ),
        {"uid": user_id},
    )
    db.commit()
    return True
