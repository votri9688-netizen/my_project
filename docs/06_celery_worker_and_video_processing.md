# 06 – Celery Worker & Video Processing

## 1. Kiến trúc Hàng đợi (Queue Architecture)
Hệ thống sử dụng **Celery** kết hợp **Redis** làm Message Broker để xử lý các công việc tốn tài nguyên và thời gian:
- **Broker & Backend**: `redis://:password@redis:6379/0`
- **Worker Concurrency**: Mặc định 4 processes song song trong container production.

## 2. Quy trình xử lý Video Pipeline (`process_video_pipeline`)
Tác vụ chính trong `tasks.py` chạy qua 5 bước tuần tự:
```
[ Trigger từ API ]
        │
        ▼
1. Render Video (FFmpeg: Chuyển mã H.264, tỷ lệ dọc 9:16 1080x1920)
        │
        ▼
2. AI Content (Gọi Google Gemini để sinh Tiêu đề, Mô tả và Hashtag)
        │
        ▼
3. Meta Graph API (Khởi tạo session, upload video nhị phân, publish Reel)
        │
        ▼
4. Cập nhật Database (Lưu fb_video_id, đổi trạng thái published, trừ quota ngày)
        │
        ▼
5. Gửi thông báo (Bắn tin nhắn HTML chi tiết tới Telegram của quản trị viên)
```

## 3. Celery Beat & Tự động dọn dẹp file tạm
Container `beat` kích hoạt định kỳ tác vụ `tasks.purge_temp` mỗi 30 phút (1800 giây) để quét sạch thư mục bộ đệm `/tmp/video_buffer`, tránh làm đầy ổ cứng server khi render nhiều video lớn.

## 4. Custom Prometheus Metrics
Worker chủ động xuất bản 2 metric tùy biến phục vụ giám sát:
- `video_processed_total{status="success|failed"}`: Counter đếm tổng số video hoàn tất hoặc lỗi.
- `video_processing_latency_seconds`: Histogram đo đạc phân phối thời gian render và upload video.
