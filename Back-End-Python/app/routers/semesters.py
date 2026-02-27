"""Semesters router — mirrors semesterRoutes.js + semesterController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import semester_service

router = APIRouter(
    prefix="/api/semesters",
    tags=["Semesters"],
    dependencies=[Depends(require_roles("admin", "registrar", "teacher", "student"))],
)


class SemesterCreate(BaseModel):
    semester_name: str
    semester_year: int
    start_date: str
    end_date: str
    registration_start: str
    registration_end: str
    is_current: Optional[bool] = False


class SemesterUpdate(BaseModel):
    semester_name: Optional[str] = None
    semester_year: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    registration_start: Optional[str] = None
    registration_end: Optional[str] = None
    is_current: Optional[bool] = None


@router.get("")
def list_semesters(
    limit: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    return semester_service.list_semesters(db, limit=limit)


@router.post("", status_code=201)
def create_semester(
    body: SemesterCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    result = semester_service.create_semester(db, body.model_dump())
    if "error" in result:
        raise HTTPException(status_code=result["error"]["status"], detail=result["error"]["message"])
    return result["data"]


@router.get("/{semester_id}")
def get_semester(semester_id: int, db: Session = Depends(get_db)):
    semester = semester_service.get_semester_by_id(db, semester_id)
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")
    return semester


@router.put("/{semester_id}")
def update_semester(
    semester_id: int,
    body: SemesterUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    result = semester_service.update_semester(db, semester_id, body.model_dump(exclude_none=True))
    if result is None:
        raise HTTPException(status_code=404, detail="Semester not found")
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=result["error"]["status"], detail=result["error"]["message"])
    return result["data"]


@router.patch("/{semester_id}/set-current")
def set_current(
    semester_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    semester = semester_service.set_current_semester(db, semester_id)
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")
    return semester


@router.delete("/{semester_id}", status_code=204)
def delete_semester(
    semester_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar")),
):
    deleted = semester_service.delete_semester(db, semester_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Semester not found")
