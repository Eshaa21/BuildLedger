from datetime import date

from pydantic import BaseModel, Field


class ExpenseCreate(BaseModel):
    expense_date: date
    category: str
    description: str
    paid_to: str | None = None
    amount: float = Field(gt=0)


class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    expense_date: date
    category: str
    description: str
    paid_to: str | None
    amount: float

    class Config:
        from_attributes = True