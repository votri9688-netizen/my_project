import os
import sys
from datetime import date
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Ensure utf-8 output encoding on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

from database import SessionLocal, engine, Base
import models
from utils.crypto import encrypt_token

# Make sure all tables exist
Base.metadata.create_all(bind=engine)

SEED_FANPAGES = [
    {
        "name": "Review Chập Chen",
        "page_id": "61596200161040",
        "quota": 5,
        "token": "EAAwaCh9p7hQBS5TU4Q8ZAbtIinZCJ5W5ON16SeJZCn2LCx6l0fL6ujZAYIOIijlttexvLVWb6kIKwKRkeLEeRaHPZA1B9PfVncc33yemi3eapE6LafOPrJTJN6ZA5ZAg3YuKUiD1B2a31XqhZC5kqZBqwfCsCZC4VuB7EEiJl17K1wI0U104KsC59jaPAqftNeu5NzN2ecVXoX8lWtxN4pDyrPKvFQq74S5cAthjOlIMnC9ZBxB"
    },
    {
        "name": "Heo kể chuyển",
        "page_id": "61595691798001",
        "quota": 5,
        "token": "EAAwaCh9p7hQBS6BA8tygpAZAechguDn1GjZB45ZAPRMqEhTE7YTGYgDgfEciPxapawn9ZCcS0E22xpnY6aynwTHIdOdnbxRmI0gMv0S2ZA4PJw1aF9y68xYZCE0nEZClEvfuC3dQ2IV0TG49Gt4BGu9GH0nZAvU5g80z44BjNy0rPjlynkruDZCP4F4DZCFZA8fMmt6D2uOGZATPWk6KIZAkeXHojdd0ZBTJQerjsDXSHM2GMTMItZA"
    },
    {
        "name": "Ly Ly Vibe",
        "page_id": "61596282861998",
        "quota": 5,
        "token": "EAAwaCh9p7hQBSx2p3EDiZBXnyaElfPgp9YlslQkPu8xgxWzfbBc29T0WNoDVP8Bw4UYIZC6LFZAr549TmnfQZC1rkG8lgqjaD4dayjaqboLwZBM3vxQxupvpe1KUbldVWYe6x1oF6kvnfAX08f8ef2hTsIM4LqMZByGPHyPYTdRyB0DhNSHCFWXGeihFgswgLM8j5mCeAgo0gH5crl7hfCU3xSpzsVc7l7x5fNl48nyAgQ"
    },
    {
        "name": "Hồ Sơ Vụ Án",
        "page_id": "61596222054986",
        "quota": 5,
        "token": "EAAwaCh9p7hQBSZBoZBw6qIU9wQTMsXeZCjkk6fA4rh7HIv0fLNdbXthBtyxnhKVvUrbhHVcSVSqJJ4aXFvd6m3ZAkMIf2VOamGBcJ2pxCqTFwLNpggSiBXss2llLgoGXWALZBpZAQOq7ZB23DhYIk5AnQ23QAuw2ALgBMFKUMkVzbLArPoYKMwsQZAi0PWeDEOTbzPd5FZAoauf9YeRnXjDvxJJ84iufvcrAIzMK7LivotwYZA"
    },
    {
        "name": "TiTi Store",
        "page_id": "61596072302839",
        "quota": 5,
        "token": "EAAwaCh9p7hQBSZCthZA4hrMRAeXO2IAF5eRkgibXnqwqymNoSfIjHSFw6OKcnAwees4SZBuUJMSlCmS1xd35jYyqcjwIJdKguWkcv1CuYbZC0ISXFfJYxzbg7iSxuuaOhq2FcsYC167KqxfmSaj8yRQNpZBcQC0RxIPKgHUyw5nl30ExOou6Os4adoBNmqOrGAuSKZCZAWy9I3NYROrbCfg7irABg7wY0OAfvJ6gSHJqXB2"
    },
    {
        "name": "Hội Thích Ngắm Gái",
        "page_id": "61596099601356",
        "quota": 5,
        "token": "EAAwaCh9p7hQBSZCqB795EySDfsiAWCTzRkL71XPgxooSROH0CzXQ0yoS3ysKGJGJtR4TOnG8nbFfP5cQfjMM0ZAaWF0mGplDNMISqxZA61cHJejqHfUZAjdYpT3ZCFGCl6ZBW8x09PxYmf2erpZB3ZCt6h9MlgUKJdOdG0ZATp6FvvRMj3JrFp4YFxTfhn4HcDjQWOhg548wGNYY2M9ZAyEHfbKvJWFZClTRjxNoubcWjTCJKbJ"
    },
    {
        "name": "YuRi",
        "page_id": "61596112171307",
        "quota": 5,
        "token": "EAAwaCh9p7hQBS3ihipK1yYsioqCFMFFzWC8yU33ZB72di4HZBZAOLrRIljRZB1nSvMPEgCZAZCOWFmZBqLIMRcjRmNPMEH48ShVffriiJHiw2uQj64VwfjVH9gH82hdmhcE29A10hteQf019YxZCXGmLmmSEkGVOv7tHoC3jZAQhbkTtvAfyo3XjjpYiXCsdaJSAvSWAUB9iSz1eEnPZCaE7e5sxC1HxL3P6RkQcBRUZB8jYct8"
    },
    {
        "name": "Xu Hướng Mỗi Ngày",
        "page_id": "61596267770754",
        "quota": 5,
        "token": "EAAwaCh9p7hQBSZC0SPRPpqIRqNMkGGwep8a7UZAihWzutI3LNoTLV6tfzE1X5Y8kK3EvhbKbuanjcXDp1oL6HHMRRe1uMeiBIWWujMBZCTpj3tHcZBNlAsc2vDMZCWZC0RHNsCCbKsNw67qo9juagTZAAjfZBfZA2EZCE1ydCfCVjVu2ILroi9Kayzv71iV9fv6yBCBfkKEdhUtbPpJ4lYhOFvrxVGfvOZCMyQ5mwGNOa4gE30F"
    },
    {
        "name": "Vũ trụ Quanh Ta",
        "page_id": "61595959626822",
        "quota": 5,
        "token": "EAAwaCh9p7hQBSZBa45xwq3cOCXxgKKAGpZCUknFvX8mkqk9iFRiwwW55NALZBaaObLFW44p4m9Fg25EerEOKmN1ZCzB30dRLldXvnfzK8U5HDpJ5MAV6D3sZAZAbE2vAPgbeZCmcTvjOvoyT8z0jJgvugQqKjnMw2NSYV7aUwJvLs8vj8bWY3VPFbX4efEvvtUL6il2lZB8u4DDUMv9l3oPEdbaBTHVjpxhGonZBfZChIyUXJB"
    }
]

def seed():
    db = SessionLocal()
    today = date.today()
    print(">> Bat dau nap danh sach 9 Fanpage vao CSDL...")

    for item in SEED_FANPAGES:
        encrypted_token = encrypt_token(item["token"])
        
        fan = db.query(models.Fanpage).filter(models.Fanpage.page_id == item["page_id"]).first()
        if not fan:
            fan = models.Fanpage(
                name=item["name"],
                page_id=item["page_id"],
                quota=item["quota"],
                active=True,
                access_token=encrypted_token
            )
            db.add(fan)
            db.commit()
            db.refresh(fan)
            print(f"  [+] Da them moi: {fan.name} (Page ID: {fan.page_id})")
        else:
            fan.name = item["name"]
            fan.quota = item["quota"]
            fan.access_token = encrypted_token
            fan.active = True
            db.commit()
            print(f"  [*] Da cap nhat: {fan.name}")

        qlog = db.query(models.QuotaLog).filter(
            models.QuotaLog.fanpage_id == fan.id,
            models.QuotaLog.date == today
        ).first()
        if not qlog:
            qlog = models.QuotaLog(
                fanpage_id=fan.id,
                date=today,
                used_quota=0,
                remaining_quota=fan.quota
            )
            db.add(qlog)
            db.commit()

    import auth
    admin_user = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin_user:
        hashed = auth.get_password_hash("admin123456")
        admin_user = models.User(
            username="admin",
            hashed_password=hashed,
            role="admin",
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print("  [+] Da tao tai khoan admin mac dinh: admin / admin123456")

    db.close()
    print(">> Hoan tat nap du lieu thanh cong 9/9 Fanpage!")

if __name__ == "__main__":
    seed()
