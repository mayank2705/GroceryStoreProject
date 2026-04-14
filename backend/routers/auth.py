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


class OTPLoginRequest(BaseModel):
    mobile: str
    firebase_uid: str

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(request: OTPLoginRequest, db: Session = Depends(get_db)):
    """Accepts verified phone number and UID from Firebase frontend."""
    # Find or create user
    user = db.query(User).filter(User.mobile == request.mobile).first()
    if not user:
        user = User(mobile=request.mobile)
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate token
    token_data = {"user_id": user.id, "mobile": user.mobile, "firebase_uid": request.firebase_uid}
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
