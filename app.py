# app.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.get("/hello/{name}")
def hello(name: str):
    return {"message": f"Hello, {name}!"}

@app.get("/status")
def status():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}
