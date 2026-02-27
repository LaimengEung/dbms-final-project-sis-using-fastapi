"""Grades router — mirrors gradeRoutes.js + gradeController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import grade_service

router = APIRouter(
    prefix="/api/grades",
    tags=["Grades"],
    dependencies=[Depends(require_roles("admin", "registrar", "teacher", "student"))],
)


class GradeCreate(BaseModel):
    enrollment_id: int
    letter_grade: Optional[str] = None
    numeric_grade: Optional[float] = None
    grade_points: Optional[float] = None
    semester_id: Optional[int] = None
    posted_date: Optional[str] = None
    posted_by: Optional[int] = None


class GradeUpdate(BaseModel):
    enrollment_id: int
    letter_grade: Optional[str] = None
    numeric_grade: Optional[float] = None
    grade_points: Optional[float] = None
    semester_id: Optional[int] = None
    posted_date: Optional[str] = None
    posted_by: Optional[int] = None


@router.get("")
def list_grades(
    student_id: Optional[int] = Query(None),
    enrollment_id: Optional[int] = Query(None),
    semester_id: Optional[int] = Query(None),
    faculty_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("admin", "registrar", "teacher", "student")),
):
    # Students only see their own grades
    if current_user["role"] == "student" and current_user.get("student_id"):
        student_id = current_user["student_id"]
    # Teachers only see grades for their sections
    if current_user["role"] == "teacher" and current_user.get("faculty_id"):
        faculty_id = current_user["faculty_id"]

    return grade_service.list_grades(
        db,
        student_id=student_id,
        enrollment_id=enrollment_id,
        semester_id=semester_id,
        faculty_id=faculty_id,
    )


@router.post("", status_code=201)
def create_grade(
    body: GradeCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar", "teacher")),
):
    return grade_service.create_grade(db, body.model_dump())


@router.get("/{grade_id}")
def get_grade(grade_id: int, db: Session = Depends(get_db)):
    grade = grade_service.get_grade_by_id(db, grade_id)
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    return grade


@router.put("/{grade_id}")
def update_grade(
    grade_id: int,
    body: GradeUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar", "teacher")),
):
    updated = grade_service.update_grade(db, grade_id, body.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Grade not found")
    return updated


@router.delete("/{grade_id}", status_code=204)
def delete_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    deleted = grade_service.delete_grade(db, grade_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Grade not found")
