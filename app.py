import os
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator

try:
    from . import models, schemas, database
except (ImportError, ValueError):
    import models, schemas, database

app = FastAPI(title="Video Automation API", version="1.0.0")

# Instrument Prometheus metrics
Instrumentator().instrument(app).expose(app)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.get("/status")
def read_status():
    return {"status": "ok"}

@app.get("/trigger-500")
def trigger_500():
    """Endpoint dùng để kiểm tra Alertmanager khi có lỗi 500"""
    raise HTTPException(status_code=500, detail="Intentional server error for alert testing")

@app.post("/fanpages/{fanpage_id}/process")
def process_fanpage(fanpage_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Trigger video processing for a fanpage via Celery task."""
    fan = db.query(models.Fanpage).filter(models.Fanpage.id == fanpage_id).first()
    if not fan:
        raise HTTPException(status_code=404, detail="Fanpage not found")
    
    input_path = f"/tmp/{fan.page_id}_input.mp4"
    output_path = f"/tmp/{fan.page_id}_output.mp4"
    
    try:
        from tasks import process_video
        process_video.delay(input_path, output_path)
    except Exception as e:
        # Fallback or log if celery broker is offline
        pass
        
    return {"msg": "Processing started", "fanpage_id": fanpage_id}

@app.post("/fanpages/", response_model=schemas.Fanpage)
def create_fanpage(fanpage: schemas.FanpageCreate, db: Session = Depends(get_db)):
    db_fanpage = models.Fanpage(**fanpage.dict())
    db.add(db_fanpage)
    db.commit()
    db.refresh(db_fanpage)
    return db_fanpage

@app.get("/fanpages/", response_model=list[schemas.Fanpage])
def list_fanpages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Fanpage).offset(skip).limit(limit).all()
