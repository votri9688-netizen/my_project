# 08 – Security & Encryption

## 1. Mã hóa Page Access Token bằng AES-256 GCM
Facebook Page Access Token là tài sản nhạy cảm tối cao. Module `utils/crypto.py` sử dụng chuẩn mã hóa phần cứng **AES-256-GCM** (Galois/Counter Mode) đảm bảo tính toàn vẹn và bảo mật tuyệt đối:
- Khóa bí mật 256-bit được tạo và lưu trữ độc lập ngoài CSDL (`.env_key`).
- Mỗi bản ghi được mã hóa với một Nonce (IV) 96-bit ngẫu nhiên sinh từ hệ điều hành (`os.urandom(12)`).
- Dữ liệu lưu trong cột `access_token` của CSDL là chuỗi Base64 `Nonce + CipherText + Tag`.

## 2. Xác thực và Phân quyền JWT
- Sử dụng thuật toán `HS256` với khóa bí mật `JWT_SECRET_KEY`.
- Mật khẩu người dùng được băm an toàn bằng thuật toán `bcrypt` với muối (salt) ngẫu nhiên.
- API phân quyền bảo vệ bằng dependency `get_current_user` qua header:
  ```http
  Authorization: Bearer <JWT_ACCESS_TOKEN>
  ```

## 3. Bảo mật mạng & Nginx Reverse Proxy
File cấu hình `prod/nginx.conf` thiết lập các tiêu chuẩn an ninh HTTP khắt khe:
- `X-Content-Type-Options: nosniff`: Ngăn chặn MIME-type sniffing.
- `X-Frame-Options: SAMEORIGIN`: Chống tấn công Clickjacking.
- `X-XSS-Protection: 1; mode=block`: Bật bộ lọc chống Cross-Site Scripting.
- `Referrer-Policy: no-referrer-when-downgrade`.
- Tự động chuyển hướng toàn bộ lưu lượng HTTP (Port 80) sang HTTPS (Port 443).
- SSL/TLS giới hạn chỉ hỗ trợ giao thức hiện đại `TLSv1.2` và `TLSv1.3`.
