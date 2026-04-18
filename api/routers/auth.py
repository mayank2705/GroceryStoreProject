import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt
from pydantic import BaseModel
from api.database import get_db
from api.models import User
from api.schemas import SendOTPRequest, VerifyOTPRequest, TokenResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"

@router.post("/send_otp")
def send_otp(req: SendOTPRequest):
    # In real app, trigger Firebase SMS here or let client do it
    return {"message": "OTP sent"}

class SyncRequest(BaseModel):
    uid: str
    email: str
    name: Optional[str] = None
    whatsapp_number: Optional[str] = None

@router.post("/sync")
def sync_user(req: SyncRequest, db: Session = Depends(get_db)):
    # Check by firebase_uid
    user = db.query(User).filter(User.firebase_uid == req.uid).first()
    if not user:
        # Fallback to check by email only if email is provided
        if req.email and req.email.strip():
            user = db.query(User).filter(User.email == req.email).first()
        
        if user:
            user.firebase_uid = req.uid
        else:
            # Create new user
            user = User(
                firebase_uid=req.uid,
                email=req.email if req.email and req.email.strip() else None,
                full_name=req.name
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    # If whatsapp_number is provided, update the user
    if req.whatsapp_number:
        # Validate format or handle +91
        number = req.whatsapp_number
        if number.startswith('+91'):
            number = number[3:]
        user.whatsapp_number = number
        db.commit()
        db.refresh(user)

    has_whatsapp = bool(user.whatsapp_number)
    
    # Auto mark profile as complete if they have minimal required fields
    if user.whatsapp_number and user.address and user.full_name:
        if not user.is_profile_complete:
            user.is_profile_complete = True
            db.commit()

    token = jwt.encode({"sub": str(user.id)}, SECRET_KEY, algorithm=ALGORITHM)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "is_profile_complete": user.is_profile_complete,
        "has_whatsapp_number": has_whatsapp
    }

def get_current_user(token: str, db: Session) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(401, "User not found")
        return user
    except:
        raise HTTPException(401, "Invalid token")
