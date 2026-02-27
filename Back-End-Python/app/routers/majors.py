"""Majors router — mirrors majorRoutes.js + majorController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import major_service

router = APIRouter(
    prefix="/api/majors",
    tags=["Majors"],
    dependencies=[Depends(require_roles("admin", "registrar"))],
)


class MajorCreate(BaseModel):
    major_code: str
    major_name: str
    department_id: Optional[int] = None
    required_credits: Optional[int] = 0
    description: Optional[str] = None


class MajorUpdate(BaseModel):
    major_code: Optional[str] = None
    major_name: Optional[str] = None
    department_id: Optional[int] = None
    required_credits: Optional[int] = None
    description: Optional[str] = None


@router.get("")
def list_majors(
    department_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    return major_service.list_majors(db, department_id=department_id)


@router.post("", status_code=201)
def create_major(body: MajorCreate, db: Session = Depends(get_db)):
    return major_service.create_major(db, body.model_dump())


@router.get("/{major_id}")
def get_major(major_id: int, db: Session = Depends(get_db)):
    major = major_service.get_major_by_id(db, major_id)
    if not major:
        raise HTTPException(status_code=404, detail="Major not found")
    return major


@router.put("/{major_id}")
def update_major(major_id: int, body: MajorUpdate, db: Session = Depends(get_db)):
    updated = major_service.update_major(db, major_id, body.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Major not found")
    return updated


@router.delete("/{major_id}", status_code=204)
def delete_major(major_id: int, db: Session = Depends(get_db)):
    deleted = major_service.delete_major(db, major_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Major not found")
