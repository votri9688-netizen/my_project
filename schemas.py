from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict

# --- USER SCHEMAS ---
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- REEL POST SCHEMAS ---
class ReelPostBase(BaseModel):
    title: Optional[str] = None
    caption: Optional[str] = None
    video_path: Optional[str] = None

class ReelPostCreate(ReelPostBase):
    fanpage_id: int

class ReelPostOut(ReelPostBase):
    id: int
    fanpage_id: int
    fb_video_id: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    published_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- QUOTA LOG SCHEMAS ---
class QuotaLogOut(BaseModel):
    id: int
    fanpage_id: int
    date: date
    used_quota: int
    remaining_quota: int
    model_config = ConfigDict(from_attributes=True)

# --- FANPAGE SCHEMAS ---
class FanpageBase(BaseModel):
    name: str
    page_id: str
    quota: int = 10
    active: bool = True

class FanpageCreate(FanpageBase):
    access_token: Optional[str] = None

class FanpageUpdate(BaseModel):
    name: Optional[str] = None
    quota: Optional[int] = None
    active: Optional[bool] = None
    access_token: Optional[str] = None

class Fanpage(FanpageBase):
    id: int
    created_at: Optional[datetime] = None
    reels: List[ReelPostOut] = []
    quota_logs: List[QuotaLogOut] = []
    model_config = ConfigDict(from_attributes=True)
