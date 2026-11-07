import os
import time
import subprocess
import shutil
from datetime import datetime, date
from pathlib import Path
from celery_app import app
from prometheus_client import Counter, Histogram

from database import SessionLocal
import models
from services.facebook import facebook_service
from services.llm import llm_service
from services.telegram import telegram_notifier

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

TEMP_DIR = Path('/tmp/video_buffer')
TEMP_DIR.mkdir(parents=True, exist_ok=True)

@app.task
def process_video_pipeline(
    reel_id: int,
    fanpage_id: int,
    page_id: str,
    access_token: str = None,
    topic: str = "Trending Entertainment"
):
    """
    End-to-end automated pipeline:
    1. Render video via FFmpeg
    2. Generate AI Caption & Hashtags via LLM (Groq / OpenAI)
    3. Upload & Publish Reel to Meta Graph API
    4. Deduct Quota in DB
    5. Send Realtime Notification to Telegram
    """
    db = SessionLocal()
    start_time = time.time()
    reel = db.query(models.ReelPost).filter(models.ReelPost.id == reel_id).first()
    fanpage = db.query(models.Fanpage).filter(models.Fanpage.id == fanpage_id).first()
    
    if not reel:
        db.close()
        return {"error": "Reel not found"}

    try:
        # Step 1: Video Rendering
        reel.status = "rendering"
        db.commit()

        video_path = reel.video_path or f"/tmp/{page_id}_output.mp4"
        Path(video_path).parent.mkdir(parents=True, exist_ok=True)
        
        # If output file does not exist, generate sample video with ffmpeg
        if not os.path.exists(video_path):
            cmd = [
                "ffmpeg", "-f", "lavfi", "-i", "color=c=black:s=1080x1920:d=5",
                "-vf", f"drawtext=text='{page_id} Reel':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
                "-c:v", "libx264", "-t", "5", "-pix_fmt", "yuv420p",
                video_path, "-y"
            ]
            try:
                subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            except Exception:
                with open(video_path, "wb") as f:
                    f.write(b"MOCK_MP4_VIDEO_BYTES_FOR_REEL")

        # Step 2: AI Content Generation (Groq / OpenAI)
        reel.status = "generating_content"
        db.commit()
        ai_content = llm_service.generate_reel_content(topic)
        title = ai_content.get("title", f"Reel #{page_id}")
        caption = ai_content.get("caption", "Video hay moi ngay!")
        hashtags = " ".join(ai_content.get("hashtags", ["#viral", "#reels", "#trending"]))
        full_description = f"{title}\n\n{caption}\n\n{hashtags}"

        reel.title = title
        reel.caption = full_description
        db.commit()

        # Step 3: Meta Graph API Upload & Publish
        reel.status = "uploading"
        db.commit()
        meta_result = facebook_service.upload_reel(
            page_id=page_id,
            video_path=video_path,
            description=full_description,
            access_token=access_token
        )

        fb_video_id = meta_result.get("video_id", "mock_id")
        post_url = meta_result.get("post_url", f"https://facebook.com/reel/{fb_video_id}")
        reel.fb_video_id = fb_video_id
        reel.status = "published"
        reel.published_at = datetime.utcnow()
        db.commit()

        # Step 4: Quota Update
        today = date.today()
        q_log = db.query(models.QuotaLog).filter(
            models.QuotaLog.fanpage_id == fanpage_id,
            models.QuotaLog.date == today
        ).first()
        if q_log:
            q_log.used_quota += 1
            q_log.remaining_quota = max(0, q_log.remaining_quota - 1)
            db.commit()

        # Step 5: Telegram Notification
        page_name = fanpage.name if fanpage else page_id
        telegram_notifier.notify_reel_published(
            page_name=page_name,
            reel_title=title,
            fb_video_id=fb_video_id,
            post_url=post_url
        )

        duration = time.time() - start_time
        VIDEO_PROCESSED_TOTAL.labels(status="success").inc()
        VIDEO_PROCESSING_LATENCY.observe(duration)
        return {"status": "success", "reel_id": reel.id, "fb_video_id": fb_video_id}

    except Exception as e:
        reel.status = "failed"
        reel.error_message = str(e)
        db.commit()
        VIDEO_PROCESSED_TOTAL.labels(status="failed").inc()
        page_name = fanpage.name if fanpage else page_id
        telegram_notifier.notify_pipeline_error(page_name=page_name, error_detail=str(e))
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()

# Alias process_video for backward compatibility
process_video = process_video_pipeline

@app.task
def purge_temp():
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR, ignore_errors=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
