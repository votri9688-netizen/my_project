from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "online"

def test_ping():
    r = client.get("/ping")
    assert r.status_code == 200
    assert r.json() == {"message": "pong"}

def test_status():
    r = client.get("/status")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}

def test_metrics():
    r = client.get("/metrics")
    assert r.status_code == 200
    assert "http" in r.text or "python" in r.text

def test_trigger_500():
    r = client.get("/trigger-500")
    assert r.status_code == 500
    assert r.json()["detail"] == "Intentional server error for alert testing"

def test_auth_workflow(db_session):
    # Register
    reg_payload = {"username": "admin_test", "password": "supersecretpassword"}
    r_reg = client.post("/auth/register", json=reg_payload)
    assert r_reg.status_code == 201
    user_data = r_reg.json()
    assert user_data["username"] == "admin_test"

    # Login
    login_data = {"username": "admin_test", "password": "supersecretpassword"}
    r_login = client.post("/auth/login", data=login_data)
    assert r_login.status_code == 200
    token = r_login.json()["access_token"]
    assert token is not None

    # Get Me
    headers = {"Authorization": f"Bearer {token}"}
    r_me = client.get("/auth/me", headers=headers)
    assert r_me.status_code == 200
    assert r_me.json()["username"] == "admin_test"

def test_fanpage_crud_and_process(db_session):
    # Create fanpage
    payload = {
        "name": "E2E Tech Fanpage",
        "page_id": "page_tech_999",
        "quota": 20,
        "active": True
    }
    r_create = client.post("/fanpages/", json=payload)
    assert r_create.status_code == 200
    fan = r_create.json()
    fan_id = fan["id"]
    assert fan["name"] == "E2E Tech Fanpage"

    # List fanpages
    r_list = client.get("/fanpages/")
    assert r_list.status_code == 200
    assert len(r_list.json()) >= 1

    # Update fanpage
    r_up = client.put(f"/fanpages/{fan_id}", json={"quota": 25})
    assert r_up.status_code == 200
    assert r_up.json()["quota"] == 25

    # Process fanpage with pipeline
    with patch("tasks.process_video_pipeline.delay", return_value=MagicMock()) as mock_task:
        r_proc = client.post(f"/fanpages/{fan_id}/process?topic=AI%20Tech")
        assert r_proc.status_code == 200
        assert r_proc.json()["msg"] == "Processing started"
        assert mock_task.called

    # List reels
    r_reels = client.get("/reels/")
    assert r_reels.status_code == 200
    assert isinstance(r_reels.json(), list)
