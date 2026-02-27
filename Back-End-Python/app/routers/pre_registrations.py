"""Pre-registrations router — mirrors preRegistrationRoutes.js + preRegistrationController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import pre_registration_service

router = APIRouter(
    prefix="/api/pre-registrations",
    tags=["Pre-Registrations"],
    dependencies=[Depends(require_roles("admin", "registrar", "teacher", "student"))],
)


class PreRegCreate(BaseModel):
    student_id: int
    section_id: int
    semester_id: int
    status: Optional[str] = "pending"
    approved_by: Optional[int] = None
    approved_date: Optional[str] = None
    notes: Optional[str] = None


class PreRegUpdate(BaseModel):
    student_id: int
    section_id: int
    semester_id: int
    status: Optional[str] = "pending"
    approved_by: Optional[int] = None
    approved_date: Optional[str] = None
    notes: Optional[str] = None


@router.get("")
def list_pre_regs(
    student_id: Optional[int] = Query(None),
    semester_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("admin", "registrar", "teacher", "student")),
):
    if current_user["role"] == "student" and current_user.get("student_id"):
        student_id = current_user["student_id"]
    return pre_registration_service.list_pre_regs(
        db, student_id=student_id, semester_id=semester_id, status=status
    )


@router.post("", status_code=201)
def create_pre_reg(body: PreRegCreate, db: Session = Depends(get_db)):
    return pre_registration_service.create_pre_reg(db, body.model_dump())


@router.get("/{pre_reg_id}")
def get_pre_reg(pre_reg_id: int, db: Session = Depends(get_db)):
    pre_reg = pre_registration_service.get_pre_reg_by_id(db, pre_reg_id)
    if not pre_reg:
        raise HTTPException(status_code=404, detail="Pre-registration not found")
    return pre_reg


@router.put("/{pre_reg_id}")
def update_pre_reg(
    pre_reg_id: int,
    body: PreRegUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("admin", "registrar", "teacher")),
):
    updated = pre_registration_service.update_pre_reg(db, pre_reg_id, body.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Pre-registration not found")
    return updated


@router.delete("/{pre_reg_id}", status_code=204)
def delete_pre_reg(
    pre_reg_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_roles("admin", "registrar", "student")),
):
    # Students can only cancel their own pending pre-registration
    if current_user["role"] == "student":
        pre_reg = pre_registration_service.get_pre_reg_by_id(db, pre_reg_id)
        if not pre_reg:
            raise HTTPException(status_code=404, detail="Pre-registration not found")
        if pre_reg.get("student_id") != current_user.get("student_id"):
            raise HTTPException(status_code=403, detail="Forbidden: cannot cancel another student's pre-registration")
    deleted = pre_registration_service.delete_pre_reg(db, pre_reg_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Pre-registration not found")
