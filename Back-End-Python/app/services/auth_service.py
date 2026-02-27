"""Mirrors Back-End/src/services/authService.js"""

import os
from datetime import datetime, timedelta

from jose import jwt
from passlib.context import CryptContext
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services import auth_security_service
from app.utils.mappers import to_api_role

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_EXPIRES_IN_HOURS = 8


def _parse_expires(env_val: str) -> int:
    """Convert e.g. '8h' → 8, '24h'→24. Defaults to 8."""
    val = str(env_val or "8h").strip().lower()
    if val.endswith("h"):
        try:
            return int(val[:-1])
        except ValueError:
            pass
    return 8


JWT_HOURS = _parse_expires(os.getenv("JWT_EXPIRES_IN", "8h"))


def issue_access_token(user: dict) -> str:
    expiry = datetime.utcnow() + timedelta(hours=JWT_HOURS)
    payload = {
        "user_id": int(user["user_id"]),
        "email": user["email"],
        "role": user["role"],
        "exp": expiry,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def login(db: Session, email: str, password: str) -> dict:
    auth_security_service.ensure_auth_security_schema(db)

    normalized_email = str(email or "").strip().lower()
    plain_password = str(password or "")

    if not normalized_email or not plain_password:
        return {"error": {"status": 400, "message": "Email and password are required"}}

    row = db.execute(
        text(
            "SELECT user_id, email, password_hash, role, first_name, last_name, is_active "
            "FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1"
        ),
        {"email": normalized_email},
    ).mappings().first()

    if not row:
        return {"error": {"status": 401, "message": "Invalid email or password"}}

    if not pwd_context.verify(plain_password, row["password_hash"]):
        return {"error": {"status": 401, "message": "Invalid email or password"}}

    if row["is_active"] is False:
        return {"error": {"status": 403, "message": "User account is inactive"}}

    security = auth_security_service.get_security_by_user_id(db, int(row["user_id"]))

    user_data = {
        "user_id": int(row["user_id"]),
        "email": row["email"],
        "first_name": row["first_name"],
        "last_name": row["last_name"],
        "role": to_api_role(row["role"]),
        "is_active": row["is_active"],
        "must_change_password": bool(security.get("must_change_password")) if security else False,
    }
    return {"data": user_data}


def forgot_password(db: Session, email: str) -> dict:
    auth_security_service.ensure_auth_security_schema(db)
    normalized = str(email or "").strip().lower()
    if not normalized:
        return {"error": {"status": 400, "message": "Email is required"}}

    row = db.execute(
        text("SELECT user_id FROM users WHERE LOWER(email) = LOWER(:email) LIMIT 1"),
        {"email": normalized},
    ).mappings().first()

    if not row:
        return {"data": {"message": "If the email exists, a reset token has been created."}}

    token_data = auth_security_service.issue_password_reset_token(db, int(row["user_id"]))
    return {
        "data": {
            "message": "Password reset token generated.",
            "reset_token": token_data["token"],
            "expires_at": token_data["expires_at"],
        }
    }


def reset_password(db: Session, token: str, new_password: str) -> dict:
    auth_security_service.ensure_auth_security_schema(db)
    plain = str(new_password or "")
    if not token or not plain:
        return {"error": {"status": 400, "message": "token and new_password are required"}}
    if len(plain) < 8:
        return {"error": {"status": 400, "message": "Password must be at least 8 characters"}}

    token_row = auth_security_service.consume_password_reset_token(db, token)
    if not token_row:
        return {"error": {"status": 400, "message": "Invalid or expired reset token"}}

    hashed = pwd_context.hash(plain)
    db.execute(
        text("UPDATE users SET password_hash = :hash, updated_at = NOW() WHERE user_id = :uid"),
        {"hash": hashed, "uid": token_row["user_id"]},
    )
    db.commit()
    return {"data": {"message": "Password reset successful"}}


def change_password(db: Session, user_id: int, current_password: str, new_password: str) -> dict:
    auth_security_service.ensure_auth_security_schema(db)
    current = str(current_password or "")
    nxt = str(new_password or "")
    if not current or not nxt:
        return {"error": {"status": 400, "message": "current_password and new_password are required"}}
    if len(nxt) < 8:
        return {"error": {"status": 400, "message": "Password must be at least 8 characters"}}

    row = db.execute(
        text("SELECT password_hash FROM users WHERE user_id = :uid LIMIT 1"),
        {"uid": int(user_id)},
    ).mappings().first()

    if not row:
        return {"error": {"status": 404, "message": "User not found"}}

    if not pwd_context.verify(current, row["password_hash"]):
        return {"error": {"status": 401, "message": "Current password is incorrect"}}

    hashed = pwd_context.hash(nxt)
    db.execute(
        text("UPDATE users SET password_hash = :hash, updated_at = NOW() WHERE user_id = :uid"),
        {"hash": hashed, "uid": int(user_id)},
    )
    auth_security_service.set_must_change_password(db, int(user_id), False)
    db.commit()
    return {"data": {"message": "Password changed successfully"}}
