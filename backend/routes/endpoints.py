from fastapi import APIRouter, HTTPException
from backend.services.hallucination import HallucinationDetector
from backend.services import database
from pydantic import BaseModel
from backend.models.schema import AnalyzeResponse
from backend.services.context_verifier import extract_entities, retrieve_wikipedia_summary, check_consistency

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
        # Step 2: Extract named entities from LLM response
        entities = extract_entities(request.response)

        # Step 3: Retrieve Wikipedia context for each entity
        trusted_context = " ".join(retrieve_wikipedia_summary(e) for e in entities)

        # Step 4: Check semantic consistency between response and Wikipedia
        trusted_score = check_consistency(request.response, trusted_context)

        # Step 5: Combine with original similarity score
        vector_score = results.get("similarity", 0.0)  # from your hallucination detector
        final_score = (0.6 * vector_score) + (0.4 * trusted_score)
        results["flagged"] = final_score < 0.65  # or whatever threshold you prefer

        # Step 6: Append new fields into the final response
        results["trusted_score"] = trusted_score
        results["trusted_context"] = trusted_context
        results["entities"] = entities
        results["final_score"] = final_score

         # Step 7: Log result (as before)
        summary = results.get("summary", "No summary")
        database.log_interaction(
            request.prompt,
            request.response,
            float(results["flagged"]),
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