from fastapi import HTTPException
from passlib.context import CryptContext
from datetime import datetime
from jose import jwt 
from datetime import timedelta
from ..config import settings
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

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



oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
async def get_current_user(token : str = Depends(oauth2_scheme)):
    try :
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        user_id = payload['sub']
        if user_id is None :
            raise HTTPException(status_code=401, detail="Invalid token")
        return int(user_id)
    except jwt.ExpiredSignatureError:  
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
