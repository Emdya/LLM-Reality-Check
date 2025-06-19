from fastapi import APIRouter, HTTPException
from services.hallucination import HallucinationDetector
from services import database
from pydantic import BaseModel
from models.schema import AnalyzeResponse
import uvicorn

router = APIRouter()
detector = HallucinationDetector()

class AnalysisRequest(BaseModel):
    prompt: str
    response: str
    threshold: float = 0.75

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_text(request: AnalysisRequest):
    try:
        results = detector.detect_hallucinations(
            request.prompt,
            request.response,
            request.threshold
        )

        #extract values from results
        flagged = results.get("flagged", False)
        summary = results.get("summary", "No summary")
        database.log_interaction(
            request.prompt,
            request.response,
            float(flagged),
            summary
        )

        return AnalyzeResponse(**results)
    
    except Exception as e:
        print("Error in /analyze")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/update_corpus")
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
    uvicorn.run(router, host="0.0.0.0", port=8000)