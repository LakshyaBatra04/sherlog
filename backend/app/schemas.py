from pydantic import BaseModel
from datetime import datetime
class EntryCreate(BaseModel):
    user_id :  int
    content : str
    type : str

class EntryResponse(EntryCreate):
    id : int
    timestamp : datetime

class SummaryResponse(BaseModel):
    entry  : str
    summary : str
    entry_id : int

class UserCreate(BaseModel):
    email : str
    password : str

class UserResponse(BaseModel):
    id : int
    email : str
    created_at : datetime

class TokenResponse(BaseModel):
    access_token : str
    token_type : str = "bearer"