from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from api.database import get_db
from api.models import Order
from api.schemas import OrderCreate, OrderResponse

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    db_order = Order(
        firebase_uid=order.firebase_uid,
        items=order.items,
        total_price=order.total_price
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return db_order

@router.get("/{firebase_uid}", response_model=List[OrderResponse])
def get_orders(firebase_uid: str, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.firebase_uid == firebase_uid).order_by(desc(Order.id)).all()
    return orders
