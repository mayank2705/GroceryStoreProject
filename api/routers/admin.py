from fastapi import APIRouter, Depends, Query, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta
from typing import Optional, List
from api.database import get_db
from api.models import Category, Product, User
from api.schemas import ProductResponse, ProductCreate, ProductUpdate
from api.routers.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])

def verify_admin(authorization: str = Header(...), db: Session = Depends(get_db)) -> User:
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)
    if user.email != "mayankbansal231@gmail.com":
        raise HTTPException(status_code=403, detail="Forbidden: Admin access required")
    return user

@router.get("/products", response_model=List[ProductResponse])
def get_admin_products(
    category_id: Optional[int] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user: User = Depends(verify_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    return query.order_by(desc(Product.id)).offset(offset).limit(limit).all()

@router.post("/products", response_model=ProductResponse)
def add_product(product: ProductCreate, user: User = Depends(verify_admin), db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == product.category_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
        
    db_prod = Product(
        name=product.name,
        price=product.price,
        weight=product.weight,
        category_id=product.category_id,
        image_url=product.image_url or "https://source.unsplash.com/400x400/?grocery",
        in_stock=True
    )
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    return db_prod

@router.put("/products/{product_id}", response_model=ProductResponse)
def edit_product(product_id: int, updates: ProductUpdate, user: User = Depends(verify_admin), db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(404, "Product not found")
        
    update_data = updates.dict(exclude_unset=True)
    
    if "category_id" in update_data:
        cat = db.query(Category).filter(Category.id == update_data["category_id"]).first()
        if not cat:
            raise HTTPException(404, "Category not found")

    for key, value in update_data.items():
        setattr(prod, key, value)

    db.commit()
    db.refresh(prod)
    return prod

@router.put("/products/{product_id}/toggle_stock", response_model=ProductResponse)
def toggle_stock(product_id: int, user: User = Depends(verify_admin), db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(404, "Product not found")
        
    prod.in_stock = not prod.in_stock
    db.commit()
    db.refresh(prod)
    return prod

@router.delete("/products/{product_id}")
def delete_product(product_id: int, user: User = Depends(verify_admin), db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(404, "Product not found")
        
    db.delete(prod)
    db.commit()
    return {"message": "Product deleted successfully"}
