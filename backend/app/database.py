import psycopg2
from psycopg2 import pool
from .config import settings


database_url = settings.database_url

db_pool = pool.SimpleConnectionPool(
    minconn=1,
    maxconn = 10,
    dsn=database_url
)
def get_connection():
    try:
        if db_pool:
            print("Connection pool created successfully")
        else:
            print("Failed to create connection pool")
        conn = db_pool.getconn()  
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None  


def release_connection(conn):
    try:
        db_pool.putconn(conn)  
    except Exception as e:
        print(f"Error releasing the connection: {e}")