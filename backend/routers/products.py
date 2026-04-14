from fastapi import APIRouter, Depends, Query, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timedelta
from typing import Optional, List
from database import get_db
from models import Category, Product
from schemas import CategoryResponse, ProductResponse, ProductCreate
from routers.auth import get_current_user

router = APIRouter(prefix="/api", tags=["products", "admin"])

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Get all categories."""
    return db.query(Category).all()

@router.get("/products/recent", response_model=List[ProductResponse])
def get_recent_products(db: Session = Depends(get_db)):
    """Fetch products added within the last 24 hours."""
    yesterday = datetime.utcnow() - timedelta(days=1)
    return db.query(Product).filter(Product.created_at >= yesterday).order_by(desc(Product.created_at)).all()

@router.get("/products", response_model=List[ProductResponse])
def get_products(
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    """Get products, optionally filtered by category_id."""
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    return query.all()

# --- ADMIN ENDPOINTS ---

@router.post("/admin/products/add", response_model=ProductResponse)
def add_product(
    product: ProductCreate,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)
    # We allow adding via dummy auth token for the demo
    
    cat = db.query(Category).filter(Category.id == product.category_id).first()
    if not cat:
        raise HTTPException(404, "Category not found")
        
    db_prod = Product(
        name=product.name,
        price=product.price,
        category_id=product.category_id,
        image_url=product.image_url or "https://source.unsplash.com/400x400/?grocery",
        in_stock=True
    )
    db.add(db_prod)
    db.commit()
    db.refresh(db_prod)
    return db_prod

@router.put("/admin/products/{product_id}/toggle_stock", response_model=ProductResponse)
def toggle_stock(
    product_id: int,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)
    
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(404, "Product not found")
        
    prod.in_stock = not prod.in_stock
    db.commit()
    db.refresh(prod)
    return prod


@router.put("/admin/products/{product_id}/edit", response_model=ProductResponse)
def edit_product(
    product_id: int,
    updates: dict,
    authorization: str = Header(...),
    db: Session = Depends(get_db)
):
    token = authorization.replace("Bearer ", "")
    user = get_current_user(token, db)
    
    prod = db.query(Product).filter(Product.id == product_id).first()
    if not prod:
        raise HTTPException(404, "Product not found")
        
    if "name" in updates:
        prod.name = updates["name"]
    if "price" in updates:
        prod.price = updates["price"]
    if "category_id" in updates:
        # verify category
        cat = db.query(Category).filter(Category.id == updates["category_id"]).first()
        if cat:
            prod.category_id = updates["category_id"]
    if "image_url" in updates:
        prod.image_url = updates["image_url"]

    db.commit()
    db.refresh(prod)
    return prod
