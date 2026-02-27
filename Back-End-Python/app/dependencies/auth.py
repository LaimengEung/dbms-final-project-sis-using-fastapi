import os
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

security = HTTPBearer(auto_error=False)

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALGORITHM = "HS256"


def _get_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> str:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization token",
        )
    return credentials.credentials


def get_current_user(
    token: str = Depends(_get_token),
    db: Session = Depends(get_db),
) -> dict:
    """Mirrors the JS `authenticate` middleware.
    Decodes the JWT; enriches with student_id / faculty_id from the DB.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    row = db.execute(
        text(
            """
            SELECT u.user_id, s.student_id, f.faculty_id
            FROM users u
            LEFT JOIN students s ON s.user_id = u.user_id
            LEFT JOIN faculty f  ON f.user_id  = u.user_id
            WHERE u.user_id = :uid
            LIMIT 1
            """
        ),
        {"uid": int(user_id)},
    ).mappings().first()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return {
        "user_id": int(user_id),
        "email": payload.get("email"),
        "role": payload.get("role"),
        "student_id": int(row["student_id"]) if row["student_id"] is not None else None,
        "faculty_id": int(row["faculty_id"]) if row["faculty_id"] is not None else None,
    }


def require_roles(*allowed_roles: str):
    """Factory that returns a FastAPI dependency enforcing role-based access.
    Mirrors `authorizeRoles(...roles)` from the JS middleware.
    """
    from app.utils.mappers import normalize_role

    normalized_allowed = {normalize_role(r) for r in allowed_roles}

    def _check(current_user: dict = Depends(get_current_user)):
        from app.utils.mappers import normalize_role as nr
        role = nr(current_user.get("role", ""))
        if role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: insufficient role privileges",
            )
        return current_user

    return _check
