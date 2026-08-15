from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.database import Base


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    name = Column(
        String(150),
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=True
    )

    description = Column(
        String(255),
        nullable=True
    )

    user = relationship(
        "User",
        back_populates="vendors"
    )

    expenses = relationship(
        "Expense",
        back_populates="vendor"
    )