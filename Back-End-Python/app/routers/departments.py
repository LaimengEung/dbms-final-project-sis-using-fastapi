"""Departments router — mirrors departmentRoutes.js + departmentController.js"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import department_service

router = APIRouter(
    prefix="/api/departments",
    tags=["Departments"],
    dependencies=[Depends(require_roles("admin", "registrar"))],
)


@router.get("")
def list_departments(db: Session = Depends(get_db)):
    return department_service.list_departments(db)


@router.get("/{department_id}")
def get_department(department_id: int, db: Session = Depends(get_db)):
    dept = department_service.get_department_by_id(db, department_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return dept
