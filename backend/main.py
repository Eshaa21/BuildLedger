from fastapi import FastAPI
from sqlalchemy import text

from backend.database import engine

app = FastAPI(title="BuildLedger")


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