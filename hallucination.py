from vector_search import search
import re
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class Suggestion:
    corrected_text: str
    explanation: str
    sources: List[str]
    follow_up_prompt: str

def chunk_text(text: str, max_len: int = 300) -> List[str]:
    """Improved text chunking that preserves context"""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = []
    current_len = 0
    
    for sentence in sentences:
        sentence_len = len(sentence)
        if current_len + sentence_len <= max_len:
            current_chunk.append(sentence)
            current_len += sentence_len
        else:
            if current_chunk:
                chunks.append(' '.join(current_chunk))
                current_chunk = [sentence]
                current_len = sentence_len
            else:
                chunks.append(sentence)
                current_len = 0
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    return chunks

def generate_suggestions(chunk: str, matched_source: str) -> Suggestion:
    """Generate Grammarly-like suggestions for a hallucinated chunk"""
    # This is a placeholder - you might want to use an LLM here
    explanation = f"This claim may be unsupported. Our trusted sources indicate: {matched_source[:200]}..."
    follow_up = f"Provide more accurate information about: {chunk[:50]}..."
    
    return Suggestion(
        corrected_text=matched_source[:len(chunk)],
        explanation=explanation,
        sources=[matched_source],
        follow_up_prompt=follow_up
    )

def detect_hallucinations(prompt: str, response: str, threshold: float = 0.75) -> Dict:
    """Enhanced detection with suggestions"""
    chunks = chunk_text(response)
    highlights = []
    suggestions = []
    flagged_chunks = []

    cursor = 0
    for chunk in chunks:
        source, score = search(chunk)
        chunk_start = response.find(chunk, cursor)
        chunk_end = chunk_start + len(chunk)
        
        if score < threshold:
            suggestion = generate_suggestions(chunk, source)
            highlights.append({
                "start": chunk_start,
                "end": chunk_end,
                "similarity": score,
                "matched_source": source
            })
            suggestions.append({
                "range": [chunk_start, chunk_end],
                "message": suggestion.explanation,
                "suggestion": suggestion.corrected_text,
                "sources": suggestion.sources,
                "follow_up": suggestion.follow_up_prompt
            })
            flagged_chunks.append(chunk)
        cursor = chunk_end

    summary = None
    if flagged_chunks:
        summary = f"Found {len(flagged_chunks)} potentially unsupported claims in the response."

    return {
        "flagged": len(highlights) > 0,
        "highlights": highlights,
        "suggestions": suggestions,
        "summary": summary,
        "suggested_sources": list(set([h["matched_source"] for h in highlights]))
    }