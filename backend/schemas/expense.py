from datetime import date

from pydantic import BaseModel, Field


class ExpenseCreate(BaseModel):
    expense_date: date
    category: str
    category_id: int | None = None
    description: str
    paid_to: str | None = None
    vendor_id: int | None = None
    amount: float = Field(gt=0)
    payment_method: str = "Cash"


class ExpenseUpdate(BaseModel):
    expense_date: date
    category: str
    category_id: int | None = None
    description: str
    paid_to: str | None = None
    vendor_id: int | None = None
    amount: float = Field(gt=0)
    payment_method: str = "Cash"


class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    vendor_id: int | None
    category_id: int | None
    expense_date: date
    category: str
    description: str
    paid_to: str | None
    amount: float
    payment_method: str

    class Config:
        from_attributes = True