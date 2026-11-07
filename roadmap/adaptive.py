def analyze_learning_progress(roadmap):
    """Analyze roadmap progress and suggest learning actions."""

    # Read the topics from the supplied roadmap.
    topics = roadmap.get("topics", [])
    if not isinstance(topics, list):
        topics = []

    # Store skills that need extra attention and suggested next steps.
    # Only include skills that appear on topics with Failed or In Progress.
    struggling_skills = []
    next_actions = []

    for topic in topics:
        if not isinstance(topic, dict):
            continue

        # Use default values if a topic does not contain these fields.
        skill = topic.get("skill", "Unknown skill")
        status = topic.get("status", "Pending")

        if not isinstance(skill, str) or not skill.strip():
            continue
        if not isinstance(status, str):
            continue

        skill = skill.strip()

        # A Failed topic is considered a struggling skill.
        if status == "Failed":
            if skill not in struggling_skills:
                struggling_skills.append(skill)

            # Recommend reviewing the basics and practicing again.
            next_actions.append({
                "skill": skill,
                "reason": "Topic marked as Failed",
                "recommendation": (
                    f"Review the basics of {skill}, use the learning "
                    "resource again, and complete extra practice exercises."
                ),
                "action": "Repeat topic with additional practice",
            })

        # An In Progress topic needs continued learning.
        elif status == "In Progress":
            next_actions.append({
                "skill": skill,
                "reason": "Topic is still in progress",
                "recommendation": (
                    f"Continue learning {skill} and complete a practice "
                    "exercise before marking it Completed."
                ),
                "action": "Continue learning",
            })

    # Count topics that have been marked Completed.
    completed_count = sum(
        isinstance(topic, dict) and topic.get("status") == "Completed"
        for topic in topics
    )

    # Calculate progress percentage safely when topics are available.
    progress = (
        round(completed_count / len(topics) * 100)
        if topics else 0
    )

    # Return the progress summary and adaptive recommendations.
    return {
        "overall_progress_percentage": progress,
        "completed_topics": completed_count,
        "total_topics": len(topics),
        "struggling_skills": struggling_skills,
        "next_actions": next_actions,
    }
