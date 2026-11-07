import os
import socket
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# Determine active database URL
is_testing = os.getenv("TESTING") == "1"
env_db_url = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/mydb")

def is_host_resolvable(host: str) -> bool:
    try:
        socket.gethostbyname(host)
        return True
    except socket.error:
        return False

if is_testing:
    DATABASE_URL = "sqlite:///./test.db"
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
else:
    # If host 'db' is specified but not resolvable outside Docker, fallback to localhost or sqlite
    if "@db:" in env_db_url and not is_host_resolvable("db"):
        if is_host_resolvable("localhost"):
            test_url = env_db_url.replace("@db:", "@localhost:")
            try:
                engine = create_engine(test_url, pool_pre_ping=True)
                with engine.connect() as conn:
                    DATABASE_URL = test_url
            except Exception:
                DATABASE_URL = "sqlite:///./app.db"
                engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        else:
            DATABASE_URL = "sqlite:///./app.db"
            engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        DATABASE_URL = env_db_url
        connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
        engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
