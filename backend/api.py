from fastapi import FastAPI

app = FastAPI(
    title="AI Career Advisor API",
    description="Backend API for the AI Career Advisor project",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "AI Career Advisor API is running"
    }