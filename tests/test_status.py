from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_status():
    r = client.get("/status")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}
