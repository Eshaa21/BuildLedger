from pydantic import BaseModel


class VendorCreate(BaseModel):
    name: str
    phone: str | None = None
    description: str | None = None


class VendorResponse(BaseModel):
    id: int
    user_id: int
    name: str
    phone: str | None
    description: str | None

    class Config:
        from_attributes = True