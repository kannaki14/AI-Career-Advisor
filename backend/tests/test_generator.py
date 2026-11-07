from roadmap.generator import RESOURCE_CATALOG, generate_learning_roadmap


FULL_STACK_SKILLS = [
    "HTML",
    "CSS",
    "JavaScript",
    "Git",
    "React",
    "Node.js",
    "REST APIs",
    "SQL",
]

SHUFFLED_FULL_STACK_SKILLS = [
    "Git",
    "SQL",
    "React",
    "HTML",
    "Node.js",
    "CSS",
    "REST APIs",
    "JavaScript",
]


def test_full_stack_roadmap_uses_sensible_learning_order():
    # Intentionally shuffle the skills so career order must be applied.
    # Put Git first to mirror the incorrect AI-style ordering.
    roadmap = generate_learning_roadmap(
        career="Full Stack Developer",
        missing_skills=SHUFFLED_FULL_STACK_SKILLS,
        skills_to_improve=list(reversed(SHUFFLED_FULL_STACK_SKILLS)),
        daily_study_minutes=60,
    )

    assert [topic["skill"] for topic in roadmap["topics"]] == FULL_STACK_SKILLS
    assert [topic["topic_id"] for topic in roadmap["topics"]] == list(range(1, 9))
    assert roadmap["topics"][0]["prerequisites"] == []
    assert roadmap["topics"][1]["prerequisites"] == ["HTML"]


def test_full_stack_roadmap_uses_curated_resource_urls():
    roadmap = generate_learning_roadmap(
        career="Full Stack Developer",
        missing_skills=FULL_STACK_SKILLS,
        daily_study_minutes=120,
    )

    assert roadmap["total_topics"] == 8
    for topic in roadmap["topics"]:
        assert topic["resource_url"].startswith("https://")
        assert "google.com/search" not in topic["resource_url"]

    expected_urls = {
        "HTML": RESOURCE_CATALOG["html"]["url"],
        "CSS": RESOURCE_CATALOG["css"]["url"],
        "JavaScript": RESOURCE_CATALOG["javascript"]["url"],
        "Git": RESOURCE_CATALOG["git"]["url"],
        "React": RESOURCE_CATALOG["react"]["url"],
        "Node.js": RESOURCE_CATALOG["node.js"]["url"],
        "REST APIs": RESOURCE_CATALOG["rest apis"]["url"],
        "SQL": RESOURCE_CATALOG["sql"]["url"],
    }
    for topic in roadmap["topics"]:
        assert topic["resource_url"] == expected_urls[topic["skill"]]


def test_estimated_total_hours_equals_sum_of_topic_hours():
    roadmap = generate_learning_roadmap(
        career="Full Stack Developer",
        missing_skills=FULL_STACK_SKILLS,
        daily_study_minutes=60,
    )

    topic_hours = sum(topic["estimated_hours"] for topic in roadmap["topics"])
    assert roadmap["estimated_total_hours"] == topic_hours
    assert topic_hours == 44


def test_estimated_days_follow_configured_daily_study_minutes():
    roadmap_one_hour = generate_learning_roadmap(
        career="Full Stack Developer",
        missing_skills=FULL_STACK_SKILLS,
        daily_study_minutes=60,
    )
    roadmap_two_hours = generate_learning_roadmap(
        career="Full Stack Developer",
        missing_skills=FULL_STACK_SKILLS,
        daily_study_minutes=120,
    )

    assert roadmap_one_hour["estimated_days"] == 44
    assert roadmap_two_hours["estimated_days"] == 22
    assert roadmap_one_hour["daily_study_minutes"] == 60
    assert roadmap_two_hours["daily_study_minutes"] == 120


def test_skill_aliases_normalize_to_canonical_labels():
    roadmap = generate_learning_roadmap(
        career="Full Stack Developer",
        missing_skills=["nodejs", "REST API", "js"],
        skills_to_improve=["HTML"],
    )

    assert [topic["skill"] for topic in roadmap["topics"]] == [
        "HTML",
        "JavaScript",
        "Node.js",
        "REST APIs",
    ]
