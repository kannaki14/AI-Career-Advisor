
from datetime import date

import pytest
from fastapi.testclient import TestClient

from backend.api import app
from roadmap.ai_generator import RoadmapGenerationError

client = TestClient(app)


@pytest.fixture(autouse=True)
def disable_gemini_by_default(monkeypatch):
    def _unavailable(*args, **kwargs):
        raise RoadmapGenerationError("unavailable")

    monkeypatch.setattr(
        "roadmap.api.generate_ai_learning_roadmap",
        _unavailable,
    )


def test_generate_roadmap():
    response = client.post(
        "/roadmap/generate",
        json={
            "career": "Test Data Analyst",
            "missing_skills": ["Python", "SQL"],
            "user_id": 10,
        },
    )

    assert response.status_code == 200

    data = response.json()
    assert "roadmap_id" in data
    assert data["roadmap"]["total_topics"] == 2
    assert data["generation_method"] == "fallback"


def test_generate_roadmap_uses_ai_when_available(monkeypatch):
    def fake_ai(
        career,
        missing_skills,
        skills_to_improve=None,
        daily_study_minutes=60,
    ):
        return {
            "career": career.strip(),
            "created_date": date.today().isoformat(),
            "daily_study_minutes": daily_study_minutes,
            "total_topics": 1,
            "estimated_total_hours": 8,
            "estimated_days": 8,
            "overall_progress_percentage": 0,
            "topics": [
                {
                    "topic_id": 1,
                    "skill": "Python",
                    "title": "Personalized Python Path",
                    "resource_url": "https://docs.python.org/3/tutorial/",
                    "estimated_hours": 8,
                    "prerequisites": [],
                    "status": "Pending",
                }
            ],
        }

    monkeypatch.setattr(
        "roadmap.api.generate_ai_learning_roadmap",
        fake_ai,
    )

    response = client.post(
        "/roadmap/generate",
        json={
            "career": "AI Engineer",
            "missing_skills": ["Python"],
            "user_id": 20,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["generation_method"] == "ai"
    assert data["roadmap"]["topics"][0]["title"] == "Personalized Python Path"
    assert data["roadmap_id"]


def test_generate_roadmap_falls_back_when_gemini_fails():
    response = client.post(
        "/roadmap/generate",
        json={
            "career": "Test Analyst",
            "missing_skills": ["Python", "SQL"],
            "user_id": 21,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["generation_method"] == "fallback"
    assert data["roadmap"]["total_topics"] == 2
    assert "roadmap_id" in data
    assert "roadmap" in data


def test_topic_status_and_progress():
    user_id = 11

    response = client.post(
        "/roadmap/generate",
        json={
            "career": "Test Analyst",
            "missing_skills": ["Python", "SQL"],
            "user_id": user_id,
        },
    )

    assert response.status_code == 200
    roadmap_id = response.json()["roadmap_id"]

    # Mark the first topic as Completed.
    response = client.patch(
        f"/roadmap/{roadmap_id}/topics/1?user_id={user_id}",
        json={"status": "Completed"},
    )

    assert response.status_code == 200

    # Mark the second topic as Failed.
    response = client.patch(
        f"/roadmap/{roadmap_id}/topics/2?user_id={user_id}",
        json={"status": "Failed"},
    )

    assert response.status_code == 200

    # Verify progress is 50%.
    response = client.get(
        f"/roadmap/{roadmap_id}/progress?user_id={user_id}"
    )

    assert response.status_code == 200
    data = response.json()

    assert data["overall_progress_percentage"] == 50
    assert data["completed_topics"] == 1
    assert data["total_topics"] == 2
    assert data["struggling_skills"] == ["SQL"]
    assert all(
        action["skill"] == "SQL" for action in data["next_actions"]
    )


def test_invalid_status():
    user_id = 12

    response = client.post(
        "/roadmap/generate",
        json={
            "career": "Test Analyst",
            "missing_skills": ["Python"],
            "user_id": user_id,
        },
    )

    assert response.status_code == 200
    roadmap_id = response.json()["roadmap_id"]

    response = client.patch(
        f"/roadmap/{roadmap_id}/topics/1?user_id={user_id}",
        json={"status": "Unknown"},
    )

    assert response.status_code == 422


def test_unknown_topic_returns_404():
    user_id = 13

    response = client.post(
        "/roadmap/generate",
        json={
            "career": "Test Analyst",
            "missing_skills": ["Python"],
            "user_id": user_id,
        },
    )

    assert response.status_code == 200
    roadmap_id = response.json()["roadmap_id"]

    response = client.patch(
        f"/roadmap/{roadmap_id}/topics/999?user_id={user_id}",
        json={"status": "Completed"},
    )

    assert response.status_code == 404


def test_generate_roadmap_is_career_specific():
    """Career selection should tailor and persist the selected career name."""
    user_id = 30

    response = client.post(
        "/roadmap/generate",
        json={
            "career": "Frontend Developer",
            "missing_skills": ["React", "CSS"],
            "skills_to_improve": ["JavaScript"],
            "daily_study_minutes": 45,
            "user_id": user_id,
        },
    )

    assert response.status_code == 200
    data = response.json()

    assert data["roadmap"]["career"] == "Frontend Developer"
    assert data["roadmap"]["daily_study_minutes"] == 45
    assert data["roadmap"]["total_topics"] == 3
    assert [topic["skill"] for topic in data["roadmap"]["topics"]] == [
        "JavaScript",
        "React",
        "CSS",
    ]

    saved = client.get(
        f"/roadmap/{data['roadmap_id']}?user_id={user_id}"
    )

    assert saved.status_code == 200
    saved_data = saved.json()
    assert saved_data["career"] == "Frontend Developer"
    assert saved_data["roadmap"]["career"] == "Frontend Developer"


def test_generate_roadmap_accepts_legacy_payload_without_skills_to_improve():
    """Omitting skills_to_improve should remain supported."""
    response = client.post(
        "/roadmap/generate",
        json={
            "career": "Data Analyst",
            "missing_skills": ["SQL"],
            "user_id": 33,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["roadmap"]["career"] == "Data Analyst"
    assert data["roadmap"]["total_topics"] == 1
    assert "roadmap_id" in data


def test_different_careers_produce_distinct_saved_roadmaps():
    first = client.post(
        "/roadmap/generate",
        json={
            "career": "Backend Developer",
            "missing_skills": ["Python", "SQL"],
            "user_id": 31,
        },
    )

    second = client.post(
        "/roadmap/generate",
        json={
            "career": "Data Scientist",
            "missing_skills": ["Statistics", "Machine Learning"],
            "user_id": 32,
        },
    )

    assert first.status_code == 200
    assert second.status_code == 200

    first_data = first.json()
    second_data = second.json()

    assert first_data["roadmap_id"] != second_data["roadmap_id"]
    assert first_data["roadmap"]["career"] == "Backend Developer"
    assert second_data["roadmap"]["career"] == "Data Scientist"
    assert [
        topic["skill"] for topic in first_data["roadmap"]["topics"]
    ] != [
        topic["skill"] for topic in second_data["roadmap"]["topics"]
    ]


def test_full_stack_generate_orders_skills_and_progress_without_invented_struggle():
    user_id = 40

    response = client.post(
        "/roadmap/generate",
        json={
            "career": "Full Stack Developer",
            "missing_skills": [
                "SQL",
                "React",
                "HTML",
                "Node.js",
                "CSS",
                "REST APIs",
                "Git",
                "JavaScript",
            ],
            "daily_study_minutes": 120,
            "user_id": user_id,
        },
    )

    assert response.status_code == 200
    data = response.json()
    roadmap = data["roadmap"]

    assert [topic["skill"] for topic in roadmap["topics"]] == [
        "HTML",
        "CSS",
        "JavaScript",
        "Git",
        "React",
        "Node.js",
        "REST APIs",
        "SQL",
    ]

    assert roadmap["estimated_total_hours"] == sum(
        topic["estimated_hours"] for topic in roadmap["topics"]
    )

    assert roadmap["estimated_days"] == 22
    assert roadmap["daily_study_minutes"] == 120

    progress_response = client.get(
        f"/roadmap/{data['roadmap_id']}/progress?user_id={user_id}"
    )

    assert progress_response.status_code == 200
    progress = progress_response.json()

    assert progress["struggling_skills"] == []
    assert progress["next_actions"] == []
    assert progress["completed_topics"] == 0
