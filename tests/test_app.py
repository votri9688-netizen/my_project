# tests/test_app.py
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"message": "Hello from FastAPI!"}

def test_ping():
    r = client.get("/ping")
    assert r.status_code == 200
    assert r.json() == {"message": "pong"}
