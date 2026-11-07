import json
import sqlite3
from pathlib import Path


# Locate the project root and store the database in that folder.
BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "career_advisor.db"

# Only these four topic statuses are accepted.
VALID_STATUSES = {"Pending", "In Progress", "Completed", "Failed"}


def get_connection():
    """Create a database connection with dictionary-like row access."""
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    """Create the roadmap table if it does not already exist."""
    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS learning_roadmaps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                career TEXT NOT NULL,
                roadmap_json TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)


def save_roadmap(roadmap, user_id=None):
    """Save a generated roadmap and return its database ID."""
    initialize_database()

    with get_connection() as connection:
        # Use SQL parameters to safely insert the roadmap data.
        cursor = connection.execute(
            """
            INSERT INTO learning_roadmaps
                (user_id, career, roadmap_json)
            VALUES (?, ?, ?)
            """,
            (user_id, roadmap["career"], json.dumps(roadmap)),
        )

        # Return the ID assigned to the newly saved roadmap.
        return cursor.lastrowid


def get_roadmap(roadmap_id, user_id):
    """Retrieve a saved roadmap belonging to a specific user."""
    initialize_database()

    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT id, user_id, career, roadmap_json, created_at
            FROM learning_roadmaps
            WHERE id = ? AND user_id = ?
            """,
            (roadmap_id, user_id),
        ).fetchone()

    if row is None:
        return None

    result = dict(row)
    result["roadmap"] = json.loads(result.pop("roadmap_json"))
    return result

def update_topic_status(roadmap_id, topic_id, status, user_id):
    """Update a topic status and recalculate roadmap progress."""

    # Reject any status outside the supported four values.
    if status not in VALID_STATUSES:
        raise ValueError(
            "Status must be Pending, In Progress, Completed, or Failed"
        )

    # Retrieve only the roadmap identified by the supplied ID.
    saved = get_roadmap(roadmap_id, user_id)
    if saved is None:
        return None

    roadmap = saved["roadmap"]

    # Find the requested topic inside this roadmap.
    topic = next(
        (item for item in roadmap["topics"]
         if item["topic_id"] == topic_id),
        None,
    )

    # Raise an error when the topic ID is not present.
    if topic is None:
        raise LookupError("Topic not found")

    # Apply the new status to the selected topic.
    topic["status"] = status

    # Calculate progress using only topics marked Completed.
    total_topics = len(roadmap["topics"])
    completed_topics = sum(
        item["status"] == "Completed" for item in roadmap["topics"]
    )

    # Avoid division by zero when the roadmap has no topics.
    roadmap["overall_progress_percentage"] = (
        round(completed_topics / total_topics * 100)
        if total_topics else 0
    )

    # Save the updated roadmap JSON for this roadmap ID only.
    with get_connection() as connection:
        connection.execute(
            "UPDATE learning_roadmaps SET roadmap_json = ? WHERE id = ?",
            (json.dumps(roadmap), roadmap_id),
        )

    # Return the latest saved roadmap after the update.
    return get_roadmap(roadmap_id, user_id)