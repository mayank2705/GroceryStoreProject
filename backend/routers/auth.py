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


class SyncRequest(BaseModel):
    phoneNumber: str
    uid: str

@router.post("/sync", response_model=TokenResponse)
def sync_user(request: SyncRequest, db: Session = Depends(get_db)):
    """Accepts verified phone number and UID from Firebase frontend and creates/retrieves user."""
    # Format phoneNumber replacing +91 if needed or just use as is
    mobile = request.phoneNumber
    if mobile.startswith('+91'):
        mobile = mobile[3:]
        
    user = db.query(User).filter(User.mobile == mobile).first()
    if not user:
        user = User(mobile=mobile)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate token
    token_data = {"user_id": user.id, "mobile": user.mobile, "firebase_uid": request.uid}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        is_profile_complete=user.is_profile_complete,
    )

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
