import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.database import engine, Base
from api.models import User, Category, Product
from api.routers import auth, products, users, admin

# Create all tables (In production, use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mohit Store API")

# Add flexible CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(users.router)
app.include_router(admin.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
