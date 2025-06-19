from vector_search import VectorSearch
import re
from typing import Dict, List

class HallucinationDetector:
    def __init__(self):
        self.vector_search = VectorSearch()
        
    def chunk_text(self, text: str, max_len: int = 300) -> List[str]:
        """Split text into meaningful chunks"""
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
        """Analyze response for potential hallucinations"""
        chunks = self.chunk_text(response)
        highlights = []
        suggestions = []
        
        cursor = 0
        for chunk in chunks:
            chunk_start = response.find(chunk, cursor)
            chunk_end = chunk_start + len(chunk)
            
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
        """Generate Grammarly-like suggestion"""
        return {
            "flagged_text": chunk,
            "suggested_correction": source[:500] + ("..." if len(source) > 500 else ""),
            "explanation": "This claim may need verification from trusted sources",
            "sources": [source]
        }
    
    def _generate_summary(self, highlights: List) -> str:
        """Generate summary of findings"""
        if not highlights:
            return "No potential hallucinations detected"
            
        num_issues = len(highlights)
        avg_confidence = 1 - sum(h["similarity"] for h in highlights) / num_issues
        return f"Found {num_issues} potential hallucinations (avg. confidence: {avg_confidence:.0%})"

# Example usage
if __name__ == "__main__":
    detector = HallucinationDetector()
    
    # Example AI response that might contain hallucinations
    prompt = "Tell me about the health benefits of turmeric"
    response = """Turmeric has been shown to cure cancer in clinical trials. 
    It also reverses Alzheimer's disease and can make you live 20 years longer. 
    The active compound curcumin is more powerful than chemotherapy."""
    
    result = detector.detect_hallucinations(prompt, response)
    print("Hallucination Analysis:")
    print(f"Flagged: {result['flagged']}")
    print(f"Summary: {result['summary']}")
    
    for i, highlight in enumerate(result["highlights"], 1):
        print(f"\nIssue {i}:")
        print(f"Text: {response[highlight['start']:highlight['end']]}")
        print(f"Similarity: {highlight['similarity']:.2f}")
        print(f"Suggested source: {highlight['matched_source'][:200]}...")
        "suggestions": suggestions,
        "summary": summary,
        "suggested_sources": list(set([h["matched_source"] for h in highlights]))
    }
