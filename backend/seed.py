from sqlalchemy.orm import Session
from models import Category, Product
from database import SessionLocal


def seed_database():
    db: Session = SessionLocal()

    # Skip if already seeded
    if db.query(Category).count() > 0:
        db.close()
        return

    # --- Categories ---
    categories_data = [
        {"name": "Atta, Rice & Dal", "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200"},
        {"name": "Snacks & Biscuits", "image_url": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=200"},
        {"name": "Dairy & Bread", "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200"},
        {"name": "Masala & Dry Fruits", "image_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200"},
        {"name": "Oil & Ghee", "image_url": "https://images.unsplash.com/photo-1474979266404-7eadf1e3a5f5?w=200"},
        {"name": "Tea & Coffee", "image_url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200"},
        {"name": "Cold Drinks & Juices", "image_url": "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=200"},
        {"name": "Vegetables & Fruits", "image_url": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200"},
        {"name": "Cleaning & Household", "image_url": "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=200"},
        {"name": "Personal Care", "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200"},
    ]

    categories = {}
    for cat_data in categories_data:
        cat = Category(**cat_data)
        db.add(cat)
        db.flush()
        categories[cat.name] = cat.id

    # --- Products (50 items) ---
    products_data = [
        # Atta, Rice & Dal
        {"name": "Aashirvaad Whole Wheat Atta", "price": 280, "weight": "5 kg", "image_url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300", "category": "Atta, Rice & Dal"},
        {"name": "India Gate Basmati Rice", "price": 450, "weight": "5 kg", "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300", "category": "Atta, Rice & Dal"},
        {"name": "Toor Dal (Arhar)", "price": 160, "weight": "1 kg", "image_url": "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300", "category": "Atta, Rice & Dal"},
        {"name": "Moong Dal", "price": 140, "weight": "1 kg", "image_url": "https://images.unsplash.com/photo-1612257416648-ee7a6c5b1e4e?w=300", "category": "Atta, Rice & Dal"},
        {"name": "Chana Dal", "price": 120, "weight": "1 kg", "image_url": "https://images.unsplash.com/photo-1612257416648-ee7a6c5b1e4e?w=300", "category": "Atta, Rice & Dal"},

        # Snacks & Biscuits
        {"name": "Parle-G Gold Biscuits", "price": 40, "weight": "200 g", "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300", "category": "Snacks & Biscuits"},
        {"name": "Haldiram's Aloo Bhujia", "price": 85, "weight": "400 g", "image_url": "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300", "category": "Snacks & Biscuits"},
        {"name": "Lays Classic Salted Chips", "price": 30, "weight": "52 g", "image_url": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300", "category": "Snacks & Biscuits"},
        {"name": "Britannia Good Day Cookies", "price": 55, "weight": "250 g", "image_url": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300", "category": "Snacks & Biscuits"},
        {"name": "Kurkure Masala Munch", "price": 20, "weight": "90 g", "image_url": "https://images.unsplash.com/photo-1621447504864-d45f5be61f82?w=300", "category": "Snacks & Biscuits"},

        # Dairy & Bread
        {"name": "Amul Taaza Toned Milk", "price": 30, "weight": "500 ml", "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300", "category": "Dairy & Bread"},
        {"name": "Amul Butter", "price": 56, "weight": "100 g", "image_url": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300", "category": "Dairy & Bread"},
        {"name": "Britannia White Bread", "price": 40, "weight": "400 g", "image_url": "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=300", "category": "Dairy & Bread"},
        {"name": "Mother Dairy Dahi", "price": 45, "weight": "400 g", "image_url": "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=300", "category": "Dairy & Bread"},
        {"name": "Amul Paneer", "price": 90, "weight": "200 g", "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300", "category": "Dairy & Bread"},

        # Masala & Dry Fruits
        {"name": "MDH Garam Masala", "price": 75, "weight": "100 g", "image_url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300", "category": "Masala & Dry Fruits"},
        {"name": "Everest Turmeric Powder", "price": 55, "weight": "100 g", "image_url": "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=300", "category": "Masala & Dry Fruits"},
        {"name": "Red Chilli Powder", "price": 65, "weight": "100 g", "image_url": "https://images.unsplash.com/photo-1599909533601-02b16bdae6ae?w=300", "category": "Masala & Dry Fruits"},
        {"name": "Premium Cashew Nuts", "price": 320, "weight": "250 g", "image_url": "https://images.unsplash.com/photo-1509358271058-adc59d375e6d?w=300", "category": "Masala & Dry Fruits"},
        {"name": "California Almonds", "price": 350, "weight": "250 g", "image_url": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=300", "category": "Masala & Dry Fruits"},

        # Oil & Ghee
        {"name": "Fortune Sunflower Oil", "price": 180, "weight": "1 L", "image_url": "https://images.unsplash.com/photo-1474979266404-7eadf1e3a5f5?w=300", "category": "Oil & Ghee"},
        {"name": "Saffola Gold Oil", "price": 220, "weight": "1 L", "image_url": "https://images.unsplash.com/photo-1474979266404-7eadf1e3a5f5?w=300", "category": "Oil & Ghee"},
        {"name": "Amul Pure Ghee", "price": 560, "weight": "1 L", "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300", "category": "Oil & Ghee"},
        {"name": "Mustard Oil (Kachi Ghani)", "price": 190, "weight": "1 L", "image_url": "https://images.unsplash.com/photo-1474979266404-7eadf1e3a5f5?w=300", "category": "Oil & Ghee"},
        {"name": "Patanjali Coconut Oil", "price": 110, "weight": "500 ml", "image_url": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=300", "category": "Oil & Ghee"},

        # Tea & Coffee
        {"name": "Tata Tea Gold", "price": 210, "weight": "500 g", "image_url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300", "category": "Tea & Coffee"},
        {"name": "Nescafé Classic Coffee", "price": 290, "weight": "200 g", "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300", "category": "Tea & Coffee"},
        {"name": "Taj Mahal Tea", "price": 255, "weight": "500 g", "image_url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300", "category": "Tea & Coffee"},
        {"name": "Bru Instant Coffee", "price": 180, "weight": "100 g", "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300", "category": "Tea & Coffee"},
        {"name": "Society Tea", "price": 195, "weight": "500 g", "image_url": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300", "category": "Tea & Coffee"},

        # Cold Drinks & Juices
        {"name": "Coca-Cola", "price": 40, "weight": "750 ml", "image_url": "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=300", "category": "Cold Drinks & Juices"},
        {"name": "Frooti Mango Drink", "price": 15, "weight": "200 ml", "image_url": "https://images.unsplash.com/photo-1546173159-315724a31696?w=300", "category": "Cold Drinks & Juices"},
        {"name": "Real Mixed Fruit Juice", "price": 110, "weight": "1 L", "image_url": "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=300", "category": "Cold Drinks & Juices"},
        {"name": "Pepsi", "price": 40, "weight": "750 ml", "image_url": "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=300", "category": "Cold Drinks & Juices"},
        {"name": "Paper Boat Aam Panna", "price": 30, "weight": "200 ml", "image_url": "https://images.unsplash.com/photo-1546173159-315724a31696?w=300", "category": "Cold Drinks & Juices"},

        # Vegetables & Fruits
        {"name": "Fresh Tomatoes", "price": 30, "weight": "500 g", "image_url": "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=300", "category": "Vegetables & Fruits"},
        {"name": "Onions", "price": 35, "weight": "1 kg", "image_url": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300", "category": "Vegetables & Fruits"},
        {"name": "Potatoes", "price": 28, "weight": "1 kg", "image_url": "https://images.unsplash.com/photo-1518977676601-b53f82ber5f7?w=300", "category": "Vegetables & Fruits"},
        {"name": "Fresh Bananas", "price": 45, "weight": "1 dozen", "image_url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300", "category": "Vegetables & Fruits"},
        {"name": "Green Capsicum", "price": 25, "weight": "250 g", "image_url": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300", "category": "Vegetables & Fruits"},

        # Cleaning & Household
        {"name": "Surf Excel Easy Wash", "price": 130, "weight": "1 kg", "image_url": "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300", "category": "Cleaning & Household"},
        {"name": "Vim Dishwash Gel", "price": 99, "weight": "500 ml", "image_url": "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300", "category": "Cleaning & Household"},
        {"name": "Harpic Toilet Cleaner", "price": 85, "weight": "500 ml", "image_url": "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300", "category": "Cleaning & Household"},
        {"name": "Lizol Floor Cleaner", "price": 120, "weight": "975 ml", "image_url": "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300", "category": "Cleaning & Household"},
        {"name": "Colin Glass Cleaner", "price": 80, "weight": "500 ml", "image_url": "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300", "category": "Cleaning & Household"},

        # Personal Care
        {"name": "Dove Shampoo", "price": 220, "weight": "340 ml", "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300", "category": "Personal Care"},
        {"name": "Colgate MaxFresh Toothpaste", "price": 95, "weight": "150 g", "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300", "category": "Personal Care"},
        {"name": "Dettol Soap", "price": 42, "weight": "125 g", "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300", "category": "Personal Care"},
        {"name": "Nivea Body Lotion", "price": 195, "weight": "200 ml", "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300", "category": "Personal Care"},
        {"name": "Gillette Guard Razor", "price": 65, "weight": "1 pc", "image_url": "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300", "category": "Personal Care"},
    ]

    for prod_data in products_data:
        cat_name = prod_data.pop("category")
        prod_data["category_id"] = categories[cat_name]
        product = Product(**prod_data)
        db.add(product)

    db.commit()
    db.close()
    print("Database seeded with 50 products across 10 categories!")
