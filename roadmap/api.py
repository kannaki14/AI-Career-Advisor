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


# Create a router for all learning roadmap endpoints.
router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap"])


class RoadmapRequest(BaseModel):
    """Validate the input required to generate a learning roadmap."""

    career: str = Field(min_length=1)
    missing_skills: list[str] = Field(default_factory=list)
    skills_to_improve: list[str] = Field(default_factory=list)
    daily_study_minutes: int = Field(default=60, gt=0, le=1440)
    user_id: int | None = Field(default=None, gt=0)


class TopicStatusRequest(BaseModel):
    """Accept only the four supported learning topic statuses."""

    status: Literal["Pending", "In Progress", "Completed", "Failed"]


@router.post("/generate")
def create_roadmap(request: RoadmapRequest):
    """Generate a roadmap, save it, and return its ID and details."""
    try:
        # Generate a learning plan using the career and skill gaps.
        roadmap = generate_learning_roadmap(
            career=request.career,
            missing_skills=request.missing_skills,
            skills_to_improve=request.skills_to_improve,
            daily_study_minutes=request.daily_study_minutes,
        )

        # Save the generated roadmap for later retrieval and updates.
        roadmap_id = save_roadmap(roadmap, request.user_id)

        # Return the database ID and generated roadmap.
        return {
            "message": "Learning roadmap generated and saved successfully",
            "roadmap_id": roadmap_id,
            "roadmap": roadmap,
        }
    except ValueError as exc:
        # Return a client error when the input is invalid.
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/{roadmap_id}")
def read_roadmap(roadmap_id: int):
    """Retrieve a saved roadmap using its ID."""

    # Load the requested roadmap from the database.
    saved = get_roadmap(roadmap_id)

    # Return 404 when the roadmap ID does not exist.
    if saved is None:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    return saved


@router.patch("/{roadmap_id}/topics/{topic_id}")
def change_topic_status(
    roadmap_id: int,
    topic_id: int,
    request: TopicStatusRequest,
):
    """Update a topic status and return the updated roadmap."""
    try:
        # Update only the selected topic in the selected roadmap.
        saved = update_topic_status(
            roadmap_id,
            topic_id,
            request.status,
        )
    except LookupError as exc:
        # Return 404 when the topic ID is not found.
        raise HTTPException(status_code=404, detail=str(exc))
    except ValueError as exc:
        # Return 400 when the requested status is invalid.
        raise HTTPException(status_code=400, detail=str(exc))

    # Return 404 when the roadmap itself does not exist.
    if saved is None:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    # Include the update message and the latest saved roadmap.
    return {
        "message": "Topic status updated successfully",
        **saved,
    }


@router.get("/{roadmap_id}/progress")
def read_learning_progress(roadmap_id: int):
    """Return progress statistics and adaptive learning suggestions."""

    # Retrieve the roadmap before analyzing its learning progress.
    saved = get_roadmap(roadmap_id)

    # Return 404 when the requested roadmap does not exist.
    if saved is None:
        raise HTTPException(
            status_code=404,
            detail="Roadmap not found",
        )

    # Analyze completed, failed, and in-progress topics.
    progress = analyze_learning_progress(saved["roadmap"])

    # Return roadmap information along with progress and next actions.
    return {
        "roadmap_id": roadmap_id,
        "career": saved["career"],
        **progress,
    }