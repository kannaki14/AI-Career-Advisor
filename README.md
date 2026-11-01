# career-recommendation-system
AI-powered personalized career recommendation and skill-gap analysis system

# Career Recommendation System

AI-powered personalized career recommendation and skill-gap analysis system.

## Learning Roadmap Module

The Learning Roadmap module generates a personalized learning plan based on a user's target career and missing skills.

### Features

- Generate a career-based learning roadmap.
- Include learning resources and estimated study hours.
- Track topic statuses: Pending, In Progress, Completed, and Failed.
- Calculate overall learning progress.
- Identify struggling skills and provide adaptive recommendations.
- Store roadmap and topic progress in SQLite.

### Roadmap API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/roadmap/generate` | Generate a learning roadmap |
| GET | `/roadmap/{roadmap_id}` | Retrieve a saved roadmap |
| PATCH | `/roadmap/{roadmap_id}/topics/{topic_id}` | Update a topic status |
| GET | `/roadmap/{roadmap_id}/progress` | Retrieve progress and next actions |

### Generate Roadmap

**Endpoint:** `POST /roadmap/generate`

Example request:

```json
{
  "career": "Data Analyst",
  "missing_skills": ["Python", "SQL", "Excel"],
  "user_id": 1
}
```

### Update Topic Status

**Endpoint:** `PATCH /roadmap/{roadmap_id}/topics/{topic_id}`

Example request:

```json
{
  "status": "Completed"
}
```

Supported statuses:

- `Pending`
- `In Progress`
- `Completed`
- `Failed`

### Progress Tracking

The progress endpoint provides:

- Overall progress percentage
- Number of completed topics
- Total topics
- Struggling skills
- Adaptive next actions

### Testing

Run the roadmap API tests from the project root:

```powershell
python -m pytest backend/tests/test_roadmap_api.py -v
```

The roadmap API test suite currently contains four automated tests.

