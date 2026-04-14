import pandas as pd
from sqlalchemy.orm import Session
from models import Category, Product
from database import SessionLocal, engine, Base

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

    try:
        # Read the CSV file
        df = pd.read_csv('BigBasket.csv')
        
        # Filter for relevant categories and drop missing product/price
        # Make sure columns match what we expect. Let's use 'Category'
        df_filtered = df[df['Category'].isin(relevant_categories)].dropna(subset=['ProductName', 'DiscountPrice'])
        
        # Take a sample of 200 items (or fewer if not enough exist)
        sample_size = min(200, len(df_filtered))
        df_sample = df_filtered.sample(n=sample_size, random_state=42)

        # 1. Insert Categories
        categories_dict = {}
        for cat_name in df_sample['Category'].unique():
            # Check if exists
            cat = db.query(Category).filter(Category.name == cat_name).first()
            if not cat:
                # Add a dummy Unsplash image based on the category name
                cat = Category(name=cat_name, image_url=None)
                db.add(cat)
                db.commit()
                db.refresh(cat)
            categories_dict[cat_name] = cat.id

        # 2. Insert Products
        db.query(Product).delete()
        db.commit()

        products_to_add = []
        for index, row in df_sample.iterrows():
            cat_name = row['Category']
            cat_id = categories_dict[cat_name]
            
            product = Product(
                name=str(row['ProductName']),
                price=float(row['DiscountPrice']),
                weight=str(row['Quantity']),
                image_url=str(row['Image_Url']) if pd.notnull(row['Image_Url']) else None,
                category_id=cat_id,
                in_stock=True
            )
            products_to_add.append(product)
        
        db.bulk_save_objects(products_to_add)
        db.commit()
        
        print(f"✅ Successfully seeded {len(products_to_add)} products across {len(categories_dict)} categories from BigBasket data.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
