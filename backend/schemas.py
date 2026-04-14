from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Auth ---
class SendOTPRequest(BaseModel):
    mobile: str


class VerifyOTPRequest(BaseModel):
    mobile: str
    otp: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    is_profile_complete: bool


# --- User Profile ---
class UserProfileUpdate(BaseModel):
    full_name: str
    mobile: str
    address: str


class UserProfileResponse(BaseModel):
    id: int
    mobile: str
    full_name: Optional[str] = None
    address: Optional[str] = None
    is_profile_complete: bool
    is_admin: bool = False

    class Config:
        from_attributes = True


# --- Category ---
class CategoryResponse(BaseModel):
    id: int
    name: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


# --- Product ---
class ProductCreate(BaseModel):
    name: str
    price: float
    category_id: int
    image_url: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    price: float
    weight: str
    image_url: Optional[str] = None
    category_id: int
    in_stock: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

