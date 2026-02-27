"""Departments router — mirrors departmentRoutes.js + departmentController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import department_service

router = APIRouter(
    prefix="/api/departments",
    tags=["Departments"],
    dependencies=[Depends(require_roles("admin", "registrar"))],
)


class DepartmentCreate(BaseModel):
    department_code: str
    department_name: str
    description: Optional[str] = None


class DepartmentUpdate(BaseModel):
    department_code: Optional[str] = None
    department_name: Optional[str] = None
    description: Optional[str] = None


@router.get("")
def list_departments(db: Session = Depends(get_db)):
    return department_service.list_departments(db)


@router.post("", status_code=201)
def create_department(
    body: DepartmentCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin")),
):
    return department_service.create_department(db, body.model_dump())


@router.get("/{department_id}")
def get_department(department_id: int, db: Session = Depends(get_db)):
    dept = department_service.get_department_by_id(db, department_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept


@router.put("/{department_id}")
def update_department(
    department_id: int,
    body: DepartmentUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin")),
):
    updated = department_service.update_department(db, department_id, body.model_dump(exclude_none=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Department not found")
    return updated


@router.delete("/{department_id}", status_code=204)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin")),
):
    deleted = department_service.delete_department(db, department_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Department not found")
