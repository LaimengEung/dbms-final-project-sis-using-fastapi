"""Sections router — mirrors sectionRoutes.js + sectionController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import section_service

router = APIRouter(
    prefix="/api/sections",
    tags=["Sections"],
    dependencies=[Depends(require_roles("admin", "registrar", "teacher", "student"))],
)


class SectionUpdate(BaseModel):
    faculty_id: Optional[int] = None
    classroom: Optional[str] = None
    schedule: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    max_capacity: Optional[int] = 30
    status: Optional[str] = "open"


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


@router.put("/{section_id}")
def update_section(
    section_id: int,
    body: SectionUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    updated = section_service.update_section(db, section_id, body.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Section not found")
    return updated


@router.delete("/{section_id}", status_code=204)
def delete_section(
    section_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    deleted = section_service.delete_section(db, section_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Section not found")
