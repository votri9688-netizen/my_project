from unittest.mock import patch, MagicMock
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

def test_metrics():
    r = client.get("/metrics")
    assert r.status_code == 200
    assert "http" in r.text or "python" in r.text

def test_trigger_500():
    r = client.get("/trigger-500")
    assert r.status_code == 500
    assert r.json()["detail"] == "Intentional server error for alert testing"

def test_create_and_list_fanpage(db_session):
    payload = {
        "name": "Test Fanpage 1",
        "page_id": "test_page_1001",
        "quota": 50,
        "active": True
    }
    r_create = client.post("/fanpages/", json=payload)
    assert r_create.status_code == 200
    data = r_create.json()
    assert data["name"] == "Test Fanpage 1"
    assert data["page_id"] == "test_page_1001"
    assert data["quota"] == 50
    fanpage_id = data["id"]

    # List fanpages
    r_list = client.get("/fanpages/")
    assert r_list.status_code == 200
    pages = r_list.json()
    assert any(p["page_id"] == "test_page_1001" for p in pages)

    # Process fanpage with mock Celery
    with patch("tasks.process_video.delay", return_value=MagicMock()) as mock_task:
        r_proc = client.post(f"/fanpages/{fanpage_id}/process")
        assert r_proc.status_code == 200
        assert r_proc.json()["msg"] == "Processing started"
        assert mock_task.called

def test_process_fanpage_not_found(db_session):
    r_proc = client.post("/fanpages/999999/process")
    assert r_proc.status_code == 404
