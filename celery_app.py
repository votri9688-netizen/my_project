from celery import Celery
import os

import socket

# Read Redis URL from environment (Docker .env will provide)
def is_host_resolvable(host: str) -> bool:
    try:
        socket.gethostbyname(host)
        return True
    except socket.error:
        return False

broker_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
if "@redis:" in broker_url and not is_host_resolvable("redis"):
    broker_url = broker_url.replace("@redis:", "@localhost:")
elif broker_url.startswith("redis://redis:"):
    if not is_host_resolvable("redis"):
        broker_url = broker_url.replace("redis://redis:", "redis://localhost:")

app = Celery('worker', broker=broker_url, backend=broker_url)

# Optional beat schedule (purge temp buffer every 30 minutes)
app.conf.beat_schedule = {
    "purge-temp-buffers": {
        "task": "tasks.purge_temp",
        "schedule": 1800,  # seconds (30 min)
    },
}
app.conf.timezone = "UTC"
