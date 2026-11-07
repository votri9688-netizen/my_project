from sqlalchemy import Column, Integer, String, Boolean
try:
    from .database import Base
except (ImportError, ValueError):
    from database import Base

class Fanpage(Base):
    __tablename__ = "fanpages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    page_id = Column(String, unique=True, nullable=False)
    quota = Column(Integer, default=0)
    active = Column(Boolean, default=True)
