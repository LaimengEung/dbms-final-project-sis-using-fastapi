"""Students router — mirrors studentRoutes.js + studentController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import student_service

router = APIRouter(
    prefix="/api/students",
    tags=["Students"],
    dependencies=[Depends(require_roles("admin", "registrar", "student"))],
)


class StudentCreate(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    classification: Optional[int] = 1
    major_id: Optional[int] = None
    major_name: Optional[str] = None
    student_number: Optional[str] = None
    admission_date: Optional[str] = None
    credits_earned: Optional[int] = 0
    gpa: Optional[float] = 0.0
    academic_standing: Optional[str] = "good"
    advisor_id: Optional[int] = None


class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    classification: Optional[int] = None
    major_id: Optional[int] = None
    major_name: Optional[str] = None
    student_number: Optional[str] = None
    admission_date: Optional[str] = None
    credits_earned: Optional[int] = None
    gpa: Optional[float] = None
    academic_standing: Optional[str] = None


@router.get("")
def list_students(
    search: Optional[str] = Query(None),
    limit: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("admin", "registrar", "student")),
):
    student_id = None
    if current_user["role"] == "student" and current_user.get("student_id"):
        student_id = current_user["student_id"]

    return student_service.list_students(db, search=search, limit=limit, student_id=student_id)


@router.post("", status_code=201)
def create_student(
    body: StudentCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    try:
        return student_service.create_student(db, body.model_dump())
    except ValueError as e:
        status_code = getattr(e, "status_code", 409)
        raise HTTPException(status_code=status_code, detail=str(e))


@router.get("/{student_id}")
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("admin", "registrar", "student")),
):
    if current_user["role"] == "student" and current_user.get("student_id") != student_id:
        raise HTTPException(status_code=403, detail="Forbidden: insufficient role privileges")
    student = student_service.get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.put("/{student_id}")
def update_student(
    student_id: int,
    body: StudentUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    updated = student_service.update_student(db, student_id, body.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Student not found")
    return updated


@router.delete("/{student_id}", status_code=204)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    deleted = student_service.delete_student(db, student_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Student not found")


@router.get("/{student_id}/enrollments")
def get_student_enrollments(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("admin", "registrar", "student")),
):
    if current_user["role"] == "student" and current_user.get("student_id") != student_id:
        raise HTTPException(status_code=403, detail="Forbidden: insufficient role privileges")
    return student_service.get_student_enrollments(db, student_id)
