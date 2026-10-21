
import json
import sqlite3
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "career_advisor.db"

VALID_STATUSES = {"Pending", "In Progress", "Completed", "Failed"}


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
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
    initialize_database()

    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO learning_roadmaps
                (user_id, career, roadmap_json)
            VALUES (?, ?, ?)
            """,
            (user_id, roadmap["career"], json.dumps(roadmap)),
        )
        return cursor.lastrowid


def get_roadmap(roadmap_id):
    initialize_database()

    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT id, user_id, career, roadmap_json, created_at
            FROM learning_roadmaps
            WHERE id = ?
            """,
            (roadmap_id,),
        ).fetchone()

    if row is None:
        return None

    result = dict(row)
    result["roadmap"] = json.loads(result.pop("roadmap_json"))
    return result


def update_topic_status(roadmap_id, topic_id, status):
    if status not in VALID_STATUSES:
        raise ValueError(
            "Status must be Pending, In Progress, Completed, or Failed"
        )

    saved = get_roadmap(roadmap_id)
    if saved is None:
        return None

    roadmap = saved["roadmap"]
    topic = next(
        (item for item in roadmap["topics"]
         if item["topic_id"] == topic_id),
        None,
    )

    if topic is None:
        raise LookupError("Topic not found")

    topic["status"] = status

    total_topics = len(roadmap["topics"])
    completed_topics = sum(
        item["status"] == "Completed" for item in roadmap["topics"]
    )

    roadmap["overall_progress_percentage"] = (
        round(completed_topics / total_topics * 100)
        if total_topics else 0
    )

    with get_connection() as connection:
        connection.execute(
            "UPDATE learning_roadmaps SET roadmap_json = ? WHERE id = ?",
            (json.dumps(roadmap), roadmap_id),
        )

    return get_roadmap(roadmap_id)
