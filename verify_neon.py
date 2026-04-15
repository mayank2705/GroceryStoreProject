import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import from api to get the correct BaseModel
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from api.models import Product, Category

# Use the exact DB URL from the .env for our confirmation
from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Connecting to: {DATABASE_URL[:30]}...[redacted]")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    product_count = db.query(Product).count()
    category_count = db.query(Category).count()
    print(f"✅ Connection successful!")
    print(f"📊 Discovered {product_count} products across {category_count} categories in the Neon Database.")
    
    # Let's show a sample of one product to be 100% sure
    sample = db.query(Product).first()
    if sample:
         print(f"\nSample Product: {sample.name}")
         print(f"Price: {sample.price}")
         print(f"Category ID: {sample.category_id}")
         print(f"Image URL: {sample.image_url[:50]}..." if sample.image_url else "No image")
finally:
    db.close()
