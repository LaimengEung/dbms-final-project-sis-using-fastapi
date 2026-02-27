"""Mirrors Back-End/src/services/authSecurityService.js"""

import hashlib
import os
import secrets
from datetime import datetime, timedelta

from sqlalchemy import text
from sqlalchemy.orm import Session

_initialized = False


def ensure_auth_security_schema(db: Session) -> None:
    global _initialized
    if _initialized:
        return

    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS user_security (
                user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
                must_change_password BOOLEAN NOT NULL DEFAULT false,
                reset_token_hash VARCHAR(255),
                reset_token_expires_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
    )
    db.execute(
        text(
            """
            INSERT INTO user_security (user_id, must_change_password)
            SELECT user_id, false FROM users
            ON CONFLICT (user_id) DO NOTHING
            """
        )
    )
    db.commit()
    _initialized = True


def get_security_by_user_id(db: Session, user_id: int) -> dict | None:
    ensure_auth_security_schema(db)
    row = db.execute(
        text(
            "SELECT user_id, must_change_password, reset_token_hash, reset_token_expires_at "
            "FROM user_security WHERE user_id = :uid"
        ),
        {"uid": user_id},
    ).mappings().first()
    return dict(row) if row else None


def set_must_change_password(db: Session, user_id: int, must_change: bool) -> None:
    ensure_auth_security_schema(db)
    db.execute(
        text(
            """
            INSERT INTO user_security (user_id, must_change_password, updated_at)
            VALUES (:uid, :must, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET must_change_password = EXCLUDED.must_change_password,
                          updated_at = NOW()
            """
        ),
        {"uid": user_id, "must": must_change},
    )
    db.commit()


def issue_password_reset_token(db: Session, user_id: int) -> dict:
    ensure_auth_security_schema(db)
    token = secrets.token_hex(24)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    expires_at = datetime.utcnow() + timedelta(minutes=30)

    db.execute(
        text(
            """
            INSERT INTO user_security (user_id, reset_token_hash, reset_token_expires_at, updated_at)
            VALUES (:uid, :hash, :exp, NOW())
            ON CONFLICT (user_id)
            DO UPDATE SET reset_token_hash = EXCLUDED.reset_token_hash,
                          reset_token_expires_at = EXCLUDED.reset_token_expires_at,
                          updated_at = NOW()
            """
        ),
        {"uid": user_id, "hash": token_hash, "exp": expires_at},
    )
    db.commit()
    return {"token": token, "expires_at": expires_at.isoformat()}


def consume_password_reset_token(db: Session, token: str) -> dict | None:
    ensure_auth_security_schema(db)
    token_hash = hashlib.sha256(str(token or "").encode()).hexdigest()

    row = db.execute(
        text(
            """
            SELECT user_id FROM user_security
            WHERE reset_token_hash = :hash
              AND reset_token_expires_at IS NOT NULL
              AND reset_token_expires_at > NOW()
            LIMIT 1
            """
        ),
        {"hash": token_hash},
    ).mappings().first()

    if not row:
        return None

    user_id = int(row["user_id"])
    db.execute(
        text(
            """
            UPDATE user_security
            SET reset_token_hash = NULL,
                reset_token_expires_at = NULL,
                must_change_password = false,
                updated_at = NOW()
            WHERE user_id = :uid
            """
        ),
        {"uid": user_id},
    )
    db.commit()
    return {"user_id": user_id}
