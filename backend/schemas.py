from pydantic import BaseModel, EmailStr, Field


class FarmerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    farm_location: str
    district: str
    state: str
    farm_size: float


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
class ProductCreate(BaseModel):
    crop_name: str
    quantity: float
    price_per_kg: float
    harvest_date: str | None = None
    quality: str | None = None
    description: str | None = None
class BuyerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    business_name: str
    buyer_type: str
    location: str
class OrderCreate(BaseModel):
    product_id: int
    quantity: float
class OrderStatusUpdate(BaseModel):
    status: str
class DeliveryStatusUpdate(BaseModel):
    status: str
class OrderReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    feedback: str = Field(min_length=1, max_length=2000)