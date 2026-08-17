from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.dependencies import get_current_user
from backend.models.category import Category
from backend.models.expense import Expense
from backend.models.user import User
from backend.schemas.expense import (
    ExpenseCreate,
    ExpenseResponse,
    ExpenseUpdate
)


router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.get("/", response_model=list[ExpenseResponse])
def get_expenses(
    category: str | None = Query(default=None),
    expense_date: date | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Expense).filter(
        Expense.user_id == current_user.id
    )

    if category:
        query = query.filter(
            Expense.category == category
        )

    if expense_date:
        query = query.filter(
            Expense.expense_date == expense_date
        )

    return query.all()


@router.post("/", response_model=ExpenseResponse)
def create_expense(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = None

    if expense_data.category_id is not None:
        category = db.query(Category).filter(
            Category.id == expense_data.category_id,
            Category.user_id == current_user.id
        ).first()

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

    new_expense = Expense(
        user_id=current_user.id,
        vendor_id=expense_data.vendor_id,
        category_id=expense_data.category_id,
        expense_date=expense_data.expense_date,
        category=category.name if category else expense_data.category,
        description=expense_data.description,
        paid_to=expense_data.paid_to,
        amount=expense_data.amount,
        payment_method=expense_data.payment_method
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    category = None

    if expense_data.category_id is not None:
        category = db.query(Category).filter(
            Category.id == expense_data.category_id,
            Category.user_id == current_user.id
        ).first()

        if not category:
            raise HTTPException(
                status_code=404,
                detail="Category not found"
            )

    expense.expense_date = expense_data.expense_date
    expense.category_id = expense_data.category_id
    expense.category = category.name if category else expense_data.category
    expense.description = expense_data.description
    expense.paid_to = expense_data.paid_to
    expense.vendor_id = expense_data.vendor_id
    expense.amount = expense_data.amount
    expense.payment_method = expense_data.payment_method

    db.commit()
    db.refresh(expense)

    return expense


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return expense


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    db.delete(expense)
    db.commit()

    return {
        "message": "Expense deleted successfully"
    }