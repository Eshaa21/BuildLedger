from datetime import date

from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.database import Base


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    expense_date = Column(
        Date,
        default=date.today,
        nullable=False
    )

    category = Column(
        String(100),
        nullable=False
    )

    description = Column(
        String(255),
        nullable=False
    )

    paid_to = Column(
        String(150),
        nullable=True
    )

    amount = Column(
        Float,
        nullable=False
    )

    user = relationship("User", back_populates="expenses")