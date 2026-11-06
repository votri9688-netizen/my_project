import sys, os
# Ensure project root in path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
from fastapi.testclient import TestClient
from app import app
client = TestClient(app)

def test_ping():
    r = client.get('/ping')
    assert r.status_code == 200
    assert r.json() == {"message": "pong"}

def test_root():
    r = client.get('/')
    assert r.status_code == 200
    assert r.json() == {"message": "Hello from FastAPI!"}

def test_status():
    r = client.get('/status')
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}

if __name__ == '__main__':
    for fn in [test_ping, test_root, test_status]:
        fn()
    print('All checks passed')
