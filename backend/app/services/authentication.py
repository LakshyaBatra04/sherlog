from passlib.context import CryptContext
from datetime import datetime
from jose import jwt 
from datetime import timedelta
from ..config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id :  int):
    
    payload = {
        "sub" : str(user_id),
        "exp" : datetime.utcnow() + timedelta(hours=24)
    }

    return jwt.encode(payload, settings.secret_key, algorithm="HS256")