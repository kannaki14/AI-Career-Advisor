
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from roadmap.adaptive import analyze_learning_progress
from roadmap.generator import generate_learning_roadmap
from roadmap.storage import (
    save_roadmap,
    get_roadmap,
    update_topic_status,
)


router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap"])


class RoadmapRequest(BaseModel):
    career: str = Field(min_length=1)
    missing_skills: list[str] = Field(default_factory=list)
    skills_to_improve: list[str] = Field(default_factory=list)
    daily_study_minutes: int = Field(default=60, gt=0, le=1440)
    user_id: int | None = Field(default=None, gt=0)


class TopicStatusRequest(BaseModel):
    status: Literal["Pending", "In Progress", "Completed", "Failed"]


@router.post("/generate")
def create_roadmap(request: RoadmapRequest):
    try:
        roadmap = generate_learning_roadmap(
            career=request.career,
            missing_skills=request.missing_skills,
            skills_to_improve=request.skills_to_improve,
            daily_study_minutes=request.daily_study_minutes,
        )

        roadmap_id = save_roadmap(roadmap, request.user_id)

        return {
            "message": "Learning roadmap generated and saved successfully",
            "roadmap_id": roadmap_id,
            "roadmap": roadmap,
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/{roadmap_id}")
def read_roadmap(roadmap_id: int):
    saved = get_roadmap(roadmap_id)

    if saved is None:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    return saved


@router.patch("/{roadmap_id}/topics/{topic_id}")
def change_topic_status(
    roadmap_id: int,
    topic_id: int,
    request: TopicStatusRequest,
):
    try:
        saved = update_topic_status(
            roadmap_id,
            topic_id,
            request.status,
        )
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if saved is None:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    return {
        "message": "Topic status updated successfully",
        **saved,
    }


@router.get("/{roadmap_id}/progress")
def read_learning_progress(roadmap_id: int):
    saved = get_roadmap(roadmap_id)

    if saved is None:
        raise HTTPException(
            status_code=404,
            detail="Roadmap not found",
        )

    progress = analyze_learning_progress(saved["roadmap"])

    return {
        "roadmap_id": roadmap_id,
        "career": saved["career"],
        **progress,
    }
