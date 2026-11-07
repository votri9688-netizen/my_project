import os
from pathlib import Path
from dotenv import load_dotenv

# Base Directory
BASE_DIR = Path(__file__).resolve().parent

# Load .env
load_dotenv(dotenv_path=BASE_DIR / ".env")

# Database & Cache
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/mydb")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# AI & LLM Providers
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_API_KEY_BACKUP = os.getenv("GROQ_API_KEY_BACKUP", "")
HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN", "")

# Social Media & Meta API
INSTAGRAM_USER_TOKEN = os.getenv("INSTAGRAM_USER_TOKEN", "")
META_USER_ACCESS_TOKEN = os.getenv("META_USER_ACCESS_TOKEN", "")
PUBLISH_MODE = os.getenv("PUBLISH_MODE", "LIVE")

# Security & Encryption
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-jwt-key-for-video-automation-32chars")
AES_ENCRYPTION_KEY = os.getenv("AES_ENCRYPTION_KEY", "s7M_VwX_3K2j8fQ4p9Rt1u6yZ5aL0eBvCw8xG2mH4j8=")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Telegram & Alerting
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
