"""Auth router — mirrors authRoutes.js + authController.js"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    result = auth_service.login(db, body.email, body.password)
    if "error" in result:
        raise HTTPException(status_code=result["error"]["status"], detail=result["error"]["message"])
    user = result["data"]
    token = auth_service.issue_access_token(user)
    return {
        "message": "Login successful",
        "data": {
            "user": user,
            "access_token": token,
            "token_type": "Bearer",
            "expires_in": "8h",
        },
    }


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    result = auth_service.forgot_password(db, body.email)
    if "error" in result:
        raise HTTPException(status_code=result["error"]["status"], detail=result["error"]["message"])
    return result["data"]


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    result = auth_service.reset_password(db, body.token, body.new_password)
    if "error" in result:
        raise HTTPException(status_code=result["error"]["status"], detail=result["error"]["message"])
    return result["data"]


@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = auth_service.change_password(
        db, current_user["user_id"], body.current_password, body.new_password
    )
    if "error" in result:
        raise HTTPException(status_code=result["error"]["status"], detail=result["error"]["message"])
    return result["data"]


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
