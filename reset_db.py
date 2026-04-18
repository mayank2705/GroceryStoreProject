import os
from dotenv import load_dotenv
load_dotenv()

# We can import from backend or api. We'll use api.
from api.database import Base, engine
from api.models import User, Category, Product

if __name__ == "__main__":
    print("Dropping all tables in Neon database...")
    Base.metadata.drop_all(bind=engine)
    print("Recreating all tables with new schema...")
    Base.metadata.create_all(bind=engine)
    print("Database reset complete.")
