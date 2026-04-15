import pandas as pd
from sqlalchemy.orm import Session
import os
import sys

from dotenv import load_dotenv
load_dotenv()

# Add root folder to sys path so we can import api module if executed from root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.models import Category, Product
from api.database import SessionLocal, engine, Base

# Ensure tables exist
Base.metadata.create_all(bind=engine)

def seed_database():
    db: Session = SessionLocal()

    # Define the relevant categories
    relevant_categories = [
        'Foodgrains, Oil & Masala',
        'Snacks & Branded Foods',
        'Bakery, Cakes & Dairy',
        'Beverages'
    ]

    csv_path = 'BigBasket.csv'
    if not os.path.exists(csv_path):
        csv_path = 'api/BigBasket.csv'
        if not os.path.exists(csv_path):
            csv_path = '../BigBasket.csv'

    try:
        print(f"Reading CSV from {csv_path}...")
        df = pd.read_csv(csv_path)
        
        # Filter for relevant categories and drop missing product/price
        df_filtered = df[df['Category'].isin(relevant_categories)].dropna(subset=['ProductName', 'DiscountPrice'])
        total_items = len(df_filtered)
        print(f"Total valid items to process: {total_items}")

        # 1. Insert Categories
        print("Ensuring categories exist...")
        categories_dict = {}
        for cat_name in df_filtered['Category'].unique():
            cat = db.query(Category).filter(Category.name == cat_name).first()
            if not cat:
                cat = Category(name=cat_name, image_url=None)
                db.add(cat)
                db.commit()
                db.refresh(cat)
            categories_dict[cat_name] = cat.id

        # 2. Insert Products
        print("Clearing existing products...")
        db.query(Product).delete()
        db.commit()

        print("Preparing product data mapped to SQLAlchemy models...")
        products_data = []
        for index, row in df_filtered.iterrows():
            cat_name = row['Category']
            cat_id = categories_dict[cat_name]
            
            product_dict = {
                "name": str(row['ProductName']),
                "price": float(row['DiscountPrice']),
                "weight": str(row['Quantity']) if pd.notnull(row['Quantity']) else "1 pc",
                "image_url": str(row['Image_Url']) if pd.notnull(row['Image_Url']) else None,
                "category_id": cat_id,
                "in_stock": True
            }
            products_data.append(product_dict)
        
        # Batch insert mechanism (batch size 1000)
        batch_size = 1000
        total_inserted = 0

        for i in range(0, total_items, batch_size):
            batch = products_data[i:i + batch_size]
            db.bulk_insert_mappings(Product, batch)
            db.commit()
            total_inserted += len(batch)
            print(f"✅ Uploaded batch: {total_inserted}/{total_items} items processed.")
        
        print(f"🎉 Successfully seeded {total_inserted} products across {len(categories_dict)} categories from BigBasket data.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
