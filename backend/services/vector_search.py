from services.knowledge_corpus import KnowledgeCorpus  # Assuming you saved the previous code in knowledge_corpus.py
import numpy as np
from typing import Tuple

class VectorSearch:
    def __init__(self, corpus_path: str = "knowledge_corpus"):
        self.corpus = KnowledgeCorpus(corpus_path)
        
    def search(self, text_chunk: str, threshold: float = 0.75) -> Tuple[str, float]:
        """Search the knowledge corpus and return best match with similarity score"""
        results = self.corpus.search(text_chunk, k=1)
        
        if not results:
            return "", 0.0
            
        best_match, similarity = results[0]
        return best_match, similarity
        
    def is_hallucination(self, text_chunk: str, threshold: float = 0.75) -> bool:
        """Determine if text is likely a hallucination"""
        _, similarity = self.search(text_chunk, threshold)
        return similarity < threshold
