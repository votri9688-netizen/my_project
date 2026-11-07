import os
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import base64

# Generate a random 256‑bit key if not present
def get_aes_key() -> bytes:
    key_path = Path('.env_key')
    if key_path.exists():
        return base64.urlsafe_b64decode(key_path.read_text())
    key = AESGCM.generate_key(bit_length=256)
    key_path.write_text(base64.urlsafe_b64encode(key).decode())
    return key

def encrypt_token(plain_text: str, key: bytes) -> str:
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96‑bit nonce
    ct = aesgcm.encrypt(nonce, plain_text.encode(), None)
    return base64.urlsafe_b64encode(nonce + ct).decode()

def decrypt_token(cipher_text: str, key: bytes) -> str:
    data = base64.urlsafe_b64decode(cipher_text)
    nonce, ct = data[:12], data[12:]
    aesgcm = AESGCM(key)
    pt = aesgcm.decrypt(nonce, ct, None)
    return pt.decode()
