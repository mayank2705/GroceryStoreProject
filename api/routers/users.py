from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from api.database import get_db
from api.models import User
from api.schemas import UserProfileUpdate, UserProfileResponse
from api.routers.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["users"])

@router.get("/", response_model=UserProfileResponse)
def get_profile(authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)
    return user

@router.put("/", response_model=UserProfileResponse)
def update_profile(updates: UserProfileUpdate, authorization: str = Header(...), db: Session = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)
    
    user.full_name = updates.full_name
    user.address = updates.address
    user.whatsapp_number = updates.whatsapp_number
    
    # Mark as complete if everything is provided
    if user.full_name and user.address and user.whatsapp_number:
        user.is_profile_complete = True
        
    db.commit()
    db.refresh(user)
    return user
