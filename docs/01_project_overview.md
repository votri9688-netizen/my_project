# 01 – Project Overview

## Mục tiêu
Xây dựng một hệ thống thu thập, xử lý và đăng tải nội dung Reels cho các Fanpage Facebook, bao gồm các thành phần:
- **Backend** (FastAPI) – API cho các tác vụ CRUD, xử lý video, quản lý token.
- **Database** (PostgreSQL) – Lưu trữ metadata fanpage, quota, lịch sử chạy.
- **Redis** – Cache token, queue cho Celery.
- **Worker** (Celery + Beat) – Xử lý video bằng FFmpeg, quản lý hàng đợi, tự động dọn sạch bộ nhớ tạm.
- **Frontend** (Next.js) – Dashboard hiển thị danh sách fanpage, quota, trạng thái tác vụ, chatbot UI.
- **Third‑party integrations** – Meta Graph API, LLM (Gemini/Groq/OpenAI), Telegram Bot, (tùy chọn) Shopee Affiliate.

## Phạm vi công việc
| # | Công việc | Thời gian ước tính | Ghi chú |
|---|-----------|--------------------|--------|
| 2️⃣ | Soạn 10 tài liệu Markdown | 0.5‑1 ngày | Tài liệu chi tiết được tạo trong thư mục `docs/` |
| 3️⃣ | Thiết lập CSDL & backend | 2‑3 ngày | Alembic migrations, AES‑256 encryption cho token |
| 4️⃣ | Dựng giao diện Dashboard (Next.js) | 2‑3 ngày | Scaffold, sidebar, bảng Fanpage & Quota, chatbot UI |
| 5️⃣ | Xây dựng worker & lịch giãn cách | 2‑3 ngày | Celery + Beat, FFmpeg trong Docker |
| 6️⃣ | Tích hợp API bên thứ ba | 2‑4 ngày | Meta, LLM, Telegram, (Shopee) |
| 7️⃣ | Kiểm thử & vận hành | 1‑2 ngày | End‑to‑end, mạng mất, log, báo cáo |

---
> **NOTE**: Các biến môi trường quan trọng được liệt kê trong các tài liệu sau.
