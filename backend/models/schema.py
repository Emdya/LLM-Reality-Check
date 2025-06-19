from pydantic import BaseModel

class Submission(BaseModel):
    prompt: str
    response: str
    timestamp: str