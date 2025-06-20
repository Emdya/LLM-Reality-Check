"""
HALLUCINATION DETECTOR
Purpose: Analyze AI-generated text for factual inaccuracies
Workflow:
1. Splits text into manageable chunks
2. Verifies each chunk against knowledge base
3. Generates highlighted suggestions
"""

from vector_search import VectorSearch
import re
from typing import Dict, List

class HallucinationDetector:
    """Main class for detecting and explaining hallucinations"""
    
    def __init__(self):
        """Initialize with vector search backend"""
        self.vector_search = VectorSearch()
        
    def chunk_text(self, text: str, max_len: int = 300) -> List[str]:
        """
        Split text into meaningful chunks
        Args:
            text: Input text to chunk
            max_len: Maximum chunk length in characters
        Returns:
            List of text chunks
        """
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

    def detect_hallucinations(self, prompt: str, response: str, threshold: float = 0.75) -> Dict:
        """
        Main analysis function
        Args:
            prompt: User's original prompt
            response: AI-generated response to check
            threshold: Similarity threshold (0-1)
        Returns:
            Dictionary containing:
            - flagged: Boolean indicating if hallucinations were found
            - highlights: List of problematic text spans
            - suggestions: Proposed corrections
            - summary: Analysis summary
        """
        chunks = self.chunk_text(response)
        highlights = []
        suggestions = []
        
        cursor = 0
        for chunk in chunks:
            chunk_start = response.find(chunk, cursor)
            chunk_end = chunk_start + len(chunk)
            
            # Verify against knowledge base
            source, similarity = self.vector_search.search(chunk)
            
            if similarity < threshold:
                highlights.append({
                    "start": chunk_start,
                    "end": chunk_end,
                    "similarity": similarity,
                    "matched_source": source
                })
                suggestions.append(self._generate_suggestion(chunk, source))
            
            cursor = chunk_end
        
        return {
            "flagged": len(highlights) > 0,
            "highlights": highlights,
            "suggestions": suggestions,
            "summary": self._generate_summary(highlights)
        }
    
    def _generate_suggestion(self, chunk: str, source: str) -> Dict:
        """Generate Grammarly-style suggestion for flagged text"""
        return {
            "flagged_text": chunk,
            "suggested_correction": source[:500] + ("..." if len(source) > 500 else ""),
            "explanation": "Potential hallucination - verify against source",
            "sources": [source]
        }
    
    def _generate_summary(self, highlights: List) -> str:
        """Generate analysis summary"""
        if not highlights:
            return "No hallucinations detected"
        return f"Found {len(highlights)} potential issues (avg. confidence: {1 - sum(h['similarity'] for h in highlights)/len(highlights):.0%})"
