"""Faculty router — mirrors facultyRoutes.js + facultyController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import faculty_service

router = APIRouter(
    prefix="/api/faculty",
    tags=["Faculty"],
    dependencies=[Depends(require_roles("admin", "registrar", "teacher"))],
)


class FacultyCreate(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    title: str
    department_id: int
    faculty_number: Optional[str] = None
    office_location: Optional[str] = None
    is_active: Optional[bool] = True


class FacultyUpdate(BaseModel):
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    title: Optional[str] = None
    department_id: Optional[int] = None
    faculty_number: Optional[str] = None
    office_location: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("")
def list_faculty(db: Session = Depends(get_db)):
    return faculty_service.list_faculty(db)


@router.post("", status_code=201)
def create_faculty(
    body: FacultyCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    return faculty_service.create_faculty(db, body.model_dump())


@router.get("/{faculty_id}")
def get_faculty(faculty_id: int, db: Session = Depends(get_db)):
    faculty = faculty_service.get_faculty_by_id(db, faculty_id)
    if not faculty:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return faculty


@router.put("/{faculty_id}")
def update_faculty(
    faculty_id: int,
    body: FacultyUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    updated = faculty_service.update_faculty(db, faculty_id, body.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Faculty not found")
    return updated


@router.delete("/{faculty_id}", status_code=204)
def delete_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    deleted = faculty_service.delete_faculty(db, faculty_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Faculty not found")
