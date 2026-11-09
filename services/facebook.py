import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import httpx

try:
    from config import META_USER_ACCESS_TOKEN, PUBLISH_MODE
except ImportError:
    META_USER_ACCESS_TOKEN = os.getenv("META_USER_ACCESS_TOKEN", "")
    PUBLISH_MODE = os.getenv("PUBLISH_MODE", "LIVE")

logger = logging.getLogger(__name__)

class MetaReelsService:
    GRAPH_API_VERSION = "v19.0"
    BASE_URL = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

    def __init__(self, default_access_token: Optional[str] = None):
        self.default_access_token = default_access_token or META_USER_ACCESS_TOKEN

    def upload_reel(
        self,
        page_id: str,
        video_path: str,
        description: str,
        access_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Quy trình chuẩn 3 bước của Meta Graph API để upload Facebook Reel:
        Bước 1: Khởi tạo upload session (upload_phase='start')
        Bước 2: Upload binary bytes video (upload_phase='transfer')
        Bước 3: Công bố Reel (upload_phase='finish' & video_state='PUBLISHED')
        """
        token = access_token if access_token is not None else self.default_access_token
        is_live = PUBLISH_MODE == "LIVE" and os.getenv("TESTING") != "1"

        # Nếu không ở chế độ LIVE hoặc token không hợp lệ -> mock an toàn
        if not is_live or not token or token.startswith("YOUR_"):
            logger.info("Using Mock Meta Graph API upload (dev/test mode)")
            mock_video_id = f"meta_video_{page_id}_{int(os.urandom(4).hex(), 16)}"
            return {
                "success": True,
                "video_id": mock_video_id,
                "status": "published",
                "post_url": f"https://www.facebook.com/reel/{mock_video_id}",
                "mode": "mock"
            }

        headers = {
            "Authorization": f"Bearer {token}"
        }

        # --- BƯỚC 1: Khởi tạo upload session ---
        start_url = f"{self.BASE_URL}/{page_id}/video_reels"
        start_payload = {"upload_phase": "start"}
        
        try:
            with httpx.Client(timeout=60.0) as client:
                resp_start = client.post(start_url, headers=headers, json=start_payload)
                if resp_start.status_code != 200:
                    try:
                        err_json = resp_start.json().get("error", {})
                        err_msg = err_json.get("message", resp_start.text)
                        err_code = err_json.get("code")
                        err_subcode = err_json.get("error_subcode")
                        if err_code == 100 and err_subcode == 33:
                            raise Exception(f"Lỗi Meta: Token hiện tại không có quyền quản trị Fanpage ID {page_id} (Code 100, Subcode 33). Vui lòng vào Graph API Explorer chọn đúng tên Trang này để tạo Page Token.")
                        elif err_code == 190:
                            raise Exception(f"Lỗi Meta: Token đã hết hạn (Code 190). Chi tiết: {err_msg}")
                        else:
                            raise Exception(f"Lỗi Meta Graph API ({resp_start.status_code}): {err_msg}")
                    except Exception as parse_err:
                        if "Lỗi Meta" in str(parse_err):
                            raise parse_err
                        resp_start.raise_for_status()

                start_data = resp_start.json()
                video_id = start_data["video_id"]
                upload_url = start_data.get("upload_url", f"https://rupload.facebook.com/video-upload/{video_id}")

                # --- BƯỚC 2: Upload binary video chunks ---
                file_path = Path(video_path)
                if not file_path.exists():
                    raise FileNotFoundError(f"Video file not found at: {video_path}")

                file_size = file_path.stat().st_size
                upload_headers = {
                    "Authorization": f"OAuth {token}",
                    "offset": "0",
                    "file_size": str(file_size),
                    "Content-Type": "application/octet-stream"
                }
                
                with open(file_path, "rb") as f:
                    video_bytes = f.read()

                resp_upload = client.post(upload_url, headers=upload_headers, content=video_bytes)
                if resp_upload.status_code not in (200, 201):
                    try:
                        err_msg = resp_upload.json().get("error", {}).get("message", resp_upload.text)
                        raise Exception(f"Lỗi Meta Upload Binary ({resp_upload.status_code}): {err_msg}")
                    except Exception as parse_err:
                        if "Lỗi Meta" in str(parse_err):
                            raise parse_err
                        resp_upload.raise_for_status()

                # --- BƯỚC 3: Publish Reel ---
                finish_payload = {
                    "upload_phase": "finish",
                    "video_id": video_id,
                    "video_state": "PUBLISHED",
                    "description": description
                }
                resp_finish = client.post(start_url, headers=headers, json=finish_payload)
                if resp_finish.status_code not in (200, 201):
                    try:
                        err_msg = resp_finish.json().get("error", {}).get("message", resp_finish.text)
                        raise Exception(f"Lỗi Meta Publish ({resp_finish.status_code}): {err_msg}")
                    except Exception as parse_err:
                        if "Lỗi Meta" in str(parse_err):
                            raise parse_err
                        resp_finish.raise_for_status()

                finish_data = resp_finish.json()

                return {
                    "success": finish_data.get("success", True),
                    "video_id": video_id,
                    "status": "published",
                    "post_url": f"https://www.facebook.com/reel/{video_id}",
                    "raw": finish_data
                }
        except Exception as e:
            logger.error(f"Meta Graph API error for page {page_id}: {e}")
            # Nếu API Facebook gặp lỗi token người dùng hết hạn, ghi log và ném ngoại lệ
            raise e

facebook_service = MetaReelsService()
