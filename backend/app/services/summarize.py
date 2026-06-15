from google import genai
from ..config import settings

client = genai.Client(api_key=settings.gemini_api_key)

client.models.list()
from ..config import settings

def generate_summary(text: str) -> str:

    prompt = f'Summarize the following text \n {text} \n Summary : '

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt
    )
    return response.text.strip()
