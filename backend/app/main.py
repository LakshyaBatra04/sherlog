from fastapi import FastAPI
from .routers import auth
from .routers import entries
from .config import settings


app = FastAPI()

app.include_router(entries.router)
app.include_router(auth.router, prefix="/auth")
@app.get("/")
def read_root():
    return {"message": "Welcome to Sherlog"}
