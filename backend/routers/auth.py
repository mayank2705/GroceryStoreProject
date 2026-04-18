from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt
from database import get_db
from models import User
from schemas import SendOTPRequest, VerifyOTPRequest, TokenResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])

SECRET_KEY = "mohit-store-secret-key-2024"
ALGORITHM = "HS256"
DUMMY_OTP = "1234"


from typing import Optional

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
        # Fallback to check by email
        user = db.query(User).filter(User.email == req.email).first()
        if user:
            user.firebase_uid = req.uid
        else:
            # Create new user
            user = User(
                firebase_uid=req.uid,
                email=req.email,
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

    token_data = {"user_id": user.id, "firebase_uid": req.uid}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "is_profile_complete": user.is_profile_complete,
        "has_whatsapp_number": has_whatsapp
    }

def get_current_user(token: str, db: Session):
    """Decode JWT token and return the user."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
