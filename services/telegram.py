import os
import logging
from typing import Optional
import httpx

try:
    from config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
except ImportError:
    TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
    TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

logger = logging.getLogger(__name__)

class TelegramNotifier:
    def __init__(self, token: Optional[str] = None, chat_id: Optional[str] = None):
        self.token = token or TELEGRAM_BOT_TOKEN
        self.chat_id = chat_id or TELEGRAM_CHAT_ID
        self.api_url = f"https://api.telegram.org/bot{self.token}/sendMessage"

    def send_message(self, text: str, parse_mode: str = "HTML") -> bool:
        """Gửi tin nhắn thông báo đến quản trị viên qua Telegram Bot"""
        if not self.token or self.token.startswith("YOUR_") or not self.chat_id:
            logger.info(f"[Mock Telegram Notifier] Message: {text}")
            return True

        try:
            payload = {
                "chat_id": self.chat_id,
                "text": text,
                "parse_mode": parse_mode
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post(self.api_url, json=payload)
                return res.status_code == 200
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return False

    def notify_reel_published(self, page_name: str, reel_title: str, fb_video_id: str, post_url: str):
        msg = (
            f"🎉 <b>XUẤT BẢN REEL THÀNH CÔNG!</b>\n\n"
            f"📌 <b>Fanpage:</b> <i>{page_name}</i>\n"
            f"🎬 <b>Tiêu đề:</b> {reel_title}\n"
            f"🆔 <b>FB Video ID:</b> <code>{fb_video_id}</code>\n"
            f"🔗 <b>Xem Reel:</b> <a href='{post_url}'>Bấm vào đây để xem</a>\n\n"
            f"📱 <i>Điều khiển từ xa qua bot: Gõ /status hoặc /pages</i>"
        )
        return self.send_message(msg)

    def notify_pipeline_error(self, page_name: str, error_detail: str):
        msg = (
            f"⚠️ <b>LỖI PIPELINE XỬ LÝ VIDEO!</b>\n\n"
            f"📌 <b>Fanpage:</b> <i>{page_name}</i>\n"
            f"❌ <b>Chi tiết lỗi:</b>\n<code>{error_detail}</code>\n\n"
            f"🚨 <i>Vui lòng gõ /status để kiểm tra hệ thống!</i>"
        )
        return self.send_message(msg)

telegram_notifier = TelegramNotifier()
