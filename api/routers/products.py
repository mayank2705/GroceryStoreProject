from fastapi import APIRouter, Depends, Query, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta
from typing import Optional, List
from api.database import get_db
from api.models import Category, Product
from api.schemas import CategoryResponse, ProductResponse, ProductCreate, ProductUpdate
from api.routers.auth import get_current_user

router = APIRouter(prefix="/api", tags=["products", "admin"])

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("/products/recent", response_model=List[ProductResponse])
def get_recent_products(db: Session = Depends(get_db)):
    yesterday = datetime.utcnow() - timedelta(days=1)
    return db.query(Product).filter(Product.created_at >= yesterday).order_by(desc(Product.created_at)).all()

@router.get("/products", response_model=List[ProductResponse])
def get_products(
    category_id: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    return query.offset(offset).limit(limit).all()

