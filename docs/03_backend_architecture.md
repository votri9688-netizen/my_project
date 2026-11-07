# 03 – Backend Architecture

## 1. Tổng quan kiến trúc
Backend được xây dựng trên nền tảng **FastAPI** (Python 3.11+), tuân thủ nguyên lý Clean Architecture và hướng module hóa:
- **FastAPI Core (`app.py`)**: Đóng vai trò làm Application Gateway, định tuyến API (Routing), quản lý Dependencies Injection (`get_db`, `get_current_user`), và phơi lộ Prometheus metrics (`/metrics`).
- **Database Engine (`database.py`)**: Kết nối PostgreSQL thông qua SQLAlchemy ORM với cơ chế Connection Pooling (`pool_pre_ping=True`) và hỗ trợ SQLite fallback khi chạy kiểm thử tự động.
- **Asynchronous Worker (`celery_app.py`, `tasks.py`)**: Phân tách các tác vụ nặng (FFmpeg video rendering, gọi API Meta/Gemini) sang Celery Worker chạy ngầm với Redis Broker.

```
       [ HTTP Clients / Next.js ]
                   │
                   ▼
     ┌────────────────────────────┐
     │      Nginx Reverse Proxy   │ (Port 80/443 SSL)
     └─────────────┬──────────────┘
                   │
                   ▼
     ┌────────────────────────────┐
     │      FastAPI Backend       │ (Port 8000)
     │  - JWT Auth (/auth/*)      │
     │  - Fanpage CRUD (/fanpages)│
     │  - Pipeline Trigger        │
     └──────┬──────────────┬──────┘
            │              │
    SQLAlchemy ORM     Celery Task
            │              │
            ▼              ▼
     ┌──────────────┐┌──────────────┐
     │  PostgreSQL  ││ Redis Broker │
     │  Database    │└──────┬───────┘
     └──────────────┘       │
                            ▼
                     ┌──────────────┐
                     │ Celery Worker│ (FFmpeg, Gemini, Meta)
                     └──────────────┘
```

## 2. Dependency Injection & Database Session
Mọi endpoint truy xuất CSDL đều sử dụng cơ chế Generator Dependency:
```python
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
```
Đảm bảo mỗi HTTP Request sở hữu một Session độc lập và tự động giải phóng kết nối về Connection Pool ngay khi Request hoàn tất.

## 3. Hệ thống Metrics & Monitoring
- Sử dụng `prometheus_fastapi_instrumentator` tự động thu thập:
  - Thời gian xử lý từng request (`http_request_duration_seconds`).
  - Số lượng request theo status code (`http_requests_total`).
- Phơi lộ chuẩn Prometheus tại endpoint `/metrics`.
