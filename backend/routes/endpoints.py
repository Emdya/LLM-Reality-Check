from fastapi import APIRouter
from models.schema import Submission
from services import scorer, database

router = APIRouter()

@router.post("/submit-response")
def submit_response(submission: Submission):
    score = scorer.score_submission(submission.prompt, submission.response)
    database.log_interaction(submission, score)
    return{
        "similarity_score": score,
        "color": scorer.color_code(score),
        "status" : "ok"
    }