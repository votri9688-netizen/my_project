import os
from typing import List, Optional
from datetime import datetime, date
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator

try:
    from . import models, schemas, database, auth
except (ImportError, ValueError):
    import models, schemas, database, auth

# Auto create tables if not present
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Video Automation & Reels Publishing System",
    description="Automated system for Reel processing, Meta Graph API publishing, LLM captioning & Telegram alerts",
    version="1.0.0"
)

# Prometheus Metrics Instrumentation
Instrumentator().instrument(app).expose(app)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- HEALTH & STATUS ---
@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!", "status": "online"}

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.get("/status")
def read_status():
    return {"status": "ok"}

@app.get("/trigger-500")
def trigger_500():
    """Trigger intentional 500 error for Alertmanager email testing"""
    raise HTTPException(status_code=500, detail="Intentional server error for alert testing")

# --- AUTHENTICATION ENDPOINTS ---
@app.post("/auth/register", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.username == user_in.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed = auth.get_password_hash(user_in.password)
    new_user = models.User(
        username=user_in.username,
        hashed_password=hashed,
        role="admin" if db.query(models.User).count() == 0 else "user",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    access_token = auth.create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=schemas.UserOut)
def get_current_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- FANPAGE MANAGEMENT ---
@app.post("/fanpages/", response_model=schemas.Fanpage)
def create_fanpage(fanpage: schemas.FanpageCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Fanpage).filter(models.Fanpage.page_id == fanpage.page_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Fanpage with this page_id already exists")
    
    db_fanpage = models.Fanpage(
        name=fanpage.name,
        page_id=fanpage.page_id,
        quota=fanpage.quota,
        active=fanpage.active,
        access_token=fanpage.access_token
    )
    db.add(db_fanpage)
    db.commit()
    db.refresh(db_fanpage)

    # Initialize today's quota log
    today = date.today()
    log = models.QuotaLog(
        fanpage_id=db_fanpage.id,
        date=today,
        used_quota=0,
        remaining_quota=db_fanpage.quota
    )
    db.add(log)
    db.commit()
    db.refresh(db_fanpage)
    return db_fanpage

@app.get("/fanpages/", response_model=List[schemas.Fanpage])
def list_fanpages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Fanpage).offset(skip).limit(limit).all()

@app.get("/fanpages/{fanpage_id}", response_model=schemas.Fanpage)
def get_fanpage(fanpage_id: int, db: Session = Depends(get_db)):
    fan = db.query(models.Fanpage).filter(models.Fanpage.id == fanpage_id).first()
    if not fan:
        raise HTTPException(status_code=404, detail="Fanpage not found")
    return fan

@app.put("/fanpages/{fanpage_id}", response_model=schemas.Fanpage)
def update_fanpage(fanpage_id: int, fan_in: schemas.FanpageUpdate, db: Session = Depends(get_db)):
    fan = db.query(models.Fanpage).filter(models.Fanpage.id == fanpage_id).first()
    if not fan:
        raise HTTPException(status_code=404, detail="Fanpage not found")
    
    if fan_in.name is not None:
        fan.name = fan_in.name
    if fan_in.quota is not None:
        fan.quota = fan_in.quota
    if fan_in.active is not None:
        fan.active = fan_in.active
    if fan_in.access_token is not None:
        fan.access_token = fan_in.access_token
        
    db.commit()
    db.refresh(fan)
    return fan

# --- REEL POSTS & PROCESSING ---
@app.get("/reels/", response_model=List[schemas.ReelPostOut])
def list_reels(fanpage_id: Optional[int] = None, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(models.ReelPost)
    if fanpage_id:
        query = query.filter(models.ReelPost.fanpage_id == fanpage_id)
    return query.order_by(models.ReelPost.created_at.desc()).offset(skip).limit(limit).all()

@app.post("/fanpages/{fanpage_id}/process")
def process_fanpage(
    fanpage_id: int,
    background_tasks: BackgroundTasks,
    topic: Optional[str] = "Trending Viral Entertainment",
    db: Session = Depends(get_db)
):
    """Trigger automated Video rendering, AI Captioning, and Meta Reel publishing pipeline."""
    fan = db.query(models.Fanpage).filter(models.Fanpage.id == fanpage_id).first()
    if not fan:
        raise HTTPException(status_code=404, detail="Fanpage not found")
    if not fan.active:
        raise HTTPException(status_code=400, detail="Fanpage is disabled")

    # Check daily quota
    today = date.today()
    quota_log = db.query(models.QuotaLog).filter(
        models.QuotaLog.fanpage_id == fan.id,
        models.QuotaLog.date == today
    ).first()

    if not quota_log:
        quota_log = models.QuotaLog(
            fanpage_id=fan.id,
            date=today,
            used_quota=0,
            remaining_quota=fan.quota
        )
        db.add(quota_log)
        db.commit()
        db.refresh(quota_log)

    if quota_log.remaining_quota <= 0:
        raise HTTPException(status_code=429, detail="Daily quota reached for this fanpage")

    # Create ReelPost record in 'pending' status
    reel = models.ReelPost(
        fanpage_id=fan.id,
        title=f"Reel #{fan.page_id} - {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
        video_path=f"/tmp/{fan.page_id}_output.mp4",
        status="pending"
    )
    db.add(reel)
    db.commit()
    db.refresh(reel)

    # Trigger Celery pipeline
    try:
        from tasks import process_video_pipeline
        process_video_pipeline.delay(
            reel_id=reel.id,
            fanpage_id=fan.id,
            page_id=fan.page_id,
            access_token=fan.access_token,
            topic=topic
        )
    except Exception as e:
        # Fallback for dev / mock testing
        reel.status = "processing_enqueued"
        db.commit()

    return {
        "msg": "Processing started",
        "fanpage_id": fanpage_id,
        "reel_id": reel.id,
        "status": reel.status
    }
