"""
KNOWLEDGE CORPUS BUILDER
Purpose: Aggregates and manages knowledge from authoritative sources (PubMed, Wikipedia, Google Scholar)
Features:
- Automated fetching from multiple APIs
- Text cleaning and deduplication
- FAISS vector index for semantic search
"""

import requests
from bs4 import BeautifulSoup
from scholarly import scholarly
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os
import json
from typing import List, Dict, Tuple
import time
import re

class KnowledgeCorpus:
    """Main class for building and searching a knowledge base"""
    
    def __init__(self, corpus_dir: str = "knowledge_corpus"):
        """
        Initialize the knowledge corpus
        Args:
            corpus_dir: Directory to store corpus data (default: "knowledge_corpus")
        """
        self.corpus_dir = corpus_dir
        self.corpus_file = os.path.join(corpus_dir, "corpus.json")
        self.model = SentenceTransformer("all-MiniLM-L6-v2")  # Embedding model
        self.index = None  # FAISS index
        self.corpus = []  # List of knowledge entries
        
        os.makedirs(corpus_dir, exist_ok=True)
        self._load_or_initialize_corpus()

    def _load_or_initialize_corpus(self):
        """Load existing corpus or create new empty corpus"""
        if os.path.exists(self.corpus_file):
            with open(self.corpus_file, "r", encoding="utf-8") as f:
                self.corpus = json.load(f)
            print(f"Loaded existing corpus with {len(self.corpus)} entries")
        else:
            self.corpus = []
            print("Initialized new empty corpus")
        self._build_index()

    def _build_index(self):
        """Build/rebuild FAISS vector search index"""
        if not self.corpus:
            self.index = None
            return
            
        # Generate embeddings for all corpus entries
        texts = [entry["content"] for entry in self.corpus]
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        
        # Initialize FAISS index
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)  # L2 distance metric
        self.index.add(embeddings)  # Add embeddings to index
        print(f"Built FAISS index with {len(self.corpus)} entries")

    def _clean_text(self, text: str) -> str:
        """Clean and normalize text content"""
        text = re.sub(r'\s+', ' ', text)  # Collapse whitespace
        text = re.sub(r'\[\d+\]', '', text)  # Remove citation markers
        return text.strip()

    # --- Data Fetching Methods ---
    def add_from_pubmed(self, query: str, max_results: int = 50):
        """
        Fetch medical/scientific articles from PubMed
        Args:
            query: Search term (e.g., "machine learning in healthcare")
            max_results: Maximum articles to retrieve
        """
        base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        params = {
            "db": "pubmed",
            "term": query,
            "retmax": max_results,
            "retmode": "json"
        }
        
        try:
            # Step 1: Search for articles
            response = requests.get(base_url, params=params)
            data = response.json()
            id_list = data.get("esearchresult", {}).get("idlist", [])
            
            # Step 2: Fetch details for each article
            for pubmed_id in id_list:
                fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
                fetch_params = {
                    "db": "pubmed",
                    "id": pubmed_id,
                    "retmode": "xml"
                }
                
                article_response = requests.get(fetch_url, params=fetch_params)
                soup = BeautifulSoup(article_response.text, "xml")
                
                # Extract title and abstract
                title = soup.find("ArticleTitle").text if soup.find("ArticleTitle") else ""
                abstract = soup.find("AbstractText").text if soup.find("AbstractText") else ""
                
                if title or abstract:
                    content = f"{title}. {abstract}"
                    self._add_entry({
                        "source": "pubmed",
                        "source_id": pubmed_id,
                        "content": self._clean_text(content),
                        "metadata": {
                            "query": query,
                            "added": time.time()
                        }
                    })
                    
        except Exception as e:
            print(f"PubMed fetch error: {str(e)}")

     def add_from_wikipedia(self, query: str, max_results: int = 10):
        """Fetch articles from Wikipedia"""
        base_url = "https://en.wikipedia.org/w/api.php"
        params = {
            "action": "query",
            "format": "json",
            "list": "search",
            "srsearch": query,
            "srlimit": max_results
        }
        
        try:
            response = requests.get(base_url, params=params)
            data = response.json()
            
            for result in data.get("query", {}).get("search", []):
                page_id = result.get("pageid")
                title = result.get("title")
                
                if page_id and title:
                    content_url = "https://en.wikipedia.org/w/api.php"
                    content_params = {
                        "action": "query",
                        "format": "json",
                        "prop": "extracts",
                        "pageids": page_id,
                        "exintro": True,
                        "explaintext": True
                    }
                    
                    content_response = requests.get(content_url, params=content_params)
                    content_data = content_response.json()
                    extract = content_data.get("query", {}).get("pages", {}).get(str(page_id), {}).get("extract", "")
                    
                    if extract:
                        self._add_entry({
                            "source": "wikipedia",
                            "source_id": str(page_id),
                            "content": self._clean_text(f"{title}. {extract}"),
                            "metadata": {
                                "query": query,
                                "added": time.time()
                            }
                        })
                        
        except Exception as e:
            print(f"Error fetching from Wikipedia: {str(e)}")

    def add_from_scholar(self, query: str, max_results: int = 10):
        """Fetch articles from Google Scholar"""
        try:
            search_query = scholarly.search_pubs(query)
            
            for i, result in enumerate(search_query):
                if i >= max_results:
                    break
                
                if result.get("bib", {}).get("abstract"):
                    self._add_entry({
                        "source": "scholar",
                        "source_id": result.get("author_id", ""),
                        "content": self._clean_text(result["bib"]["abstract"]),
                        "metadata": {
                            "query": query,
                            "title": result["bib"].get("title", ""),
                            "added": time.time()
                        }
                    })
                    
        except Exception as e:
            print(f"Error fetching from Google Scholar: {str(e)}")

    # ... (similar detailed docs for Wikipedia/Scholar methods)

    def _add_entry(self, entry: Dict):
        """
        Add a new entry to corpus after validation
        Args:
            entry: Dictionary containing:
                - source: Data source (e.g., "pubmed")
                - source_id: Unique ID from source
                - content: Text content
                - metadata: Additional context
        """
        content = entry["content"]
        
        # Skip duplicates
        if any(e["content"] == content for e in self.corpus):
            return
            
        self.corpus.append(entry)
        
        # Periodically save and rebuild index
        if len(self.corpus) % 10 == 0:
            self._save_corpus()
            self._build_index()

    def search(self, query: str, k: int = 3) -> List[Tuple[str, float]]:
        """
        Semantic search against knowledge base
        Args:
            query: Text to search for
            k: Number of results to return
        Returns:
            List of (content, similarity_score) tuples
        """
        if not self.index or not self.corpus:
            return []
            
        # Encode query and search index
        query_embedding = self.model.encode([query])[0]
        D, I = self.index.search(np.array([query_embedding]), k)
        
        # Format results
        results = []
        for i in range(k):
            idx = I[0][i]
            if idx >= len(self.corpus):
                continue
            similarity = 1 - D[0][i]  # Convert distance to similarity
            results.append((self.corpus[idx]["content"], similarity))
            
        return results

if __name__ == "__main__":
    # Initialize corpus
    corpus = KnowledgeCorpus()
    
    # Populate with knowledge (run periodically to update)
    print("Fetching from PubMed...")
    corpus.add_from_pubmed("machine learning in healthcare")
    
    print("Fetching from Wikipedia...")
    corpus.add_from_wikipedia("artificial intelligence")
    
    print("Fetching from Google Scholar...")
    corpus.add_from_scholar("large language models")
    
    # Example search
    query = "What are the applications of AI in medicine?"
    print(f"\nSearching for: '{query}'")
    
    results = corpus.search(query)
    for i, (content, score) in enumerate(results, 1):
        print(f"\nResult {i} (Score: {score:.2f}):")
        print(content[:500] + ("..." if len(content) > 500 else ""))
