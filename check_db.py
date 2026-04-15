import os
from dotenv import load_dotenv
from sqlalchemy import inspect
load_dotenv()
from api.database import engine
from api.models import Base

def check_db():
    print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")
    try:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"Tables in DB: {tables}")
        # Create tables if not exist
        print("Creating tables if they don't exist...")
        Base.metadata.create_all(bind=engine)
        tables = inspector.get_table_names()
        print(f"Tables in DB after create: {tables}")
        return True
    except Exception as e:
        print(f"Error connecting: {e}")
        return False

if __name__ == "__main__":
    check_db()
