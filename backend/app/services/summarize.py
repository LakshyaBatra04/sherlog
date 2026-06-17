from google import genai
from ..config import settings

client = genai.Client(api_key=settings.gemini_api_key)


def generate_summary(text: str, type : str) -> str:

    prompt = ""
    if type == "journal":
        prompt = f"You are a personal journal assistant. Read the engineer's journal entry and write a concise reflective summary. Extract: what happened, how they felt about it, and one key insight or takeaway. Keep it personal and human. Max 3 sentences."
    else :
        prompt = f'''You are a standup assistant for software engineers. Convert the journal entry into a structured standup summary. Output exactly in this format:
                    ✅ Done: ...
                    🚧 In Progress: ...
                    🔴 Blockers: ...
                    🔜 Next: ...
                    Be concise. If a category has nothing, omit it. Never make things up — only extract what's in the entry.'''
    response = client.models.generate_content(
        model="gemini-3.5-flash",
    contents=f"{prompt}\n\nJournal entry:\n{text}"    )
    return response.text.strip()
