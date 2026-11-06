from datetime import date


# Learning resources for commonly required career skills.
# Each skill contains a resource title, learning URL, and estimated hours.
RESOURCE_CATALOG = {
    "html": {
        "title": "MDN: Structuring Content with HTML",
        "url": (
            "https://developer.mozilla.org/en-US/docs/"
            "Learn_web_development/Core/Structuring_content"
        ),
        "hours": 4,
    },
    "css": {
        "title": "MDN: CSS Styling Basics",
        "url": (
            "https://developer.mozilla.org/en-US/docs/"
            "Learn_web_development/Core/Styling_basics"
        ),
        "hours": 5,
    },
    "javascript": {
        "title": "MDN: Dynamic Scripting with JavaScript",
        "url": (
            "https://developer.mozilla.org/en-US/docs/"
            "Learn_web_development/Core/Scripting"
        ),
        "hours": 8,
    },
    "git": {
        "title": "Git Official Documentation",
        "url": "https://git-scm.com/doc",
        "hours": 3,
    },
    "react": {
        "title": "React Official Learn Guide",
        "url": "https://react.dev/learn",
        "hours": 8,
    },
    "node.js": {
        "title": "Node.js Introduction",
        "url": (
            "https://nodejs.org/en/learn/getting-started/"
            "introduction-to-nodejs"
        ),
        "hours": 6,
    },
    "rest apis": {
        "title": "MDN: Express Web Framework (Node.js/JavaScript)",
        "url": (
            "https://developer.mozilla.org/en-US/docs/"
            "Learn_web_development/Extensions/Server-side/"
            "Express_Nodejs/Introduction"
        ),
        "hours": 5,
    },
    "sql": {
        "title": "SQLBolt Interactive Lessons",
        "url": "https://sqlbolt.com/",
        "hours": 5,
    },
    "python": {
        "title": "Python Tutorial",
        "url": "https://docs.python.org/3/tutorial/",
        "hours": 6,
    },
    "excel": {
        "title": "Excel Training",
        "url": "https://support.microsoft.com/excel",
        "hours": 4,
    },
    "power bi": {
        "title": "Power BI Learning",
        "url": "https://learn.microsoft.com/en-us/training/powerplatform/power-bi/",
        "hours": 6,
    },
    "tableau": {
        "title": "Tableau Training",
        "url": "https://www.tableau.com/learn/training",
        "hours": 5,
    },
    "statistics": {
        "title": "Statistics Learning",
        "url": "https://www.khanacademy.org/math/statistics-probability",
        "hours": 5,
    },
    "data visualization": {
        "title": "Data Visualization Learning",
        "url": "https://www.kaggle.com/learn/data-visualization",
        "hours": 4,
    },
}

# Canonical aliases so related skill spellings map to one catalog key.
SKILL_ALIASES = {
    "js": "javascript",
    "node": "node.js",
    "nodejs": "node.js",
    "node js": "node.js",
    "rest api": "rest apis",
    "restapis": "rest apis",
    "restful apis": "rest apis",
    "restful api": "rest apis",
}

# Prefer readable labels over naive str.title() casing.
SKILL_LABELS = {
    "html": "HTML",
    "css": "CSS",
    "javascript": "JavaScript",
    "git": "Git",
    "react": "React",
    "node.js": "Node.js",
    "rest apis": "REST APIs",
    "sql": "SQL",
    "python": "Python",
    "excel": "Excel",
    "power bi": "Power BI",
    "tableau": "Tableau",
    "statistics": "Statistics",
    "data visualization": "Data Visualization",
    "machine learning": "Machine Learning",
}

# Career-specific pedagogical order for known learning paths.
CAREER_SKILL_ORDER = {
    "full stack developer": [
        "html",
        "css",
        "javascript",
        "git",
        "react",
        "node.js",
        "rest apis",
        "sql",
    ],
}


def normalize_career_key(career):
    """Normalize career names for CAREER_SKILL_ORDER lookups."""
    if not isinstance(career, str):
        return ""
    cleaned = career.strip().lower().replace("-", " ").replace("_", " ")
    return " ".join(cleaned.split())


def normalize_skill_key(skill):
    """Normalize a skill name for catalog lookup and ordering."""
    if not isinstance(skill, str):
        return ""
    normalized = " ".join(skill.strip().lower().split())
    return SKILL_ALIASES.get(normalized, normalized)


def skill_label(skill_key):
    """Return a display label for a normalized skill key."""
    if skill_key in SKILL_LABELS:
        return SKILL_LABELS[skill_key]
    if not skill_key:
        return ""
    return skill_key.title()


def collect_unique_skills(skills_to_improve, missing_skills):
    """Preserve first-seen skills while normalizing aliases and casing."""
    ordered_skills = []
    for skill in (skills_to_improve or []) + (missing_skills or []):
        if isinstance(skill, str) and skill.strip():
            normalized = normalize_skill_key(skill)
            if normalized and normalized not in ordered_skills:
                ordered_skills.append(normalized)
    return ordered_skills


def order_skills_for_career(career, skills):
    """Sort skills by a career learning path when one is defined."""
    order = CAREER_SKILL_ORDER.get(normalize_career_key(career))
    if not order:
        return list(skills)

    rank = {skill: index for index, skill in enumerate(order)}
    return sorted(
        skills,
        key=lambda skill: (rank.get(skill, len(order)), skill),
    )


def apply_career_topic_order(career, topics):
    """
    Reorder topic dicts by the career learning path.

    Preserves each topic's resource URL, estimated hours, title, and status.
    Reassigns sequential topic_id values and rebuilds prerequisites so they
    always refer to earlier topics in the final learning order.
    """
    if not isinstance(topics, list) or not topics:
        return []

    order = CAREER_SKILL_ORDER.get(normalize_career_key(career))
    if not order:
        return list(topics)

    rank = {skill: index for index, skill in enumerate(order)}

    def topic_sort_key(topic):
        skill_key = normalize_skill_key(topic.get("skill", ""))
        return (rank.get(skill_key, len(order)), skill_key)

    sorted_topics = sorted(
        [topic for topic in topics if isinstance(topic, dict)],
        key=topic_sort_key,
    )

    rebuilt = []
    for index, topic in enumerate(sorted_topics, start=1):
        skill_key = normalize_skill_key(topic.get("skill", ""))
        label = skill_label(skill_key) or topic.get("skill", "")
        status = topic.get("status", "Pending")
        rebuilt.append({
            **topic,
            "topic_id": index,
            "skill": label,
            "status": status,
            "prerequisites": [rebuilt[-1]["skill"]] if rebuilt else [],
        })
    return rebuilt


def generate_learning_roadmap(
    career,
    missing_skills,
    skills_to_improve=None,
    daily_study_minutes=60,
):
    """Generate an ordered learning roadmap based on a user's career skill gaps."""

    # Validate the career name before generating the roadmap.
    if not isinstance(career, str) or not career.strip():
        raise ValueError("career must be a non-empty string")

    # The missing skills input must be a list.
    if not isinstance(missing_skills, list):
        raise ValueError("missing_skills must be a list")

    # Daily study time must be a positive integer.
    if not isinstance(daily_study_minutes, int) or daily_study_minutes <= 0:
        raise ValueError("daily_study_minutes must be a positive integer")

    # Use an empty list when no improvement skills are provided.
    skills_to_improve = skills_to_improve or []

    if not isinstance(skills_to_improve, list):
        raise ValueError("skills_to_improve must be a list")

    ordered_skills = order_skills_for_career(
        career,
        collect_unique_skills(skills_to_improve, missing_skills),
    )

    # Build the roadmap topics and calculate the total learning time.
    topics = []

    for index, skill in enumerate(ordered_skills, start=1):
        label = skill_label(skill)

        # Use a known learning resource when available.
        # Otherwise, provide a Google search link for the skill.
        resource = RESOURCE_CATALOG.get(
            skill,
            {
                "title": f"Search learning resources for {label}",
                "url": (
                    "https://www.google.com/search?q="
                    + skill.replace(" ", "+")
                    + "+tutorial"
                ),
                "hours": 4,
            },
        )

        # Add the topic with its resource, prerequisite, and initial status.
        topics.append({
            "topic_id": index,
            "skill": label,
            "title": resource["title"],
            "resource_url": resource["url"],
            "estimated_hours": resource["hours"],
            "prerequisites": (
                [topics[-1]["skill"]] if topics else []
            ),
            "status": "Pending",
        })

    # Apply career ordering again so rule-based and AI paths share one path.
    topics = apply_career_topic_order(career, topics)
    total_hours = sum(topic["estimated_hours"] for topic in topics)

    # Convert total learning hours into minutes.
    total_minutes = total_hours * 60

    # Calculate the estimated number of study days using the configured
    # daily_study_minutes value (default 60 minutes / 1 hour per day).
    # Round up when the total time is not evenly divisible.
    estimated_days = (
        total_minutes + daily_study_minutes - 1
    ) // daily_study_minutes

    # Return the complete roadmap response.
    return {
        "career": career.strip(),
        "created_date": date.today().isoformat(),
        "daily_study_minutes": daily_study_minutes,
        "total_topics": len(topics),
        "estimated_total_hours": total_hours,
        "estimated_days": estimated_days,
        "overall_progress_percentage": 0,
        "topics": topics,
    }
