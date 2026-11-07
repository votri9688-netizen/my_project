# 10 – Production Deployment & Monitoring

## 1. Triển khai Production với Docker Compose
Stack hoàn chỉnh đặt tại `prod/docker-compose.prod.yml`:
```bash
# Khởi động toàn bộ cụm dịch vụ Production
cd prod
docker compose -f docker-compose.prod.yml up -d --build
```

### Danh sách các Container dịch vụ:
1. `prod_nginx`: Cổng 80, 443. Tiếp nhận truy cập, cấp SSL.
2. `prod_api`: Cổng nội bộ 8000. Backend FastAPI.
3. `prod_db`: PostgreSQL 15 Alpine, mount dữ liệu lâu dài vào volume `pgdata_prod`.
4. `prod_redis`: Redis 7 Alpine có xác thực mật khẩu.
5. `prod_celery_worker`: Xử lý render và upload video.
6. `prod_celery_beat`: Lập lịch purge cache định kỳ.
7. `prod_prometheus`: Thu thập dữ liệu giám sát từ API & Celery.
8. `prod_alertmanager`: Gửi email cảnh báo khẩn cấp khi hệ thống phát sinh lỗi HTTP 500.
9. `prod_grafana`: Cổng 3000, giao diện bảng điều khiển đồ thị trực quan.
10. `prod_certbot`: Tự động renew SSL Let's Encrypt mỗi 12 giờ.

## 2. Thiết lập SSL Let's Encrypt
Chạy script tự động hóa:
```bash
chmod +x prod/init-ssl.sh
DOMAIN=api.yourdomain.com EMAIL=admin@yourdomain.com ./prod/init-ssl.sh
```

## 3. Sao lưu CSDL và Đồng bộ AWS S3
Cụm sao lưu hoạt động độc lập tại `prod/docker-compose.backup.yml`:
```bash
docker compose -f prod/docker-compose.backup.yml up -d
```
- **Dịch vụ `db-backup`**: Sử dụng `pg_dump` kết xuất CSDL định kỳ 24h một lần vào thư mục `./backup/`.
- **Dịch vụ `s3-sync`**: Container AWS CLI chính hãng tự động đồng bộ toàn bộ file sao lưu lên Amazon S3 Bucket (`s3://${S3_BACKUP_BUCKET}/db-backups/`).

## 4. Kiểm tra Cảnh báo Email (Alertmanager)
Khi có lỗi 500 phát sinh (có thể kiểm tra thử nghiệm bằng cách gọi `GET https://yourdomain.com/trigger-500`):
1. FastAPI ghi nhận lỗi qua Middleware Prometheus.
2. Metric `http_requests_total{status="500"}` tăng lên.
3. Prometheus kích hoạt rule `HttpServerError500` và gửi alert tới Alertmanager.
4. Alertmanager lập tức định dạng email HTML và gửi tới hòm thư quản trị viên qua SMTP.
