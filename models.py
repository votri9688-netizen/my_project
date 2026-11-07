from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship

try:
    from .database import Base
except (ImportError, ValueError):
    from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)  # admin / user
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Fanpage(Base):
    __tablename__ = "fanpages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    page_id = Column(String(100), unique=True, index=True, nullable=False)
    access_token = Column(Text, nullable=True)  # AES-256 encrypted
    quota = Column(Integer, default=10)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    quota_logs = relationship("QuotaLog", back_populates="fanpage", cascade="all, delete-orphan")
    reels = relationship("ReelPost", back_populates="fanpage", cascade="all, delete-orphan")

class QuotaLog(Base):
    __tablename__ = "quota_logs"

    id = Column(Integer, primary_key=True, index=True)
    fanpage_id = Column(Integer, ForeignKey("fanpages.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, default=date.today, index=True, nullable=False)
    used_quota = Column(Integer, default=0)
    remaining_quota = Column(Integer, default=10)

    fanpage = relationship("Fanpage", back_populates="quota_logs")

class ReelPost(Base):
    __tablename__ = "reel_posts"

    id = Column(Integer, primary_key=True, index=True)
    fanpage_id = Column(Integer, ForeignKey("fanpages.id", ondelete="CASCADE"), nullable=False)
    fb_video_id = Column(String(100), nullable=True, index=True)
    title = Column(String(255), nullable=True)
    caption = Column(Text, nullable=True)
    video_path = Column(String(255), nullable=True)
    status = Column(String(30), default="pending", index=True)  # pending, rendering, uploading, published, failed
    error_message = Column(Text, nullable=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    fanpage = relationship("Fanpage", back_populates="reels")
