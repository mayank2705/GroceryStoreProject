from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserProfileUpdate, UserProfileResponse
from routers.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/profile", response_model=UserProfileResponse)
def get_profile(authorization: str = Header(...), db: Session = Depends(get_db)):
    """Get current user's profile."""
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)
    return user


@router.put("/profile", response_model=UserProfileResponse)
def update_profile(
    profile: UserProfileUpdate,
    authorization: str = Header(...),
    db: Session = Depends(get_db),
):
    """Update user profile (name, mobile, address). Marks profile as complete."""
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)

    user.full_name = profile.full_name
    user.mobile = profile.mobile
    user.address = profile.address
    user.is_profile_complete = True

    db.commit()
    db.refresh(user)
    return user
