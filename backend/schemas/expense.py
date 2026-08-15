from datetime import date

from pydantic import BaseModel, Field


class ExpenseCreate(BaseModel):
    expense_date: date
    category: str
    description: str
    paid_to: str | None = None
    vendor_id: int | None = None
    amount: float = Field(gt=0)


class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    vendor_id: int | None
    expense_date: date
    category: str
    description: str
    paid_to: str | None
    amount: float

    class Config:
        from_attributes = True