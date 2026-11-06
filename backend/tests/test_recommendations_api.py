from fastapi.testclient import TestClient

from backend.api import app


def test_saved_recommendations_use_logged_in_user_id(tmp_path, monkeypatch):
    monkeypatch.setattr("backend.database.DB_PATH", tmp_path / "career_advisor.db")

    client = TestClient(app)

    register = client.post(
        "/auth/register",
        json={
            "full_name": "Dashboard User",
            "email": "dashboard-user@example.com",
            "password": "password123",
        },
    )
    assert register.status_code == 201
    user_id = register.json()["user"]["id"]
    assert user_id > 0

    other_user = client.post(
        "/auth/register",
        json={
            "full_name": "Other User",
            "email": "other-user@example.com",
            "password": "password123",
        },
    )
    assert other_user.status_code == 201
    other_user_id = other_user.json()["user"]["id"]
    assert other_user_id != user_id

    generated = client.post(
        "/recommendations",
        json={
            "user_id": user_id,
            "technical_skills": ["Python", "SQL", "Java"],
            "interests": ["backend"],
            "top_n": 5,
        },
    )
    assert generated.status_code == 200
    created = generated.json()["recommendations"]
    assert isinstance(created, list)
    assert len(created) > 0

    saved = client.get(f"/recommendations/{user_id}")
    assert saved.status_code == 200
    assert saved.json()["recommendations"] == created

    empty = client.get(f"/recommendations/{other_user_id}")
    assert empty.status_code == 200
    assert empty.json()["recommendations"] == []
