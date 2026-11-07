import os
import base64
from typing import Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

try:
    from config import AES_ENCRYPTION_KEY
except ImportError:
    AES_ENCRYPTION_KEY = os.getenv("AES_ENCRYPTION_KEY", "s7M_VwX_3K2j8fQ4p9Rt1u6yZ5aL0eBvCw8xG2mH4j8=")

# Ensure valid 32-byte urlsafe key for Fernet
def _get_fernet_key() -> bytes:
    key_str = AES_ENCRYPTION_KEY.strip()
    try:
        # Check if already 32 bytes urlsafe base64
        key_bytes = key_str.encode()
        Fernet(key_bytes)
        return key_bytes
    except Exception:
        # Fallback generate deterministic 32-byte base64
        padded = (key_str + "================================")[:32].encode()
        return base64.urlsafe_b64encode(padded)

FERNET_KEY = _get_fernet_key()
cipher_suite = Fernet(FERNET_KEY)

def encrypt_token(plain_token: Optional[str]) -> Optional[str]:
    """Mã hóa hai chiều Page Access Token trước khi lưu vào CSDL"""
    if not plain_token:
        return None
    try:
        encrypted_bytes = cipher_suite.encrypt(plain_token.encode("utf-8"))
        return encrypted_bytes.decode("utf-8")
    except Exception as e:
        # Return as-is if encryption fails
        return plain_token

def decrypt_token(cipher_text: Optional[str]) -> Optional[str]:
    """Giải mã token để sử dụng khi gọi Meta Graph API"""
    if not cipher_text:
        return None
    try:
        decrypted_bytes = cipher_suite.decrypt(cipher_text.encode("utf-8"))
        return decrypted_bytes.decode("utf-8")
    except Exception:
        # If not encrypted (e.g. plain token), return as-is
        return cipher_text

def mask_token(token: Optional[str]) -> str:
    """Che giấu token thô ở API layer để bảo mật tối đa"""
    if not token:
        return ""
    if len(token) <= 12:
        return "********"
    return f"{token[:6]}...{'*' * 10}...{token[-6:]}"
