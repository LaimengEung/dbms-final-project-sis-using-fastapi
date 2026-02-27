"""Enrollments router — mirrors enrollmentRoutes.js + enrollmentController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import enrollment_service

router = APIRouter(
    prefix="/api/enrollments",
    tags=["Enrollments"],
    dependencies=[Depends(require_roles("admin", "registrar", "teacher", "student"))],
)


class EnrollmentCreate(BaseModel):
    student_id: int
    section_id: int
    status: Optional[str] = "enrolled"


class EnrollmentUpdate(BaseModel):
    status: str


@router.get("")
def list_enrollments(
    page: int = Query(1),
    limit: int = Query(10),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    semester_id: Optional[int] = Query(None),
    section_id: Optional[int] = Query(None),
    student_id: Optional[int] = Query(None),
    faculty_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("admin", "registrar", "teacher", "student")),
):
    # Students can only see their own enrollments
    if current_user["role"] == "student" and current_user.get("student_id"):
        student_id = current_user["student_id"]
    # Teachers can only see enrollments for their sections
    if current_user["role"] == "teacher" and current_user.get("faculty_id"):
        faculty_id = current_user["faculty_id"]

    return enrollment_service.list_enrollments(
        db,
        page=page,
        limit=limit,
        status=status,
        search=search,
        semester_id=semester_id,
        section_id=section_id,
        student_id=student_id,
        faculty_id=faculty_id,
    )


@router.post("", status_code=201)
def create_enrollment(
    body: EnrollmentCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    result = enrollment_service.create_enrollment(db, body.model_dump())
    if "error" in result:
        raise HTTPException(status_code=result["error"]["status"], detail=result["error"]["message"])
    return result["data"]


@router.get("/{enrollment_id}")
def get_enrollment(enrollment_id: int, db: Session = Depends(get_db)):
    enrollment = enrollment_service.get_enrollment_by_id(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrollment


@router.put("/{enrollment_id}")
def update_enrollment(
    enrollment_id: int,
    body: EnrollmentUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    result = enrollment_service.update_enrollment(db, enrollment_id, body.model_dump())
    if result is None:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=result["error"]["status"], detail=result["error"]["message"])
    return result


@router.delete("/{enrollment_id}", status_code=204)
def delete_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    deleted = enrollment_service.delete_enrollment(db, enrollment_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Enrollment not found")
