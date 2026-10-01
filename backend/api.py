from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import shutil

from resume_parser.parser import extract_resume_text
from resume_parser.analyzer import analyze_resume_text, create_skill_profile
from backend.assessment import generate_assessment_questions


class SkillProfileRequest(BaseModel):
    technical_skills: list[str]


app = FastAPI(
    title="AI Career Advisor API",
    description="Resume upload and skill profile API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/")
def root():
    return {
        "message": "AI Career Advisor API is running"
    }


@app.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    """
    Upload a PDF or DOCX resume and return the analyzed skill profile.
    """

    allowed_extensions = {".pdf", ".docx"}

    file_extension = Path(file.filename).suffix.lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )

    file_path = UPLOAD_DIR / file.filename

    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        resume_text = extract_resume_text(file_path)

        analysis_result = analyze_resume_text(resume_text)

        skill_profile = create_skill_profile(analysis_result)

        return skill_profile

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    finally:
        if file_path.exists():
            file_path.unlink()


            
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
