"""Degree requirements router — mirrors degreeRequirementRoutes.js + degreeRequirementController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import degree_requirement_service

router = APIRouter(
    prefix="/api/degree-requirements",
    tags=["Degree Requirements"],
    dependencies=[Depends(require_roles("admin", "registrar"))],
)


class RequirementCreate(BaseModel):
    major_id: Optional[int] = None
    course_id: Optional[int] = None
    requirement_type: Optional[str] = None
    is_required: Optional[bool] = True
    credits: Optional[float] = None


class RequirementUpdate(BaseModel):
    major_id: Optional[int] = None
    course_id: Optional[int] = None
    requirement_type: Optional[str] = None
    is_required: Optional[bool] = True
    credits: Optional[float] = None


@router.get("")
def list_requirements(
    major_id: Optional[int] = Query(None),
    course_id: Optional[int] = Query(None),
    requirement_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return degree_requirement_service.list_requirements(
        db, major_id=major_id, course_id=course_id, requirement_type=requirement_type
    )


@router.post("", status_code=201)
def create_requirement(body: RequirementCreate, db: Session = Depends(get_db)):
    return degree_requirement_service.create_requirement(db, body.model_dump())


@router.get("/{requirement_id}")
def get_requirement(requirement_id: int, db: Session = Depends(get_db)):
    req = degree_requirement_service.get_requirement_by_id(db, requirement_id)
    if not req:
        raise HTTPException(status_code=404, detail="Degree requirement not found")
    return req


@router.put("/{requirement_id}")
def update_requirement(requirement_id: int, body: RequirementUpdate, db: Session = Depends(get_db)):
    updated = degree_requirement_service.update_requirement(db, requirement_id, body.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Degree requirement not found")
    return updated


@router.delete("/{requirement_id}", status_code=204)
def delete_requirement(requirement_id: int, db: Session = Depends(get_db)):
    deleted = degree_requirement_service.delete_requirement(db, requirement_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Degree requirement not found")
