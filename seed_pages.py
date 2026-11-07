import httpx

pages_data = [
    {
        "fb_page_id": "61596200161040",
        "name": "Review Chập Chen",
        "daily_quota": 5,
        "access_token": "EAAwaCh9p7hQBS5TU4Q8ZAbtIinZCJ5W5ON16SeJZCn2LCx6l0fL6ujZAYIOIijlttexvLVWb6kIKwKRkeLEeRaHPZA1B9PfVncc33yemi3eapE6LafOPrJTJN6ZA5ZAg3YuKUiD1B2a31XqhZC5kqZBqwfCsCZC4VuB7EEiJl17K1wI0U104KsC59jaPAqftNeu5NzN2ecVXoX8lWtxN4pDyrPKvFQq74S5cAthjOlIMnC9ZBxB"
    },
    {
        "fb_page_id": "61595691798001",
        "name": "Heo kể chuyển",
        "daily_quota": 5,
        "access_token": "EAAwaCh9p7hQBS6BA8tygpAZAechguDn1GjZB45ZAPRMqEhTE7YTGYgDgfEciPxapawn9ZCcS0E22xpnY6aynwTHIdOdnbxRmI0gMv0S2ZA4PJw1aF9y68xYZCE0nEZClEvfuC3dQ2IV0TG49Gt4BGu9GH0nZAvU5g80z44BjNy0rPjlynkruDZCP4F4DZCFZA8fMmt6D2uOGZATPWk6KIZAkeXHojdd0ZBTJQerjsDXSHM2GMTMItZA"
    },
    {
        "fb_page_id": "61596282861998",
        "name": "Ly Ly Vibe",
        "daily_quota": 5,
        "access_token": "EAAwaCh9p7hQBSx2p3EDiZBXnyaElfPgp9YlslQkPu8xgxWzfbBc29T0WNoDVP8Bw4UYIZC6LFZAr549TmnfQZC1rkG8lgqjaD4dayjaqboLwZBM3vxQxupvpe1KUbldVWYe6x1oF6kvnfAX08f8ef2hTsIM4LqMZByGPHyPYTdRyB0DhNSHCFWXGeihFgswgLM8j5mCeAgo0gH5crl7hfCU3xSpzsVc7l7x5fNl48nyAgQ"
    },
    {
        "fb_page_id": "61596222054986",
        "name": "Hồ Sơ Vụ Án",
        "daily_quota": 5,
        "access_token": "EAAwaCh9p7hQBSZBoZBw6qIU9wQTMsXeZCjkk6fA4rh7HIv0fLNdbXthBtyxnhKVvUrbhHVcSVSqJJ4aXFvd6m3ZAkMIf2VOamGBcJ2pxCqTFwLNpggSiBXss2llLgoGXWALZBpZAQOq7ZB23DhYIk5AnQ23QAuw2ALgBMFKUMkVzbLArPoYKMwsQZAi0PWeDEOTbzPd5FZAoauf9YeRnXjDvxJJ84iufvcrAIzMK7LivotwYZA"
    },
    {
        "fb_page_id": "61596072302839",
        "name": "TiTi Store",
        "daily_quota": 5,
        "access_token": "EAAwaCh9p7hQBSZCthZA4hrMRAeXO2IAF5eRkgibXnqwqymNoSfIjHSFw6OKcnAwees4SZBuUJMSlCmS1xd35jYyqcjwIJdKguWkcv1CuYbZC0ISXFfJYxzbg7iSxuuaOhq2FcsYC167KqxfmSaj8yRQNpZBcQC0RxIPKgHUyw5nl30ExOou6Os4adoBNmqOrGAuSKZCZAWy9I3NYROrbCfg7irABg7wY0OAfvJ6gSHJqXB2"
    },
    {
        "fb_page_id": "61596099601356",
        "name": "Hội Thích Ngắm Gái",
        "daily_quota": 5,
        "access_token": "EAAwaCh9p7hQBSZCqB795EySDfsiAWCTzRkL71XPgxooSROH0CzXQ0yoS3ysKGJGJtR4TOnG8nbFfP5cQfjMM0ZAaWF0mGplDNMISqxZA61cHJejqHfUZAjdYpT3ZCFGCl6ZBW8x09PxYmf2erpZB3ZCt6h9MlgUKJdOdG0ZATp6FvvRMj3JrFp4YFxTfhn4HcDjQWOhg548wGNYY2M9ZAyEHfbKvJWFZClTRjxNoubcWjTCJKbJ"
    },
    {
        "fb_page_id": "61596112171307",
        "name": "YuRi",
        "daily_quota": 5,
        "access_token": "EAAwaCh9p7hQBS3ihipK1yYsioqCFMFFzWC8yU33ZB72di4HZBZAOLrRIljRZB1nSvMPEgCZAZCOWFmZBqLIMRcjRmNPMEH48ShVffriiJHiw2uQj64VwfjVH9gH82hdmhcE29A10hteQf019YxZCXGmLmmSEkGVOv7tHoC3jZAQhbkTtvAfyo3XjjpYiXCsdaJSAvSWAUB9iSz1eEnPZCaE7e5sxC1HxL3P6RkQcBRUZB8jYct8"
    },
    {
        "fb_page_id": "61596267770754",
        "name": "Xu Hướng Mỗi Ngày",
        "daily_quota": 5,
        "access_token": "EAAwaCh9p7hQBSZC0SPRPpqIRqNMkGGwep8a7UZAihWzutI3LNoTLV6tfzE1X5Y8kK3EvhbKbuanjcXDp1oL6HHMRRe1uMeiBIWWujMBZCTpj3tHcZBNlAsc2vDMZCWZC0RHNsCCbKsNw67qo9juagTZAAjfZBfZA2EZCE1ydCfCVjVu2ILroi9Kayzv71iV9fv6yBCBfkKEdhUtbPpJ4lYhOFvrxVGfvOZCMyQ5mwGNOa4gE30F"
    },
    {
        "fb_page_id": "61595959626822",
        "name": "Vũ trụ Quanh Ta",
        "daily_quota": 5,
        "access_token": "EAAwaCh9p7hQBSZBa45xwq3cOCXxgKKAGpZCUknFvX8mkqk9iFRiwwW55NALZBaaObLFW44p4m9Fg25EerEOKmN1ZCzB30dRLldXvnfzK8U5HDpJ5MAV6D3sZAZAbE2vAPgbeZCmcTvjOvoyT8z0jJgvugQqKjnMw2NSYV7aUwJvLs8vj8bWY3VPFbX4efEvvtUL6il2lZB8u4DDUMv9l3oPEdbaBTHVjpxhGonZBfZChIyUXJB"
    }
]

with httpx.Client(base_url="http://localhost:8000") as client:
    for page in pages_data:
        try:
            res = client.post("/pages", json=page)
            if res.status_code == 201:
                print(f"[OK] {page['name']} (ID: {page['fb_page_id']}) - Đã thêm thành công.")
            else:
                print(f"[ERR] {page['name']} - Lỗi ({res.status_code}): {res.text}")
        except Exception as e:
            print(f"[FAIL] Không thể kết nối tới server: {e}")
