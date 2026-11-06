
from dotenv import load_dotenv

load_dotenv()
import json
import shutil
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi import status
from pydantic import EmailStr
import bcrypt

from backend.database import get_connection, initialize_database
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from resume_parser.parser import extract_resume_text
from resume_parser.analyzer import analyze_resume_text, create_skill_profile
from resume_parser.ai_analyzer import analyze_resume_with_gemini

from backend.assessment import generate_assessment_questions
from backend.recommendation import recommend_careers, extract_interests
from roadmap.api import router as roadmap_router


# -----------------------------
# Request models
# -----------------------------

class SkillProfileRequest(BaseModel):
    technical_skills: list[str]
class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=100)
    email: str
    password: str = Field(min_length=8, max_length=72)
class LoginRequest(BaseModel):
    email: str
    password: str

class RecommendationRequest(BaseModel):
    user_id: Optional[int] = None
    technical_skills: list[str] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)
    resume_text: Optional[str] = None
    top_n: int = Field(default=5, ge=1, le=20)


# -----------------------------
# FastAPI application
# -----------------------------

app = FastAPI(
    title="AI Career Advisor API",
    description="Resume upload and skill profile API",
    version="1.0.0",
)
@app.on_event("startup")
def startup_event():
    initialize_database()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(roadmap_router)


# -----------------------------
# Upload directory
# -----------------------------

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


# -----------------------------
# Root endpoint
# -----------------------------

@app.get("/")
def root():
    return {
        "message": "AI Career Advisor API is running"
    }


# -----------------------------
# Resume upload and analysis
# -----------------------------

@app.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a PDF or DOCX resume and return its analyzed skill profile.
    Gemini is preferred; the existing Python analyzer is the fallback.
    """

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="A filename is required.",
        )

    allowed_extensions = {".pdf", ".docx"}
    file_extension = Path(file.filename).suffix.lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported.",
        )

    # Use a generated filename to avoid collisions between uploads.
    import uuid

    file_path = UPLOAD_DIR / f"{uuid.uuid4().hex}{file_extension}"

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract text from the uploaded resume.
        resume_text = extract_resume_text(file_path)

        if not resume_text or not resume_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No readable text was found in the uploaded resume.",
            )

        # Prefer Gemini, but fall back to the existing analyzer if needed.
        try:
            ai_result = analyze_resume_with_gemini(resume_text)

            analysis_result = {
                "name": ai_result.get("name", ""),
                "education": ai_result.get("education", []),
                "technical_skills": ai_result.get("technical_skills", []),
                "soft_skills": ai_result.get("soft_skills", []),
                "projects": ai_result.get("projects", []),
                "certifications": ai_result.get("certifications", []),
                "experience": ai_result.get("experience", []),
                "interests": ai_result.get("interests", []),
            }

            profile = create_skill_profile(analysis_result)

            print("Resume analyzed using Gemini.")

        except Exception as exc:
            print(
                "Gemini analysis failed; using Python analyzer instead:",
                str(exc),
            )

            analysis_result = analyze_resume_text(resume_text)
            profile = create_skill_profile(analysis_result)

            print("Resume analyzed using the Python fallback.")

        return profile

    except HTTPException:
        raise

    except Exception as error:
        print("Resume upload failed:", str(error))
        raise HTTPException(
            status_code=500,
            detail="Resume processing failed. Please check the backend terminal.",
        )

    finally:
        # Always remove the temporary uploaded file.
        if file_path.exists():
            file_path.unlink()

        await file.close()


# -----------------------------
# Assessment endpoint
# -----------------------------

@app.post("/assessment/generate")
def generate_assessment(request: SkillProfileRequest):
    """
    Generate assessment questions based on technical skills.
    """

    skill_profile = {
        "technical_skills": request.technical_skills
    }

    questions = generate_assessment_questions(skill_profile)

    return {
        "questions": questions
    }


# -----------------------------
# Career recommendation endpoint
# -----------------------------


@app.post("/recommendations")
def get_recommendations(request: RecommendationRequest):
    """
    Recommend careers based on technical skills and interests,
    and save the results for the logged-in user when user_id is provided.
    """
    interests = request.interests

    if not interests and request.resume_text:
        interests = extract_interests(request.resume_text)

    result = recommend_careers(
        user_skills=request.technical_skills,
        user_interests=interests,
        top_n=request.top_n,
    )

    if request.user_id:
        recommendations = result.get("recommendations", [])

        with get_connection() as connection:
            connection.execute(
                """
                INSERT INTO career_recommendations
                    (user_id, recommendations_json)
                VALUES (?, ?)
                """,
                (request.user_id, json.dumps(recommendations)),
            )

    return result

@app.get("/recommendations/{user_id}")
def get_saved_recommendations(user_id: int):
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT recommendations_json
            FROM career_recommendations
            WHERE user_id = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (user_id,),
        ).fetchone()

    if row is None:
        return {"recommendations": []}

    saved = json.loads(row["recommendations_json"])
    if isinstance(saved, dict):
        saved = saved.get("recommendations", [])
    if not isinstance(saved, list):
        saved = []

    return {
        "recommendations": saved
    }

@app.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(request: RegisterRequest):
    full_name = request.full_name.strip()
    email = request.email.strip().lower()
    password_bytes = request.password.encode("utf-8")

    if not full_name:
        raise HTTPException(
            status_code=400,
            detail="Full name is required.",
        )

    if "@" not in email or "." not in email.rsplit("@", 1)[-1]:
        raise HTTPException(
            status_code=400,
            detail="Enter a valid email address.",
        )

    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password must be no more than 72 UTF-8 bytes.",
        )

    password_hash = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt(),
    ).decode("utf-8")

    initialize_database()

    try:
        with get_connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO users (full_name, email, password_hash)
                VALUES (?, ?, ?)
                """,
                (full_name, email, password_hash),
            )
            user_id = cursor.lastrowid

    except Exception as exc:
        import sqlite3

        if isinstance(exc, sqlite3.IntegrityError):
            raise HTTPException(
                status_code=409,
                detail="An account with this email already exists.",
            ) from exc
        raise

    return {
        "message": "Registration successful.",
        "user": {
            "id": user_id,
            "full_name": full_name,
            "email": email,
        },
    }
@app.post("/auth/login")
def login_user(request: LoginRequest):
    email = request.email.strip().lower()
    password_bytes = request.password.encode("utf-8")

    with get_connection() as connection:
        user = connection.execute(
            """
            SELECT id, full_name, email, password_hash
            FROM users
            WHERE email = ?
            """,
            (email,),
        ).fetchone()

    if user is None or not bcrypt.checkpw(
        password_bytes,
        user["password_hash"].encode("utf-8"),
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    return {
        "message": "Login successful.",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
        },
    }