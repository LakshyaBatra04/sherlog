from ..schemas import UserCreate, UserResponse, TokenResponse
from ..database import get_connection, release_connection
from fastapi import APIRouter, HTTPException
from ..services.authentication import hash_password, verify_password,create_access_token
router = APIRouter()

@router.post("/register" , response_model=UserResponse)
def register_user(user : UserCreate):
    if len(user.password) > 72:
        raise HTTPException(status_code=400, detail="Password too long")
    hashed_password = hash_password(user.password)
    try:
        conn = get_connection()
        curr = conn.cursor()
        curr.execute("SELECT id FROM users WHERE email = %s", (user.email,))
        existing_user = curr.fetchone()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        curr.execute(
            "INSERT INTO users (email, password_hash) VALUES (%s,%s) RETURNING id, created_at",
            (user.email, hashed_password)
        )
        user_id, created_at = curr.fetchone()
        conn.commit()
        return UserResponse(id=user_id, email=user.email, created_at=created_at)
    except HTTPException as e:
        raise e
    except Exception as e:  
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))     
    finally:        
        release_connection(conn)

@router.post("/login")
def login_user(user : UserCreate):
    try :
        conn = get_connection()
        curr = conn.cursor()
        curr.execute("SELECT id, password_hash FROM users WHERE email =%s",
                     (user.email,))
        db_user = curr.fetchone()
        if not db_user:
            raise HTTPException(status_code=400, detail="Invalid email or password")
        hashed_password = db_user[1]
        if not verify_password(user.password, hashed_password): 
            raise HTTPException(status_code=400, detail="Invalid email or password")
        token = create_access_token(db_user[0])
        return TokenResponse(access_token=token)    

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        release_connection(conn)

