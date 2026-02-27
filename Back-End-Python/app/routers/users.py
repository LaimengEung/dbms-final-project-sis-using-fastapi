"""Users router — mirrors userRoutes.js + userController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import user_service

router = APIRouter(
    prefix="/api/users",
    tags=["Users"],
    dependencies=[Depends(require_roles("admin"))],
)


class UserCreate(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    role: str = "student"


class UserUpdate(BaseModel):
    email: str
    first_name: str
    last_name: str
    role: str
    password: Optional[str] = None


class UserPatch(BaseModel):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


@router.get("")
def list_users(
    search: Optional[str] = Query(None),
    page: int = Query(1),
    limit: int = Query(10),
    db: Session = Depends(get_db),
):
    return user_service.list_users(db, search=search, page=page, limit=limit)


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return user_service.get_user_stats(db)


@router.post("", status_code=201)
def create_user(body: UserCreate, db: Session = Depends(get_db)):
    return user_service.create_user(db, body.model_dump())


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{user_id}")
def update_user(user_id: int, body: UserUpdate, db: Session = Depends(get_db)):
    updated = user_service.update_user(db, user_id, body.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@router.patch("/{user_id}")
def patch_user(user_id: int, body: UserPatch, db: Session = Depends(get_db)):
    updated = user_service.patch_user(db, user_id, body.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return updated


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    deleted = user_service.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
