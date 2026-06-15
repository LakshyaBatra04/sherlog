from fastapi import APIRouter, HTTPException
from ..schemas import EntryCreate, EntryResponse, SummaryResponse
from ..database import get_connection, release_connection
from ..services.summarize import generate_summary
from ..db_utils import save_summary
router = APIRouter()
@router.post("/entries", response_model=EntryResponse)
def create_entry(entry: EntryCreate):
    try:
        conn = get_connection()
        curr = conn.cursor()
        curr.execute(
            "INSERT INTO entries (user_id, content, type) VALUES (%s, %s, %s) RETURNING id, timestamp",
            (entry.user_id, entry.content, entry.type)
        )
        entry_id, ts = curr.fetchone()
        conn.commit()
        print("calling openai...")
        summary = generate_summary(entry.content)
        print("summary:", summary)
        save_summary(conn,entry.user_id, entry_id, summary)
        return EntryResponse(id=entry_id, user_id=entry.user_id, content=entry.content, type=entry.type, timestamp=ts)

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        release_connection(conn)
        


@router.get("/entries/user", response_model = list[SummaryResponse])
def get_user_entries(user_id : int):
    try:
        conn = get_connection()
        curr = conn.cursor()
        curr.execute(
            "SELECT e.id, e.content, s.summary FROM entries e JOIN summary s ON e.id = s.entry_id" 
            " WHERE e.user_id = %s" 
            " ORDER BY e.timestamp DESC",
            (user_id,)

        )
        rows = curr.fetchall()
        if not rows :
            raise HTTPException(status_code=404, detail="No entries found for this user")
        return [SummaryResponse(entry=row[1], summary=row[2], entry_id=row[0]) for row in rows]
    except HTTPException as e:
        raise e    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        release_connection(conn)
    


@router.get("/entries/{entry_id}", response_model=SummaryResponse)
def get_entry_summary(entry_id : int):
    try:
        conn = get_connection()
        curr = conn.cursor()
        curr.execute(
            "SELECT e.content, s.summary FROM entries e JOIN summary s ON e.id = s.entry_id" \
            " WHERE e.id = %s",
            (entry_id,)
        )
        row = curr.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Entry not found")
        content, summary = row
        return SummaryResponse(entry=content, summary=summary, entry_id=entry_id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Entry not found")
    finally:
        release_connection(conn)
        
