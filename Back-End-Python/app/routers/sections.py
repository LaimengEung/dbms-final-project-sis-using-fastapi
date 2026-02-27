"""Sections router — mirrors sectionRoutes.js + sectionController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import section_service

router = APIRouter(
    prefix="/api/sections",
    tags=["Sections"],
    dependencies=[Depends(require_roles("admin", "registrar", "teacher", "student"))],
)


@router.get("")
def list_sections(
    semester_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    course_id: Optional[int] = Query(None),
    limit: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    return section_service.list_sections(
        db, semester_id=semester_id, status=status, course_id=course_id, limit=limit
    )


@router.get("/{section_id}")
def get_section(section_id: int, db: Session = Depends(get_db)):
    section = section_service.get_section_by_id(db, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section


@router.get("/{section_id}/capacity")
def get_capacity(section_id: int, db: Session = Depends(get_db)):
    capacity = section_service.get_section_capacity(db, section_id)
    if not capacity:
        raise HTTPException(status_code=404, detail="Section not found")
    return capacity
