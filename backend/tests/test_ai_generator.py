import json
from datetime import date
from types import SimpleNamespace

import pytest

from roadmap.ai_generator import (
    RoadmapGenerationError,
    generate_ai_learning_roadmap,
    normalize_ai_roadmap,
)


def _topic(**overrides):
    topic = {
        "topic_id": 99,
        "skill": "Python",
        "title": "Python Tutorial",
        "resource_url": "https://docs.python.org/3/tutorial/",
        "estimated_hours": 6,
        "prerequisites": [],
        "status": "Completed",
    }
    topic.update(overrides)
    return topic


def test_normalize_valid_ai_output():
    payload = {
        "career": "Ignore This Career",
        "created_date": "1999-01-01",
        "daily_study_minutes": 999,
        "total_topics": 99,
        "estimated_total_hours": 1,
        "estimated_days": 1,
        "overall_progress_percentage": 50,
        "topics": [
            _topic(),
            _topic(
                skill="SQL",
                title="SQL Tutorial",
                resource_url="https://www.w3schools.com/sql/",
                estimated_hours="5",
                prerequisites=["python"],
            ),
        ],
    }

    roadmap = normalize_ai_roadmap(
        payload,
        career=" Data Analyst ",
        daily_study_minutes=60,
        missing_skills=["Python", "SQL"],
    )

    assert roadmap["career"] == "Data Analyst"
    assert roadmap["created_date"] == date.today().isoformat()
    assert roadmap["daily_study_minutes"] == 60
    assert roadmap["total_topics"] == 2
    assert roadmap["estimated_total_hours"] == 11
    assert roadmap["estimated_days"] == 11
    assert roadmap["overall_progress_percentage"] == 0
    assert [topic["topic_id"] for topic in roadmap["topics"]] == [1, 2]
    assert roadmap["topics"][0]["status"] == "Pending"
    assert roadmap["topics"][1]["prerequisites"] == ["Python"]


@pytest.mark.parametrize(
    "payload",
    [
        {"topics": [_topic(skill="")]},
        {"topics": [_topic(title="")]},
        {"topics": [_topic(estimated_hours=0)]},
        {"topics": [_topic(resource_url="javascript:alert(1)")]},
        {"topics": [_topic(resource_url="not-a-url")]},
        {"topics": [_topic(prerequisites="Python")]},
        {
            "topics": [
                _topic(),
                _topic(skill="SQL", prerequisites=["Unknown"]),
            ]
        },
        {"topics": "not-a-list"},
        "not-an-object",
    ],
)
def test_normalize_rejects_malformed_ai_output(payload):
    with pytest.raises(RoadmapGenerationError):
        normalize_ai_roadmap(
            payload,
            career="Data Analyst",
            daily_study_minutes=60,
            missing_skills=["Python"],
        )


def test_generate_ai_uses_mocked_gemini(monkeypatch):
    payload = {
        "topics": [
            _topic(),
            _topic(
                skill="SQL",
                title="SQL Tutorial",
                resource_url="https://www.w3schools.com/sql/",
                estimated_hours=5,
                prerequisites=["Python"],
            ),
        ]
    }

    class FakeModels:
        def generate_content(self, model, contents):
            assert model == "gemini-flash-lite-latest"
            assert "Data Analyst" in contents
            return SimpleNamespace(text="```json\n" + json.dumps(payload) + "\n```")

    class FakeClient:
        def __init__(self, api_key):
            assert api_key == "test-key"
            self.models = FakeModels()

    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setattr("roadmap.ai_generator.genai.Client", FakeClient)

    roadmap = generate_ai_learning_roadmap(
        career="Data Analyst",
        missing_skills=["Python", "SQL"],
        daily_study_minutes=60,
    )

    assert roadmap["total_topics"] == 2
    assert roadmap["topics"][0]["topic_id"] == 1


def test_generate_ai_rejects_malformed_model_text(monkeypatch):
    class FakeModels:
        def generate_content(self, model, contents):
            return SimpleNamespace(text="this is not json")

    class FakeClient:
        def __init__(self, api_key):
            self.models = FakeModels()

    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setattr("roadmap.ai_generator.genai.Client", FakeClient)

    with pytest.raises(RoadmapGenerationError):
        generate_ai_learning_roadmap(
            career="Data Analyst",
            missing_skills=["Python"],
        )


def test_generate_ai_fails_without_api_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    with pytest.raises(RoadmapGenerationError):
        generate_ai_learning_roadmap(
            career="Data Analyst",
            missing_skills=["Python"],
        )
