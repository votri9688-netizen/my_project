import os
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger(__name__)

class MetaReelsService:
    GRAPH_API_VERSION = "v19.0"
    BASE_URL = f"https://graph.facebook.com/{GRAPH_API_VERSION}"

    def __init__(self, default_access_token: Optional[str] = None):
        self.default_access_token = default_access_token or os.getenv("META_ACCESS_TOKEN", "")

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
        token = access_token or self.default_access_token
        
        # Nếu đang ở môi trường mock / test hoặc chưa có token thật
        if not token or token.startswith("YOUR_") or os.getenv("TESTING") == "1":
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
        
        with httpx.Client(timeout=60.0) as client:
            resp_start = client.post(start_url, headers=headers, json=start_payload)
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
            resp_upload.raise_for_status()

            # --- BƯỚC 3: Publish Reel ---
            finish_payload = {
                "upload_phase": "finish",
                "video_id": video_id,
                "video_state": "PUBLISHED",
                "description": description
            }
            resp_finish = client.post(start_url, headers=headers, json=finish_payload)
            resp_finish.raise_for_status()
            finish_data = resp_finish.json()

            return {
                "success": finish_data.get("success", True),
                "video_id": video_id,
                "status": "published",
                "post_url": f"https://www.facebook.com/reel/{video_id}",
                "raw": finish_data
            }

facebook_service = MetaReelsService()
