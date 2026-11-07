import os
import json
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class AIContentGenerator:
    def __init__(self):
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.openai_key = os.getenv("OPENAI_API_KEY", "")

    def generate_reel_content(self, topic: str = "Trending Entertainment") -> Dict[str, Any]:
        """
        Sinh caption, tiêu đề giật gân, và bộ hashtag chuẩn viral cho Facebook Reel.
        Hỗ trợ Gemini -> OpenAI -> Fallback Template.
        """
        # Thử với Google Gemini trước
        if self.gemini_key and not self.gemini_key.startswith("YOUR_"):
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                model = genai.GenerativeModel("gemini-1.5-flash")
                prompt = (
                    f"Bạn là chuyên gia sáng tạo nội dung mạng xã hội triệu view. "
                    f"Hãy tạo nội dung đăng Facebook Reel theo chủ đề: '{topic}'. "
                    f"Trả về kết quả dưới định dạng JSON duy nhất với 3 trường: "
                    f"\"title\" (tiêu đề ngắn dưới 80 ký tự), "
                    f"\"caption\" (đoạn mô tả hấp dẫn, giữ chân người xem kèm call-to-action), "
                    f"\"hashtags\" (danh sách 5-8 hashtag bắt đầu bằng dấu #)."
                )
                response = model.generate_content(prompt)
                text = response.text.strip()
                # Clean json fences if any
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                data = json.loads(text.strip())
                return {
                    "title": data.get("title", f"Video {topic}"),
                    "caption": data.get("caption", f"Xem ngay video hay về {topic}"),
                    "hashtags": data.get("hashtags", ["#viral", "#reels", "#trending"]),
                    "provider": "gemini"
                }
            except Exception as e:
                logger.warning(f"Gemini generation error: {e}. Falling back to OpenAI or template.")

        # Thử với OpenAI nếu có key
        if self.openai_key and not self.openai_key.startswith("YOUR_"):
            try:
                import openai
                client = openai.OpenAI(api_key=self.openai_key)
                resp = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "Return only a JSON object with 'title', 'caption', 'hashtags'."},
                        {"role": "user", "content": f"Create viral Facebook Reel content for topic: {topic}"}
                    ],
                    temperature=0.7
                )
                data = json.loads(resp.choices[0].message.content.strip())
                return {
                    "title": data.get("title", f"Reel: {topic}"),
                    "caption": data.get("caption", f"Nội dung hot về {topic}! Đừng quên thả tim nhé!"),
                    "hashtags": data.get("hashtags", ["#reels", "#fyp", "#viral"]),
                    "provider": "openai"
                }
            except Exception as e:
                logger.warning(f"OpenAI generation error: {e}. Falling back to default template.")

        # Fallback Template chuẩn chuyên nghiệp
        return {
            "title": f"Bí mật {topic} bạn chưa từng biết! 🔥",
            "caption": f"Xem hết video để khám phá điều bất ngờ về {topic}! 🚀 Hãy bấm Follow để không bỏ lỡ video thú vị tiếp theo nhé!",
            "hashtags": ["#reels", "#trending", "#viral", "#video", "#foryou", f"#{topic.replace(' ', '').lower()}"],
            "provider": "template_fallback"
        }

llm_service = AIContentGenerator()
