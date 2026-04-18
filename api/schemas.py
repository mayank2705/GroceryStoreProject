from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Auth ---
class SendOTPRequest(BaseModel):
    whatsapp_number: str


class VerifyOTPRequest(BaseModel):
    whatsapp_number: str
    firebase_uid: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    is_profile_complete: bool


# --- User Profile ---
class UserProfileUpdate(BaseModel):
    full_name: str
    whatsapp_number: str
    address: str


class UserProfileResponse(BaseModel):
    id: int
    whatsapp_number: Optional[str] = None
    email: Optional[str] = None
    firebase_uid: Optional[str] = None
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
    weight: Optional[str] = "1 pc"
    category_id: int
    image_url: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    weight: Optional[str] = None
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
