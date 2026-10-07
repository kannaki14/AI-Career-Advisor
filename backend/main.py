
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional

from backend.recommendation import (
    recommend_careers,
    extract_interests
)

app = FastAPI(
    title="AI Career Advisor API",
    description="Career recommendations and skill-gap analysis",
    version="1.0.0"
)


class RecommendationRequest(BaseModel):
    technical_skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    resume_text: Optional[str] = None
    top_n: int = Field(default=5, ge=1, le=20)


@app.get("/")
def home():
    return {"message": "AI Career Advisor API is running"}


@app.post("/recommendations")
def get_recommendations(request: RecommendationRequest):
    interests = request.interests

    if not interests and request.resume_text:
        interests = extract_interests(request.resume_text)

    return recommend_careers(
        user_skills=request.technical_skills,
        user_interests=interests,
        top_n=request.top_n
    )
