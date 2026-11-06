# app.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}
