# vector_search.py
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

# Load your knowledge base (e.g. trusted source docs)
with open("corpus.txt", "r") as f:
    corpus = f.readlines()
corpus_embeddings = model.encode(corpus, convert_to_numpy=True)

# Build FAISS index
dimension = corpus_embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(corpus_embeddings)

def search(text_chunk: str):
    query_vec = model.encode([text_chunk])[0]
    D, I = index.search(np.array([query_vec]), k=1)
    match_index = I[0][0]
    similarity = 1 - D[0][0]  # lower distance = higher similarity
    return corpus[match_index], similarity
