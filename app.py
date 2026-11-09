import os
from typing import List, Optional
from datetime import datetime, date
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from prometheus_fastapi_instrumentator import Instrumentator

try:
    from . import models, schemas, database, auth
    from .utils.crypto import encrypt_token, decrypt_token, mask_token
except (ImportError, ValueError):
    import models, schemas, database, auth
    from utils.crypto import encrypt_token, decrypt_token, mask_token

# Auto create tables if not present
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Video Automation & Reels Publishing System",
    description="Automated system for Reel processing, Meta Graph API publishing, LLM captioning & Telegram alerts",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

def format_fanpage(fan: models.Fanpage) -> schemas.Fanpage:
    res = schemas.Fanpage.model_validate(fan)
    res.access_token_masked = mask_token(decrypt_token(fan.access_token))
    return res

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
@app.post("/fanpages/inspect-token")
def inspect_token(data: dict):
    """
    Tự động kiểm tra Token từ Meta:
    - Nếu là Page Token -> Tự động lấy Page ID thật và Tên Trang từ Meta!
    - Nếu là User Token -> Trả về thông tin User và danh sách các Page có quyền quản trị!
    """
    token = data.get("token", "").strip()
    if not token:
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp Access Token")
    
    import httpx
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.get(f"https://graph.facebook.com/v19.0/me?fields=id,name&access_token={token}")
            if res.status_code != 200:
                err_data = res.json().get("error", {})
                raise HTTPException(status_code=400, detail=f"Lỗi Meta: {err_data.get('message', 'Token không hợp lệ hoặc đã hết hạn')}")
            me_info = res.json()
            
            # Thử lấy danh sách trang quản trị nếu đây là User Token
            acc_res = client.get(f"https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token&limit=100&access_token={token}")
            pages = []
            if acc_res.status_code == 200:
                pages = acc_res.json().get("data", [])
            
            is_user = len(pages) > 0
            return {
                "id": str(me_info.get("id")),
                "name": me_info.get("name"),
                "is_user": is_user,
                "type": "User Account" if is_user else "Fanpage",
                "managed_pages": [{"id": str(p["id"]), "name": p["name"]} for p in pages]
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi kiểm tra token từ Meta: {str(e)}")

@app.post("/fanpages/sync-meta")
def sync_meta_fanpages(data: dict, db: Session = Depends(get_db)):
    """
    Đồng bộ 1-Click tất cả Fanpage từ Facebook vào hệ thống:
    Tự động lấy ID thật, Tên thật, và cấp Page Access Token riêng cho từng trang.
    """
    token = data.get("user_token", "").strip()
    if not token:
        raise HTTPException(status_code=400, detail="Vui lòng cung cấp User Access Token")
    
    import httpx
    try:
        with httpx.Client(timeout=15.0) as client:
            acc_res = client.get(f"https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,tasks&limit=100&access_token={token}")
            if acc_res.status_code != 200:
                err_data = acc_res.json().get("error", {})
                raise HTTPException(status_code=400, detail=f"Lỗi Meta: {err_data.get('message', 'Token không hợp lệ')}")
            
            pages = acc_res.json().get("data", [])
            if not pages:
                raise HTTPException(status_code=400, detail="Không tìm thấy Fanpage nào được quản lý bởi tài khoản này.")
            
            synced_count = 0
            created_count = 0
            updated_count = 0
            synced_pages = []
            
            for p in pages:
                p_id = str(p["id"])
                p_name = p["name"]
                p_token = p["access_token"]
                
                # Tìm xem đã có Fanpage với ID này chưa
                fan = db.query(models.Fanpage).filter(models.Fanpage.page_id == p_id).first()
                if not fan:
                    fan = db.query(models.Fanpage).filter(models.Fanpage.name == p_name).first()
                
                encrypted = encrypt_token(p_token)
                if fan:
                    fan.page_id = p_id
                    fan.name = p_name
                    fan.access_token = encrypted
                    fan.active = True
                    updated_count += 1
                else:
                    fan = models.Fanpage(
                        name=p_name,
                        page_id=p_id,
                        quota=24,
                        active=True,
                        access_token=encrypted
                    )
                    db.add(fan)
                    created_count += 1
                
                synced_pages.append({"name": p_name, "page_id": p_id})
                synced_count += 1
                
            db.commit()
            return {
                "success": True,
                "total_synced": synced_count,
                "created": created_count,
                "updated": updated_count,
                "pages": synced_pages
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi đồng bộ Meta: {str(e)}")

@app.post("/fanpages/", response_model=schemas.Fanpage)
def create_fanpage(fanpage: schemas.FanpageCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Fanpage).filter(models.Fanpage.page_id == fanpage.page_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Fanpage with this page_id already exists")
    
    # Encrypt access token before storing
    encrypted_token = encrypt_token(fanpage.access_token)
    
    db_fanpage = models.Fanpage(
        name=fanpage.name,
        page_id=fanpage.page_id,
        quota=fanpage.quota,
        active=fanpage.active,
        access_token=encrypted_token
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
    return format_fanpage(db_fanpage)

@app.get("/fanpages/", response_model=List[schemas.Fanpage])
def list_fanpages(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    fans = db.query(models.Fanpage).offset(skip).limit(limit).all()
    return [format_fanpage(f) for f in fans]

@app.get("/fanpages/{fanpage_id}", response_model=schemas.Fanpage)
def get_fanpage(fanpage_id: int, db: Session = Depends(get_db)):
    fan = db.query(models.Fanpage).filter(models.Fanpage.id == fanpage_id).first()
    if not fan:
        raise HTTPException(status_code=404, detail="Fanpage not found")
    return format_fanpage(fan)

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
        fan.access_token = encrypt_token(fan_in.access_token)
    if fan_in.source_url is not None:
        fan.source_url = fan_in.source_url
    if fan_in.backup_url is not None:
        fan.backup_url = fan_in.backup_url
        
    db.commit()
    db.refresh(fan)
    return format_fanpage(fan)

# --- META GRAPH API REAL INSIGHTS ---
@app.get("/reports/insights")
def get_meta_insights(db: Session = Depends(get_db)):
    """
    Kéo số liệu THẬT trực tiếp từ Meta Graph API v19.0 cho 9 Fanpage
    """
    import httpx
    fans = db.query(models.Fanpage).all()
    
    total_views = 0
    total_reach = 0
    total_engagement = 0
    page_insights = []
    top_reels = []

    for f in fans:
        token = decrypt_token(f.access_token) if f.access_token else ""
        item = {
            "page_id": f.page_id,
            "name": f.name,
            "views": 0,
            "reach": 0,
            "followers": 0,
            "likes": 0,
            "status": "pending",
            "error_detail": None,
            "reels_count": 0
        }

        if not token:
            item["status"] = "missing_token"
            item["error_detail"] = "Chưa cấu hình Access Token"
            page_insights.append(item)
            continue

        try:
            # 1. Fetch Page info & followers
            with httpx.Client(timeout=10.0) as client:
                res_info = client.get(
                    f"https://graph.facebook.com/v19.0/{f.page_id}",
                    params={"fields": "name,followers_count,fan_count", "access_token": token}
                )
                if res_info.status_code == 200:
                    info_data = res_info.json()
                    item["followers"] = info_data.get("followers_count", info_data.get("fan_count", 0))
                    item["status"] = "active"
                else:
                    err_json = res_info.json().get("error", {})
                    item["status"] = "error"
                    item["error_detail"] = f"Meta Error: {err_json.get('message', res_info.text)}"

                # 2. Fetch Reels list & stats
                res_reels = client.get(
                    f"https://graph.facebook.com/v19.0/{f.page_id}/video_reels",
                    params={"fields": "id,description,created_time", "access_token": token, "limit": 10}
                )
                if res_reels.status_code == 200:
                    reels_data = res_reels.json().get("data", [])
                    item["reels_count"] = len(reels_data)
                    for r in reels_data:
                        top_reels.append({
                            "id": r.get("id"),
                            "page": f.name,
                            "title": (r.get("description") or "Reel không có caption")[:60],
                            "views": "N/A (Chờ Meta sync)",
                            "reach": "N/A",
                            "likes": "N/A",
                            "date": r.get("created_time", "")[:10]
                        })

                # 3. Fetch Page Insights metrics
                res_ins = client.get(
                    f"https://graph.facebook.com/v19.0/{f.page_id}/insights",
                    params={
                        "metric": "page_impressions,page_post_engagements",
                        "period": "day",
                        "access_token": token
                    }
                )
                if res_ins.status_code == 200:
                    ins_data = res_ins.json().get("data", [])
                    for m in ins_data:
                        if m.get("name") == "page_impressions":
                            val = m.get("values", [{}])[-1].get("value", 0)
                            item["reach"] += val
                            total_reach += val
                        elif m.get("name") == "page_post_engagements":
                            val = m.get("values", [{}])[-1].get("value", 0)
                            item["likes"] += val
                            total_engagement += val

        except Exception as e:
            item["status"] = "connection_error"
            item["error_detail"] = str(e)

        page_insights.append(item)

    # Lấy thêm các bài Reel đã đăng thành công từ DB
    db_reels = db.query(models.ReelPost).order_by(models.ReelPost.created_at.desc()).limit(10).all()
    for dbr in db_reels:
        fan_name = next((f.name for f in fans if f.id == dbr.fanpage_id), "Fanpage")
        if dbr.fb_video_id:
            top_reels.insert(0, {
                "id": dbr.fb_video_id,
                "page": fan_name,
                "title": dbr.title or "Reel xuất bản",
                "views": "Đang đồng bộ",
                "reach": "Đang đồng bộ",
                "likes": "Đang đồng bộ",
                "date": dbr.created_at.strftime("%d/%m/%Y") if dbr.created_at else ""
            })

    return {
        "summary": {
            "total_views": total_views,
            "total_reach": total_reach,
            "total_engagement": total_engagement,
            "active_pages": sum(1 for p in page_insights if p["status"] == "active"),
            "total_pages": len(fans),
        },
        "page_insights": page_insights,
        "top_reels": top_reels[:10],
    }

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

    # Decrypt token for pipeline execution
    decrypted_token = decrypt_token(fan.access_token)

    # Trigger Celery pipeline
    try:
        from tasks import process_video_pipeline
        process_video_pipeline.delay(
            reel_id=reel.id,
            fanpage_id=fan.id,
            page_id=fan.page_id,
            access_token=decrypted_token,
            topic=topic
        )
    except Exception as e:
        reel.status = "processing_enqueued"
        db.commit()

    return {
        "msg": "Processing started",
        "fanpage_id": fanpage_id,
        "reel_id": reel.id,
        "status": reel.status
    }
