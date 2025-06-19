from fastapi import FastAPI, HTTPException
from hallucination import HallucinationDetector
from pydantic import BaseModel
import uvicorn

app = FastAPI()
detector = HallucinationDetector()

class AnalysisRequest(BaseModel):
    prompt: str
    response: str
    threshold: float = 0.75

@app.post("/analyze")
async def analyze_text(request: AnalysisRequest):
    try:
        results = detector.detect_hallucinations(
            request.prompt,
            request.response,
            request.threshold
        )
        return {
            "status": "success",
            "data": results
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/update_corpus")
async def update_corpus():
    try:
        # Example - in reality you'd want more control over this
        detector.vector_search.corpus.add_from_pubmed("latest medical research")
        detector.vector_search.corpus.add_from_wikipedia("current events")
        return {"status": "success", "message": "Corpus update initiated"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e))
        
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)