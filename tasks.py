import os
import time
import subprocess
import shutil
from pathlib import Path
from celery_app import app
from prometheus_client import Counter, Histogram

# Prometheus custom metrics for Celery tasks
VIDEO_PROCESSED_TOTAL = Counter(
    "video_processed_total", 
    "Total number of videos processed", 
    ["status"]
)
VIDEO_PROCESSING_LATENCY = Histogram(
    "video_processing_latency_seconds", 
    "Time taken to process videos"
)

# Temporary directory for video processing inside container
TEMP_DIR = Path('/tmp/video_buffer')
TEMP_DIR.mkdir(parents=True, exist_ok=True)

@app.task
def process_video(input_path: str, output_path: str):
    """Run ffmpeg to process a video.
    input_path và output_path đều là đường dẫn trong container.
    """
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    start_time = time.time()
    
    cmd = [
        "ffmpeg",
        "-i", input_path,
        "-c:v", "libx264",
        "-preset", "fast",
        "-c:a", "aac",
        output_path,
        "-y"
    ]
    try:
        subprocess.run(cmd, check=True)
        duration = time.time() - start_time
        VIDEO_PROCESSED_TOTAL.labels(status="success").inc()
        VIDEO_PROCESSING_LATENCY.observe(duration)
    except Exception as e:
        VIDEO_PROCESSED_TOTAL.labels(status="failed").inc()
        raise e
    finally:
        if TEMP_DIR.exists():
            shutil.rmtree(TEMP_DIR, ignore_errors=True)

@app.task
def purge_temp():
    """Xóa toàn bộ file tạm trong TEMP_DIR (được gọi bởi Celery Beat)."""
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR, ignore_errors=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
