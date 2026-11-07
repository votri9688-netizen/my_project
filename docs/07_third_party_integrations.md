# 07 – Third-Party Integrations

## 1. Meta Graph API (Facebook Reels v19.0)
Nằm tại `services/facebook.py`, thực hiện quy trình chuẩn 3 bước của Meta:
1. **Khởi tạo Upload Session**:
   - `POST https://graph.facebook.com/v19.0/{page_id}/video_reels`
   - Body: `{"upload_phase": "start"}`
   - Nhận về: `video_id` và `upload_url`.
2. **Tải lên dữ liệu nhị phân (Binary Transfer)**:
   - `POST {upload_url}`
   - Header: `Authorization: OAuth {access_token}`, `offset: 0`, `file_size: {size}`
   - Body: File bytes định dạng MP4.
3. **Công bố Reel (Finish Phase)**:
   - `POST https://graph.facebook.com/v19.0/{page_id}/video_reels`
   - Body: `{"upload_phase": "finish", "video_id": video_id, "video_state": "PUBLISHED", "description": full_caption}`
   - Nhận về: Link xem Reel thực tế `https://www.facebook.com/reel/{video_id}`.

## 2. Google Gemini & AI Content Generator
Nằm tại `services/llm.py`:
- Sử dụng mô hình `gemini-1.5-flash` của Google (`google-generativeai`).
- Prompt được tinh chỉnh chuyên nghiệp để tự động trả về định dạng JSON gồm:
  - `title`: Tiêu đề giật gân, khơi gợi tò mò (<80 ký tự).
  - `caption`: Mô tả hấp dẫn có call-to-action kêu gọi tương tác.
  - `hashtags`: 5-8 hashtag chuẩn xu hướng theo chủ đề video.
- Tự động fallback sang OpenAI GPT-3.5 hoặc bộ template thông minh nếu mạng gặp sự cố.

## 3. Telegram Notifier & Alert Bot
Nằm tại `services/telegram.py`:
- Gửi tin nhắn định dạng HTML tức thì qua Telegram Bot API (`https://api.telegram.org/bot<TOKEN>/sendMessage`).
- Tự động báo cáo khi Reel được xuất bản thành công kèm đường link trực tiếp.
- Bắn thông báo khẩn cấp (kèm chi tiết lỗi và tên Fanpage) khi có lỗi xảy ra trong pipeline.
