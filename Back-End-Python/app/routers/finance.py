"""Finance router — mirrors financeRoutes.js + financeController.js"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.services import finance_service

router = APIRouter(
    prefix="/api/finance-records",
    tags=["Finance"],
    dependencies=[Depends(require_roles("admin", "registrar"))],
)


class FinanceCreate(BaseModel):
    student_id: int
    semester_id: int
    amount: float
    transaction_type: str
    description: Optional[str] = None
    transaction_date: Optional[str] = None
    payment_method: Optional[str] = None
    reference_number: Optional[str] = None
    status: Optional[str] = "pending"


class FinanceUpdate(BaseModel):
    student_id: int
    semester_id: int
    amount: float
    transaction_type: str
    description: Optional[str] = None
    transaction_date: Optional[str] = None
    payment_method: Optional[str] = None
    reference_number: Optional[str] = None
    status: Optional[str] = "pending"


@router.get("")
def list_finance_records(
    student_id: Optional[int] = Query(None),
    semester_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return finance_service.list_finance_records(
        db,
        student_id=student_id,
        semester_id=semester_id,
        status=status,
        transaction_type=transaction_type,
    )


@router.post("", status_code=201)
def create_finance_record(body: FinanceCreate, db: Session = Depends(get_db)):
    return finance_service.create_finance_record(db, body.model_dump())


@router.get("/{finance_id}")
def get_finance_record(finance_id: int, db: Session = Depends(get_db)):
    record = finance_service.get_finance_by_id(db, finance_id)
    if not record:
        raise HTTPException(status_code=404, detail="Finance record not found")
    return record


@router.put("/{finance_id}")
def update_finance_record(finance_id: int, body: FinanceUpdate, db: Session = Depends(get_db)):
    updated = finance_service.update_finance_record(db, finance_id, body.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Finance record not found")
    return updated


@router.delete("/{finance_id}", status_code=204)
def delete_finance_record(finance_id: int, db: Session = Depends(get_db)):
    deleted = finance_service.delete_finance_record(db, finance_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Finance record not found")
