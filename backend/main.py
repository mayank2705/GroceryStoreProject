from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from seed import seed_database
from routers import auth, users, products

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mohit Store API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)


@app.on_event("startup")
def on_startup():
    print("Server started. Database seeding is handled manually now.")



@app.get("/")
def root():
    return {"message": "Welcome to Mohit Store API", "owner": "Dhan Prakash"}
