from roadmap.adaptive import analyze_learning_progress


def _topic(skill, status, topic_id=1):
    return {
        "topic_id": topic_id,
        "skill": skill,
        "title": f"{skill} Tutorial",
        "resource_url": "https://example.com",
        "estimated_hours": 4,
        "prerequisites": [],
        "status": status,
    }


def test_no_struggling_skills_when_none_failed():
    roadmap = {
        "topics": [
            _topic("HTML", "Completed", 1),
            _topic("SQL", "Pending", 2),
            _topic("React", "In Progress", 3),
        ]
    }

    progress = analyze_learning_progress(roadmap)

    assert progress["struggling_skills"] == []
    assert progress["completed_topics"] == 1
    assert progress["overall_progress_percentage"] == 33
    assert [action["skill"] for action in progress["next_actions"]] == ["React"]
    assert all(
        action["skill"] != "SQL" for action in progress["next_actions"]
    )


def test_failed_sql_is_the_only_struggling_skill():
    roadmap = {
        "topics": [
            _topic("HTML", "Completed", 1),
            _topic("SQL", "Failed", 2),
            _topic("React", "Pending", 3),
        ]
    }

    progress = analyze_learning_progress(roadmap)

    assert progress["struggling_skills"] == ["SQL"]
    assert len(progress["next_actions"]) == 1
    assert progress["next_actions"][0]["skill"] == "SQL"
    assert progress["next_actions"][0]["reason"] == "Topic marked as Failed"


def test_pending_and_completed_topics_do_not_create_next_actions():
    roadmap = {
        "topics": [
            _topic("HTML", "Completed", 1),
            _topic("CSS", "Pending", 2),
        ]
    }

    progress = analyze_learning_progress(roadmap)

    assert progress["struggling_skills"] == []
    assert progress["next_actions"] == []
    assert progress["overall_progress_percentage"] == 50
