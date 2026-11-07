# 05 – Frontend Scaffold & Components

## 1. Công nghệ Frontend
- **Framework**: Next.js 14+ (App Router).
- **Styling**: Tailwind CSS với theme màu Slate & Brand Blue sang trọng.
- **HTTP Client**: Axios với interceptor đính kèm JWT Bearer Token tự động.
- **Kiểm thử**: Cypress E2E.

## 2. Cấu trúc thư mục
```
dashboard/
├── app/
│   ├── layout.js          # Root layout với Sidebar cố định
│   ├── globals.css        # Tailwind directives & CSS biến
│   ├── page.js            # Trang Overview (Tổng quan số liệu & Quick run)
│   ├── fanpages/
│   │   └── page.js        # Quản lý danh sách Fanpage & Modal thêm mới
│   └── reels/
│       └── page.js        # Lịch sử Reels, trạng thái & Modal xem chi tiết
├── components/
│   ├── Sidebar.js         # Navigation menu & trạng thái kết nối Backend
│   └── Header.js          # Header trang, avatar, status badge
├── lib/
│   └── api.js             # Client Axios định nghĩa các API service
├── cypress/
│   └── e2e/
│       └── fanpage.cy.js  # Kịch bản kiểm thử E2E
├── package.json
└── tailwind.config.js
```

## 3. Các màn hình chính
1. **Overview Dashboard (`/`)**:
   - 4 Card chỉ số: Tổng Fanpages, Số Reels đã xuất bản, Tổng hạn mức quota trong ngày, Tình trạng Celery Worker.
   - Danh sách Dispatch nhanh: Bấm nút `Process & Publish` để kích hoạt render video tức thì cho từng trang.
2. **Quản lý Fanpages (`/fanpages`)**:
   - Bảng hiển thị thông tin 9 Fanpage.
   - Nút bật/tắt (Toggle Active/Disabled) nhanh.
   - Modal thêm mới kênh: Nhập Tên, Meta Page ID, Hạn mức Quota, và Page Access Token.
3. **Lịch sử Reels (`/reels`)**:
   - Hiển thị toàn bộ video đã xử lý kèm badge màu trạng thái (`Published`, `Pending`, `Failed`).
   - Đường dẫn trực tiếp xem Reel trên Facebook (`https://facebook.com/reel/{id}`).
   - Modal hiển thị chi tiết caption AI, hashtags và log lỗi nếu có.
