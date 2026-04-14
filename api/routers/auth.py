import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from jose import jwt
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

@router.post("/verify_otp", response_model=TokenResponse)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    # Verify via Firebase Admin SDK or trust the client passed UID
    user = db.query(User).filter(User.mobile == req.mobile).first()
    if not user:
        user = User(mobile=req.mobile)
        db.add(user)
        db.commit()
        db.refresh(user)

    token = jwt.encode({"sub": str(user.id)}, SECRET_KEY, algorithm=ALGORITHM)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "is_profile_complete": user.is_profile_complete
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
