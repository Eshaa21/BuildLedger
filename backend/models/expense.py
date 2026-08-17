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

    vendor_id = Column(
        Integer,
        ForeignKey("vendors.id"),
        nullable=True
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

    payment_method = Column(
        String(20),
        nullable=False,
        default="Cash"
    )

    user = relationship(
        "User",
        back_populates="expenses"
    )

    vendor = relationship(
        "Vendor",
        back_populates="expenses"
    )