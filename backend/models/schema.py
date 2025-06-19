from pydantic import BaseModel
from typing import List, Dict

class Suggestion(BaseModel):
    flagged_text:str
    suggested_correction:str
    explanation: str
    sources: List[str]

class Highlight(BaseModel):
    start: int
    end: int
    similarity: float
    matched_source: str

class AnalyzeResponse(BaseModel):
    flagged: bool
    summary: str
    highlights: List[Highlight]
    suggestions: List[Suggestion]