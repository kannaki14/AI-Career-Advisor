from fastapi.testclient import TestClient
from backend.api import app

client = TestClient(app)


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


def test_topic_status_and_progress():
    response = client.post(
        "/roadmap/generate",
        json={
            "career": "Test Analyst",
            "missing_skills": ["Python", "SQL"],
            "user_id": 11,
        },
    )

    assert response.status_code == 200
    roadmap_id = response.json()["roadmap_id"]

    # Mark the first topic as Completed.
    response = client.patch(
        f"/roadmap/{roadmap_id}/topics/1",
        json={"status": "Completed"},
    )

    assert response.status_code == 200

    # Mark the second topic as Failed.
    response = client.patch(
        f"/roadmap/{roadmap_id}/topics/2",
        json={"status": "Failed"},
    )

    assert response.status_code == 200

    # Verify progress is 50%.
    response = client.get(f"/roadmap/{roadmap_id}/progress")

    assert response.status_code == 200
    data = response.json()

    assert data["overall_progress_percentage"] == 50
    assert data["completed_topics"] == 1
    assert data["total_topics"] == 2
    assert "Sql" in data["struggling_skills"]


def test_invalid_status():
    response = client.post(
        "/roadmap/generate",
        json={
            "career": "Test Analyst",
            "missing_skills": ["Python"],
            "user_id": 12,
        },
    )

    roadmap_id = response.json()["roadmap_id"]

    response = client.patch(
        f"/roadmap/{roadmap_id}/topics/1",
        json={"status": "Unknown"},
    )

    assert response.status_code == 422