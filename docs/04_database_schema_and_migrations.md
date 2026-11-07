# 04 – Database Schema & Migrations

## 1. Mô hình CSDL (Entity-Relationship)

Hệ thống quản lý 4 thực thể cốt lõi trong PostgreSQL:

### Bảng `users`
| Cột | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Khóa chính tự tăng |
| `username` | String(50) (Unique) | Tên đăng nhập |
| `hashed_password` | String(255) | Mật khẩu băm chuẩn bcrypt |
| `role` | String(20) | Quyền hạn (`admin` / `user`) |
| `is_active` | Boolean | Trạng thái kích hoạt |
| `created_at` | DateTime | Thời điểm tạo tài khoản |

### Bảng `fanpages`
| Cột | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Khóa chính tự tăng |
| `name` | String(100) | Tên hiển thị của Fanpage |
| `page_id` | String(100) (Unique) | Meta Facebook Page ID |
| `access_token` | Text | Token trang đã mã hóa AES-256 |
| `quota` | Integer | Hạn mức xuất bản tối đa/ngày (mặc định: 10) |
| `active` | Boolean | Bật/tắt tự động hóa |
| `created_at` | DateTime | Thời gian đăng ký |

### Bảng `quota_logs`
| Cột | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Khóa chính |
| `fanpage_id` | Integer (FK) | Liên kết tới `fanpages.id` (CASCADE) |
| `date` | Date | Ngày ghi nhận (YYYY-MM-DD) |
| `used_quota` | Integer | Số lượng Reels đã xuất bản trong ngày |
| `remaining_quota` | Integer | Số lượng bài đăng còn lại |

### Bảng `reel_posts`
| Cột | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Khóa chính |
| `fanpage_id` | Integer (FK) | Liên kết tới `fanpages.id` (CASCADE) |
| `fb_video_id` | String(100) | ID video trả về từ Meta Graph API |
| `title` | String(255) | Tiêu đề Reel do AI tạo |
| `caption` | Text | Toàn bộ caption & hashtag |
| `video_path` | String(255) | Đường dẫn lưu video tạm thời |
| `status` | String(30) | `pending`, `rendering`, `uploading`, `published`, `failed` |
| `error_message` | Text | Chi tiết lỗi nếu thất bại |
| `published_at` | DateTime | Thời gian đăng tải thành công |

## 2. Quan hệ ORM
- `Fanpage` (1) ── (N) `QuotaLog`: Theo dõi hạn mức từng ngày.
- `Fanpage` (1) ── (N) `ReelPost`: Lịch sử toàn bộ bài đăng Reel.

## 3. Quản lý Migration với Alembic
Cấu hình Alembic tại `alembic.ini` và `alembic/env.py` trỏ vào `DATABASE_URL`.
- Lệnh sinh migration tự động:
  ```bash
  alembic revision --autogenerate -m "create_tables"
  ```
- Lệnh áp dụng nâng cấp CSDL:
  ```bash
  alembic upgrade head
  ```
