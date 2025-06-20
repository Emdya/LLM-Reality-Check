"""
VECTOR SEARCH SERVICE
Purpose: Interface between knowledge corpus and hallucination detector
Key Features:
- Wraps FAISS index for easy querying
- Provides hallucination threshold checking
"""

from knowledge_corpus import KnowledgeCorpus
import numpy as np
from typing import Tuple

class VectorSearch:
    """Wrapper for semantic search against knowledge base"""
    
    def __init__(self, corpus_path: str = "knowledge_corpus"):
        """
        Initialize with path to knowledge corpus
        Args:
            corpus_path: Directory containing corpus data
        """
        self.corpus = KnowledgeCorpus(corpus_path)
        
    def search(self, text_chunk: str, threshold: float = 0.75) -> Tuple[str, float]:
        """
        Search corpus for similar content
        Args:
            text_chunk: Text to verify
            threshold: Similarity threshold (0-1)
        Returns:
            Tuple of (best_match_text, similarity_score)
        """
        results = self.corpus.search(text_chunk, k=1)
        return results[0] if results else ("", 0.0)
        
    def is_hallucination(self, text_chunk: str, threshold: float = 0.75) -> bool:
        """
        Determine if text is likely hallucinated
        Args:
            text_chunk: Text to check
            threshold: Minimum similarity score to consider valid
        Returns:
            True if text is likely hallucinated (similarity < threshold)
        """
        _, similarity = self.search(text_chunk, threshold)
        return similarity < threshold
