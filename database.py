import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# If running under test or explicit sqlite, use SQLite
is_testing = os.getenv("TESTING") == "1"
env_db_url = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/mydb")

if is_testing or env_db_url.startswith("sqlite"):
    DATABASE_URL = "sqlite:///./test.db"
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
else:
    DATABASE_URL = env_db_url
    connect_args = {}
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
