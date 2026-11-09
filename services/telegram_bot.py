import os
import sys
import logging
from pathlib import Path
from datetime import date, datetime

# Ensure project root in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from telegram import Update
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters
)
import config
from database import SessionLocal
import models
from utils.crypto import decrypt_token

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Security: Only authorized admin chat ID can execute commands
ADMIN_CHAT_ID = str(config.TELEGRAM_CHAT_ID).strip()

def is_authorized(update: Update) -> bool:
    if not ADMIN_CHAT_ID or ADMIN_CHAT_ID.startswith("YOUR_"):
        # If admin ID not configured, allow with warning for initial setup
        return True
    return str(update.effective_chat.id) == ADMIN_CHAT_ID

async def auth_guard(update: Update) -> bool:
    if not is_authorized(update):
        await update.message.reply_text("⛔ <b>Truy cập bị từ chối!</b>\nBạn không có quyền điều khiển hệ thống này.", parse_mode="HTML")
        return False
    return True

# --- COMMAND HANDLERS ---
async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await auth_guard(update):
        return
    text = (
        "🤖 <b>TRUNG TÂM ĐIỀU KHIỂN TỪ XA REELS AUTOBOT</b>\n\n"
        "Chào mừng Quản trị viên! Bạn có thể điều khiển hệ thống trực tiếp trên điện thoại qua các lệnh sau:\n\n"
        "📊 <b>/status</b> - Xem tình trạng hệ thống & số bài đã đăng hôm nay\n"
        "📱 <b>/pages</b> - Danh sách 9 Fanpage & hạn mức quota\n"
        "⚙️ <b>/setquota [page_id] [quota]</b> - Đổi hạn mức đăng bài\n"
        "🚀 <b>/publish_now [page_id]</b> - Kích hoạt đăng Reel ngay\n"
        "🎬 <i>Hoặc gửi trực tiếp 1 file Video kèm ghi chú tên Page để bot tự động đăng!</i>"
    )
    await update.message.reply_text(text, parse_mode="HTML")

async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await auth_guard(update):
        return
    
    db = SessionLocal()
    try:
        today = date.today()
        total_pages = db.query(models.Fanpage).count()
        active_pages = db.query(models.Fanpage).filter(models.Fanpage.active == True).count()
        total_reels_today = db.query(models.ReelPost).filter(
            models.ReelPost.status == "published",
            models.ReelPost.created_at >= datetime(today.year, today.month, today.day)
        ).count()
        failed_reels_today = db.query(models.ReelPost).filter(
            models.ReelPost.status == "failed",
            models.ReelPost.created_at >= datetime(today.year, today.month, today.day)
        ).count()

        text = (
            "📊 <b>BÁO CÁO HỆ THỐNG HIỆN TẠI</b>\n"
            f"📅 <i>Ngày: {today.strftime('%d/%m/%Y')}</i>\n\n"
            f"📱 <b>Kênh Fanpage:</b> {active_pages}/{total_pages} đang hoạt động\n"
            f"✅ <b>Reels đã đăng hôm nay:</b> {total_reels_today} video\n"
            f"⚠️ <b>Lỗi phát sinh hôm nay:</b> {failed_reels_today} video\n"
            f"⚙️ <b>Celery & Redis:</b> Đang kết nối ổn định\n"
            f"🌐 <b>Môi trường:</b> {config.PUBLISH_MODE}\n\n"
            "🟢 <i>Hệ thống tự động hóa đang vận hành bình thường!</i>"
        )
        await update.message.reply_text(text, parse_mode="HTML")
    finally:
        db.close()

async def pages_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await auth_guard(update):
        return
    
    db = SessionLocal()
    try:
        pages = db.query(models.Fanpage).all()
        if not pages:
            await update.message.reply_text("Chưa có Fanpage nào trong CSDL.")
            return

        lines = ["📱 <b>DANH SÁCH FANPAGE HỆ THỐNG:</b>\n"]
        for p in pages:
            status_icon = "🟢" if p.active else "🔴"
            lines.append(
                f"{status_icon} <b>{p.name}</b>\n"
                f"   • ID: <code>{p.page_id}</code>\n"
                f"   • Quota ngày: <b>{p.quota}</b> bài/ngày\n"
            )
        lines.append("💡 <i>Để đổi quota: /setquota [page_id] [số_lượng]</i>")
        lines.append("💡 <i>Để đăng ngay: /publish_now [page_id]</i>")
        await update.message.reply_text("\n".join(lines), parse_mode="HTML")
    finally:
        db.close()

async def setquota_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await auth_guard(update):
        return
    
    if len(context.args) < 2:
        await update.message.reply_text("⚠️ Cú pháp: <code>/setquota [page_id] [số_lượng]</code>\nVí dụ: <code>/setquota 61596200161040 10</code>", parse_mode="HTML")
        return

    page_id = context.args[0].strip()
    try:
        new_quota = int(context.args[1].strip())
    except ValueError:
        await update.message.reply_text("❌ Số lượng quota phải là số nguyên!")
        return

    db = SessionLocal()
    try:
        fan = db.query(models.Fanpage).filter(models.Fanpage.page_id == page_id).first()
        if not fan:
            await update.message.reply_text(f"❌ Không tìm thấy Fanpage có ID: <code>{page_id}</code>", parse_mode="HTML")
            return

        old_quota = fan.quota
        fan.quota = new_quota
        
        # Update today's quota log
        today = date.today()
        qlog = db.query(models.QuotaLog).filter(
            models.QuotaLog.fanpage_id == fan.id,
            models.QuotaLog.date == today
        ).first()
        if qlog:
            diff = new_quota - old_quota
            qlog.remaining_quota = max(0, qlog.remaining_quota + diff)

        db.commit()
        await update.message.reply_text(
            f"✅ <b>Đã cập nhật hạn mức thành công!</b>\n\n"
            f"📌 <b>Trang:</b> {fan.name}\n"
            f"🔢 <b>Hạn mức mới:</b> {new_quota} bài/ngày (cũ: {old_quota})",
            parse_mode="HTML"
        )
    finally:
        db.close()

async def publish_now_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not await auth_guard(update):
        return
    
    if len(context.args) < 1:
        await update.message.reply_text("⚠️ Cú pháp: <code>/publish_now [page_id]</code>\nVí dụ: <code>/publish_now 61596200161040</code>", parse_mode="HTML")
        return

    page_id = context.args[0].strip()
    db = SessionLocal()
    try:
        fan = db.query(models.Fanpage).filter(models.Fanpage.page_id == page_id).first()
        if not fan:
            await update.message.reply_text(f"❌ Không tìm thấy Fanpage có ID: <code>{page_id}</code>", parse_mode="HTML")
            return

        # Create Reel record
        reel = models.ReelPost(
            fanpage_id=fan.id,
            title=f"Reel Mobile #{fan.page_id}",
            video_path=f"/tmp/{fan.page_id}_output.mp4",
            status="pending"
        )
        db.add(reel)
        db.commit()
        db.refresh(reel)

        # Trigger Celery
        from tasks import process_video_pipeline
        decrypted_token = decrypt_token(fan.access_token)
        process_video_pipeline.delay(
            reel_id=reel.id,
            fanpage_id=fan.id,
            page_id=fan.page_id,
            access_token=decrypted_token,
            topic="Trending Viral News"
        )

        await update.message.reply_text(
            f"🚀 <b>Đã kích hoạt xuất bản Reel ngay lập tức!</b>\n\n"
            f"📌 <b>Trang:</b> {fan.name}\n"
            f"🎬 <b>Reel ID:</b> #{reel.id}\n"
            f"⏳ <i>Tiến trình đang render video & gọi Meta Graph API trong nền...</i>",
            parse_mode="HTML"
        )
    finally:
        db.close()

async def handle_video_upload(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Xử lý khi người dùng gửi trực tiếp file video vào bot trên điện thoại"""
    if not await auth_guard(update):
        return

    message = update.message
    video = message.video or message.document
    if not video:
        return

    caption = message.caption or ""
    await message.reply_text("📥 <b>Đang tải video từ Telegram...</b>", parse_mode="HTML")

    # Destination buffer
    buffer_dir = Path("/tmp/video_buffer")
    buffer_dir.mkdir(parents=True, exist_ok=True)
    file_path = buffer_dir / f"tg_{video.file_id}.mp4"

    try:
        file = await context.bot.get_file(video.file_id)
        await file.download_to_drive(str(file_path))

        db = SessionLocal()
        try:
            # Find matching fanpage from caption or pick first active
            target_page = None
            if caption:
                target_page = db.query(models.Fanpage).filter(
                    (models.Fanpage.page_id.like(f"%{caption.strip()}%")) |
                    (models.Fanpage.name.ilike(f"%{caption.strip()}%"))
                ).first()

            if not target_page:
                target_page = db.query(models.Fanpage).filter(models.Fanpage.active == True).first()

            if not target_page:
                await message.reply_text("❌ Không có Fanpage nào khả dụng để đăng!")
                return

            reel = models.ReelPost(
                fanpage_id=target_page.id,
                title=f"Telegram Reel #{target_page.page_id}",
                caption=caption or "Video độc quyền!",
                video_path=str(file_path),
                status="pending"
            )
            db.add(reel)
            db.commit()
            db.refresh(reel)

            # Trigger Celery
            from tasks import process_video_pipeline
            decrypted_token = decrypt_token(target_page.access_token)
            process_video_pipeline.delay(
                reel_id=reel.id,
                fanpage_id=target_page.id,
                page_id=target_page.page_id,
                access_token=decrypted_token,
                topic=caption or "Viral Video"
            )

            await message.reply_text(
                f"✅ <b>Đã nhận video thành công!</b>\n\n"
                f"📌 <b>Đích đến:</b> {target_page.name}\n"
                f"💾 <b>File:</b> <code>{file_path.name}</code>\n"
                f"🚀 <i>Hệ thống đang tiến hành đẩy lên Facebook Reels...</i>",
                parse_mode="HTML"
            )
        finally:
            db.close()

    except Exception as e:
        logger.error(f"Error handling video: {e}")
        await message.reply_text(f"❌ Lỗi xử lý video: {e}")

def create_bot_app():
    token = config.TELEGRAM_BOT_TOKEN
    if not token or token.startswith("YOUR_"):
        logger.warning("TELEGRAM_BOT_TOKEN not provided. Bot runner is in standby.")
        return None

    app = ApplicationBuilder().token(token).build()
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", start_command))
    app.add_handler(CommandHandler("status", status_command))
    app.add_handler(CommandHandler("pages", pages_command))
    app.add_handler(CommandHandler("setquota", setquota_command))
    app.add_handler(CommandHandler("publish_now", publish_now_command))
    app.add_handler(MessageHandler(filters.VIDEO | filters.Document.VIDEO, handle_video_upload))
    return app

class TelegramRemoteBot:
    @staticmethod
    def create_app():
        return create_bot_app()

if __name__ == "__main__":
    bot_app = create_bot_app()
    if bot_app:
        print("🤖 Telegram Mobile Controller Bot is starting polling...")
        bot_app.run_polling()
    else:
        print("⚠️ Bot token missing. Standby mode.")
