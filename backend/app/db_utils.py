from .database import get_connection, release_connection

def save_summary(conn,user_id, entry_id, summary):
    try: 
        curr = conn.cursor()
        curr.execute(
            "INSERT INTO summary (entry_id, user_id, summary) VALUES (%s, %s, %s) RETURNING summary_id",
            (entry_id, user_id, summary)
        )
        conn.commit()
        return curr.fetchone()[0]
    
    except Exception as e:
        print(f"Error saving summary: {e}")
