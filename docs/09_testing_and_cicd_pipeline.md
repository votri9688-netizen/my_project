# 09 – Testing & CI/CD Pipeline

## 1. Unit Testing với Pytest
- **Thư mục kiểm thử**: `tests/`
- **Chiến lược cách ly (Isolation)**:
  - Khi chạy unit test, môi trường tự động nhận diện biến `TESTING=1`.
  - Toàn bộ kết nối PostgreSQL được chuyển hướng sang SQLite in-memory file (`test.db`) thông qua fixture `tests/conftest.py`.
  - Celery Worker được cấu hình chế độ `task_always_eager=True`, cho phép chạy test tức thì mà không cần khởi động Redis server thật.
- **Phạm vi kiểm thử (100% Passed)**:
  - `test_root`: Kiểm tra trạng thái hệ thống.
  - `test_ping`, `test_status`: Kiểm tra Healthcheck endpoint.
  - `test_metrics`: Kiểm tra endpoint Prometheus.
  - `test_trigger_500`: Kiểm tra mã lỗi phục vụ kích hoạt cảnh báo Alertmanager.
  - `test_auth_workflow`: Kiểm tra luồng Đăng ký -> Đăng nhập lấy JWT -> Truy xuất thông tin người dùng.
  - `test_fanpage_crud_and_process`: Kiểm tra tạo, cập nhật Fanpage và kích hoạt Celery pipeline.

## 2. End-to-End Testing với Cypress
- **File kịch bản**: `dashboard/cypress/e2e/fanpage.cy.js`
- **Mô phỏng (Mocking)**: Sử dụng `cy.intercept()` để mock các response của Meta Graph API Facebook (`https://graph.facebook.com/**`), giúp test E2E chạy ổn định, nhanh chóng mà không cần tốn quota thật của Facebook.

## 3. GitHub Actions Pipeline
Workflow `.github/workflows/staging.yml` tự động kích hoạt trên mỗi commit/pull request:
1. **Job `unit-test`**: Cài đặt Python 3.11, cache dependency, chạy `pytest -v`.
2. **Job `staging-e2e`**:
   - Dựng toàn bộ Staging Docker Stack bằng `docker compose up -d --build`.
   - Polling kiểm tra API Healthcheck đến khi sẵn sàng.
   - Cài đặt Node 20 trong thư mục `dashboard/`.
   - Chạy Cypress headless (`npx cypress run`).
   - Tự động chụp và tải lên ảnh màn hình nếu có lỗi (`upload-artifact`).
   - Dọn dẹp môi trường (`docker compose down -v`).
