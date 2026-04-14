import pandas as pd
from sqlalchemy.orm import Session
from api.models import Category, Product
from api.database import SessionLocal, engine, Base

Base.metadata.create_all(bind=engine)

def seed_database():
    db: Session = SessionLocal()
    relevant_categories = ['Foodgrains, Oil & Masala', 'Snacks & Branded Foods', 'Bakery, Cakes & Dairy', 'Beverages']

    try:
        df = pd.read_csv('api/BigBasket.csv')  # path varies if run from root vs api dir
        # If run from root, standard pandas reads 'BigBasket.csv' wait it's in `api/` now!
        pass
    except:
        try:
            df = pd.read_csv('BigBasket.csv')
        except:
            print("CSV not found")
            return
            
    try:
        df_filtered = df[df['Category'].isin(relevant_categories)].dropna(subset=['ProductName', 'DiscountPrice'])
        sample_size = min(200, len(df_filtered))
        df_sample = df_filtered.sample(n=sample_size, random_state=42)

        categories_dict = {}
        for cat_name in df_sample['Category'].unique():
            cat = db.query(Category).filter(Category.name == cat_name).first()
            if not cat:
                cat = Category(name=cat_name, image_url=None)
                db.add(cat)
                db.commit()
                db.refresh(cat)
            categories_dict[cat_name] = cat.id

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
    except Exception as e:
        pass
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
