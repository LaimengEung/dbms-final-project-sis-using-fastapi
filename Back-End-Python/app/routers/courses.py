"""Courses router — mirrors courseRoutes.js + courseController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import course_service, section_service

router = APIRouter(
    prefix="/api/courses",
    tags=["Courses"],
    dependencies=[Depends(require_roles("admin", "registrar", "teacher", "student"))],
)


class CourseCreate(BaseModel):
    course_code: str
    course_name: str
    description: Optional[str] = None
    credits: int = 3
    department_id: Optional[int] = None


class CourseUpdate(BaseModel):
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    description: Optional[str] = None
    credits: Optional[int] = None
    department_id: Optional[int] = None


class SectionCreate(BaseModel):
    semester_id: int
    section_number: Optional[str] = None
    section_csn: Optional[str] = None
    faculty_id: Optional[int] = None
    classroom: Optional[str] = None
    schedule: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    max_capacity: Optional[int] = 30
    status: Optional[str] = "open"


@router.get("")
def list_courses(db: Session = Depends(get_db)):
    return course_service.list_courses(db)


@router.post("", status_code=201)
def create_course(
    body: CourseCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    return course_service.create_course(db, body.model_dump())


@router.get("/{course_id}")
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = course_service.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.put("/{course_id}")
def update_course(
    course_id: int,
    body: CourseUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    updated = course_service.update_course(db, course_id, body.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated


@router.delete("/{course_id}", status_code=204)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    deleted = course_service.delete_course(db, course_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Course not found")


@router.post("/{course_id}/sections", status_code=201)
def create_section(
    course_id: int,
    body: SectionCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    section = section_service.create_section_for_course(db, course_id, body.model_dump())
    if not section:
        raise HTTPException(status_code=404, detail="Course not found")
    return section
