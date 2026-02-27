"""Mirrors Back-End/src/services/userService.js"""

from passlib.context import CryptContext
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services import auth_security_service
from app.utils.mappers import to_api_role, to_db_role

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _to_public(r) -> dict:
    return {
        "user_id": int(r["user_id"]),
        "first_name": r["first_name"],
        "last_name": r["last_name"],
        "email": r["email"],
        "role": to_api_role(r["role"]),
        "is_active": r["is_active"],
        "created_at": r["created_at"],
        "updated_at": r["updated_at"],
    }


def list_users(db: Session, search: str | None = None, page: int = 1, limit: int = 10) -> list:
    p = max(int(page or 1), 1)
    l = max(int(limit or 10), 1)
    params: dict = {"limit": l, "offset": (p - 1) * l}

    if search:
        params["search"] = f"%{search.lower()}%"
        where = (
            "WHERE LOWER(first_name) LIKE :search OR LOWER(last_name) LIKE :search "
            "OR LOWER(email) LIKE :search OR LOWER(role) LIKE :search"
        )
    else:
        where = ""

    rows = db.execute(
        text(
            f"SELECT user_id, first_name, last_name, email, role, is_active, created_at, updated_at "
            f"FROM users {where} ORDER BY user_id DESC LIMIT :limit OFFSET :offset"
        ),
        params,
    ).mappings().all()

    return [_to_public(r) for r in rows]


def get_user_by_id(db: Session, user_id: int) -> dict | None:
    row = db.execute(
        text(
            "SELECT user_id, first_name, last_name, email, role, is_active, created_at, updated_at "
            "FROM users WHERE user_id = :uid"
        ),
        {"uid": int(user_id)},
    ).mappings().first()
    return _to_public(row) if row else None


def get_user_stats(db: Session) -> dict:
    total = db.execute(text("SELECT COUNT(*) AS cnt FROM users")).mappings().first()["cnt"]
    role_rows = db.execute(
        text("SELECT role, COUNT(*) AS cnt FROM users GROUP BY role")
    ).mappings().all()
    roles = {to_api_role(r["role"]): int(r["cnt"]) for r in role_rows}
    return {"total_users": int(total), "roles": roles}


def create_user(db: Session, payload: dict) -> dict:
    hashed = pwd_context.hash(str(payload.get("password", "")))
    role = to_db_role(str(payload.get("role", "student")))

    db.execute(
        text(
            "INSERT INTO users(email, password_hash, role, first_name, last_name, is_active) "
            "VALUES (:email, :hash, :role, :first, :last, true)"
        ),
        {
            "email": str(payload.get("email", "")).strip().lower(),
            "hash": hashed,
            "role": role,
            "first": str(payload.get("first_name", "")).strip(),
            "last": str(payload.get("last_name", "")).strip(),
        },
    )

    row = db.execute(
        text("SELECT user_id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1"),
        {"email": str(payload.get("email", "")).strip().lower()},
    ).mappings().first()

    user_id = int(row["user_id"])

    if role == "student":
        student_number = f"STU{str(user_id).zfill(6)}"
        db.execute(
            text(
                "INSERT INTO students(user_id, student_number, classification, major_id, "
                "admission_date, credits_earned, gpa, academic_standing, advisor_id) "
                "VALUES (:uid, :snum, 'freshman', NULL, NULL, 0, 0, 'good', NULL)"
            ),
            {"uid": user_id, "snum": student_number},
        )

    db.commit()
    auth_security_service.set_must_change_password(db, user_id, True)
    return get_user_by_id(db, user_id)


def update_user(db: Session, user_id: int, payload: dict) -> dict | None:
    existing = get_user_by_id(db, user_id)
    if not existing:
        return None

    params = {
        "email": str(payload.get("email", existing["email"])).strip().lower(),
        "first": str(payload.get("first_name", existing["first_name"])).strip(),
        "last": str(payload.get("last_name", existing["last_name"])).strip(),
        "role": to_db_role(str(payload.get("role", existing["role"]))),
        "uid": int(user_id),
    }

    if payload.get("password"):
        params["hash"] = pwd_context.hash(str(payload["password"]))
        db.execute(
            text(
                "UPDATE users SET email=:email, first_name=:first, last_name=:last, "
                "role=:role, password_hash=:hash, updated_at=NOW() WHERE user_id=:uid"
            ),
            params,
        )
    else:
        db.execute(
            text(
                "UPDATE users SET email=:email, first_name=:first, last_name=:last, "
                "role=:role, updated_at=NOW() WHERE user_id=:uid"
            ),
            params,
        )

    db.commit()
    return get_user_by_id(db, user_id)


def patch_user(db: Session, user_id: int, payload: dict) -> dict | None:
    existing = get_user_by_id(db, user_id)
    if not existing:
        return None

    updates = []
    params: dict = {"uid": int(user_id)}

    if payload.get("email"):
        updates.append("email = :email")
        params["email"] = str(payload["email"]).strip().lower()
    if payload.get("first_name") is not None:
        updates.append("first_name = :first_name")
        params["first_name"] = str(payload["first_name"])
    if payload.get("last_name") is not None:
        updates.append("last_name = :last_name")
        params["last_name"] = str(payload["last_name"])
    if payload.get("role"):
        updates.append("role = :role")
        params["role"] = to_db_role(str(payload["role"]))
    if payload.get("is_active") is not None:
        updates.append("is_active = :is_active")
        params["is_active"] = bool(payload["is_active"])
    if payload.get("password"):
        updates.append("password_hash = :hash")
        params["hash"] = pwd_context.hash(str(payload["password"]))

    if not updates:
        return existing

    updates.append("updated_at = NOW()")
    db.execute(
        text(f"UPDATE users SET {', '.join(updates)} WHERE user_id = :uid"),
        params,
    )
    db.commit()
    return get_user_by_id(db, user_id)


def delete_user(db: Session, user_id: int) -> bool:
    result = db.execute(
        text("DELETE FROM users WHERE user_id = :uid RETURNING user_id"),
        {"uid": int(user_id)},
    ).mappings().first()
    db.commit()
    return result is not None
