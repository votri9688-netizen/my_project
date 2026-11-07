from celery import Celery
import os

# Read Redis URL from environment (Docker .env will provide)
broker_url = os.getenv("REDIS_URL", "redis://:your_redis_password@redis:6379/0")
app = Celery('worker', broker=broker_url, backend=broker_url)

# Optional beat schedule (purge temp buffer every 30 minutes)
app.conf.beat_schedule = {
    "purge-temp-buffers": {
        "task": "tasks.purge_temp",
        "schedule": 1800,  # seconds (30 min)
    },
}
app.conf.timezone = "UTC"
