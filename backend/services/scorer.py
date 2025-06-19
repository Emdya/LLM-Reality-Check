import random

def score_submission(prompt: str, response: str) -> float:
    #placeholder until FAISS + SBERT is integrated
    return round(random.uniform(30, 90),2)

def color_code(score: float) -> str:
    if score > 70:
        return "green"
    elif score >= 40:
        return "yellow"
    else:
        return "red"