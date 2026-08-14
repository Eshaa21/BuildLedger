from fastapi import Depends, FastAPI
from sqlalchemy import text

from backend.database import Base, engine
from backend.dependencies import get_current_user
from backend.models.expense import Expense
from backend.models.user import User
from backend.routers.auth import router as auth_router
from backend.routers.expenses import router as expenses_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title="BuildLedger")

app.include_router(auth_router)
app.include_router(expenses_router)


@app.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email
    }


@app.get("/")
def root():
    return {
        "message": "BuildLedger API is running"
    }


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "connection failed",
            "error": str(e)
        }