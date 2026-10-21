
from datetime import date


RESOURCE_CATALOG = {
    "python": {
        "title": "Python Tutorial",
        "url": "https://docs.python.org/3/tutorial/",
        "hours": 6,
    },
    "sql": {
        "title": "SQL Tutorial",
        "url": "https://www.w3schools.com/sql/",
        "hours": 5,
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


def generate_learning_roadmap(
    career,
    missing_skills,
    skills_to_improve=None,
    daily_study_minutes=60,
):
    """Create an ordered learning roadmap from career skill gaps."""

    if not isinstance(career, str) or not career.strip():
        raise ValueError("career must be a non-empty string")

    if not isinstance(missing_skills, list):
        raise ValueError("missing_skills must be a list")

    if not isinstance(daily_study_minutes, int) or daily_study_minutes <= 0:
        raise ValueError("daily_study_minutes must be a positive integer")

    skills_to_improve = skills_to_improve or []

    if not isinstance(skills_to_improve, list):
        raise ValueError("skills_to_improve must be a list")

    # Prioritize skills that need improvement, then other missing skills.
    ordered_skills = []
    for skill in skills_to_improve + missing_skills:
        if isinstance(skill, str) and skill.strip():
            normalized = skill.strip().lower()
            if normalized not in ordered_skills:
                ordered_skills.append(normalized)

    topics = []
    total_hours = 0

    for index, skill in enumerate(ordered_skills, start=1):
        resource = RESOURCE_CATALOG.get(
            skill,
            {
                "title": f"Search learning resources for {skill.title()}",
                "url": (
                    "https://www.google.com/search?q="
                    + skill.replace(" ", "+")
                    + "+tutorial"
                ),
                "hours": 4,
            },
        )

        hours = resource["hours"]
        total_hours += hours

        topics.append({
            "topic_id": index,
            "skill": skill.title(),
            "title": resource["title"],
            "resource_url": resource["url"],
            "estimated_hours": hours,
            "prerequisites": (
                [topics[-1]["skill"]] if topics else []
            ),
            "status": "Pending",
        })

    total_minutes = total_hours * 60
    estimated_days = (
        total_minutes + daily_study_minutes - 1
    ) // daily_study_minutes

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
