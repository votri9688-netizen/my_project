import os
import json
import logging
from typing import Dict, Any, List
import httpx

try:
    from config import GROQ_API_KEY, GROQ_API_KEY_BACKUP, OPENAI_API_KEY
except ImportError:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GROQ_API_KEY_BACKUP = os.getenv("GROQ_API_KEY_BACKUP", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

logger = logging.getLogger(__name__)

class AIContentGenerator:
    def __init__(self):
        self.groq_keys = [k for k in [GROQ_API_KEY, GROQ_API_KEY_BACKUP] if k and not k.startswith("YOUR_")]
        self.openai_key = OPENAI_API_KEY if OPENAI_API_KEY and not OPENAI_API_KEY.startswith("YOUR_") else ""

    def _call_groq(self, api_key: str, topic: str) -> Dict[str, Any]:
        """Gọi Groq Cloud API với mô hình siêu tốc LLaMA-3.3-70B"""
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        prompt = (
            f"Bạn là chuyên gia sáng tạo nội dung mạng xã hội triệu view trên Facebook Reels. "
            f"Hãy sáng tạo nội dung cho video chủ đề: '{topic}'. "
            f"Bắt buộc trả về đúng định dạng JSON chuẩn (không thêm markdown ngoài JSON) với 3 trường: "
            f"\"title\" (tiêu đề ngắn dưới 70 ký tự giật gân, cuốn hút), "
            f"\"caption\" (đoạn mô tả ngắn 2-3 câu khơi gợi sự tò mò, có câu kêu gọi thả tim và follow), "
            f"\"hashtags\" (danh sách mảng 5-10 hashtag tiếng Việt và tiếng Anh thịnh hành nhất)."
        )
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You must output strictly valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "response_format": {"type": "json_object"}
        }
        with httpx.Client(timeout=20.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            content_str = data["choices"][0]["message"]["content"].strip()
            return json.loads(content_str)

    def _call_openai(self, topic: str) -> Dict[str, Any]:
        """Fallback qua OpenAI GPT-4o-mini hoặc GPT-3.5"""
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        prompt = f"Tạo nội dung Facebook Reel viral theo chủ đề '{topic}'. Trả về JSON: title, caption, hashtags (5-10 tags)."
        payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "Return valid JSON object with keys: title, caption, hashtags."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7
        }
        with httpx.Client(timeout=20.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            content_str = data["choices"][0]["message"]["content"].strip()
            return json.loads(content_str)

    def generate_reel_content(self, topic: str = "Xu Hướng Viral") -> Dict[str, Any]:
        """
        Tự động sinh tiêu đề, caption viral và bộ 5-10 hashtags.
        Ưu tiên: Groq Key 1 -> Groq Backup Key -> OpenAI -> Fallback Template.
        """
        # 1. Thử các khóa Groq
        for idx, key in enumerate(self.groq_keys):
            try:
                res = self._call_groq(key, topic)
                res["provider"] = f"groq_key_{idx+1}"
                return res
            except Exception as e:
                logger.warning(f"Groq key {idx+1} error: {e}. Trying next provider...")

        # 2. Thử OpenAI nếu có
        if self.openai_key:
            try:
                res = self._call_openai(topic)
                res["provider"] = "openai"
                return res
            except Exception as e:
                logger.warning(f"OpenAI error: {e}. Falling back to default template.")

        # 3. Fallback Template chuyên nghiệp
        return {
            "title": f"Bí Mật {topic} Bạn Chưa Từng Nghe Tới! 🔥",
            "caption": f"Xem ngay video để khám phá điều bất ngờ nhất về {topic}! Đừng quên thả tim và chia sẻ để bạn bè cùng biết nhé! 🚀",
            "hashtags": ["#reels", "#viral", "#xuhuong", "#foryou", "#trending", f"#{topic.replace(' ', '').lower()}", "#videohot", "#fbshorts"],
            "provider": "template_fallback"
        }

llm_service = AIContentGenerator()
