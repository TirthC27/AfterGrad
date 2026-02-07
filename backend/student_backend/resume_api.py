# =============================================
# AfterGrad — Resume Extractor API
# =============================================
#
# Upload PDF/DOCX → Extract name, skills, experience.
# Updates the user's profile in Supabase.
#
# Endpoints:
#   POST /api/resume/upload?user_id=xxx  — upload & parse resume
#   GET  /api/resume/skills              — get skills list
# =============================================

import os
import re
import tempfile
from datetime import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File
from db import get_supabase

resume_router = APIRouter(prefix="/api/resume", tags=["resume"])


# =============================================================================
# Skills dictionary for extraction
# =============================================================================

SKILLS = [
    "python", "java", "c", "c++", "c#", "kotlin", "rust", "go", "swift",
    "javascript", "typescript", "ruby", "php", "scala", "perl", "r",
    "html", "css", "sass", "tailwind",
    "django", "flask", "fastapi", "react", "angular", "vue",
    "node", "express", "next.js", "spring", "laravel", "rails",
    "mysql", "postgresql", "mongodb", "redis", "sqlite", "oracle",
    "docker", "kubernetes", "aws", "azure", "gcp",
    "git", "linux", "bash", "powershell",
    "rest", "graphql", "grpc",
    "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
    "figma", "photoshop", "illustrator",
    "jira", "confluence", "slack",
    "agile", "scrum", "ci/cd", "devops",
    "machine learning", "deep learning", "data analysis",
    "excel", "power bi", "tableau",
    "selenium", "jest", "pytest",
]

# Common name patterns (line 1–5 of resume, largest text)
NAME_PATTERNS = [
    r"^([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\s*$",  # "Tirth Chudasama"
]

# Experience section patterns
EXPERIENCE_KEYWORDS = [
    "experience", "work history", "employment", "professional experience",
    "work experience", "career history",
]

# Education / passout year patterns
YEAR_PATTERN = re.compile(r"(20\d{2})")
PASSOUT_KEYWORDS = ["graduation", "passout", "batch of", "class of", "graduated"]


def read_pdf(path: str) -> str:
    import pdfplumber
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def read_docx(path: str) -> str:
    from docx import Document
    doc = Document(path)
    return " ".join(p.text for p in doc.paragraphs)


def extract_skills(text: str) -> list[str]:
    
    lower = text.lower()
    found = []
    for skill in SKILLS:
        if skill in lower:
            found.append(skill)
    return sorted(set(found))


def extract_name(text: str) -> str | None:
    """Try to extract name from first few lines of resume."""
    lines = text.strip().split("\n")
    for line in lines[:5]:
        line = line.strip()
        if not line or len(line) < 3 or len(line) > 60:
            continue
        # Skip lines that look like addresses, emails, phone numbers
        if "@" in line or line.startswith("http") or any(c.isdigit() for c in line[:3]):
            continue
        # Check if it looks like a name (2-4 capitalized words)
        words = line.split()
        if 2 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
            return line
    return None


def extract_experience_summary(text: str) -> str:
    """Extract a brief experience summary from the resume text."""
    lower = text.lower()
    lines = text.split("\n")

    summary_parts = []
    in_experience = False

    for line in lines:
        line_lower = line.strip().lower()
        if any(kw in line_lower for kw in EXPERIENCE_KEYWORDS):
            in_experience = True
            continue
        if in_experience:
            if line.strip() and len(line.strip()) > 10:
                summary_parts.append(line.strip())
            if len(summary_parts) >= 5:
                break
            # If we hit another section header, stop
            if line.strip() and line.strip().isupper() and len(line.strip()) < 40:
                break

    return " | ".join(summary_parts[:5]) if summary_parts else ""


def extract_passout_year(text: str) -> int | None:
    """Try to extract graduation/passout year from resume."""
    lower = text.lower()
    for keyword in PASSOUT_KEYWORDS:
        idx = lower.find(keyword)
        if idx != -1:
            snippet = text[idx:idx + 50]
            match = YEAR_PATTERN.search(snippet)
            if match:
                year = int(match.group(1))
                if 2000 <= year <= 2030:
                    return year

    # Fallback: look for years near "education" section
    education_idx = lower.find("education")
    if education_idx != -1:
        snippet = text[education_idx:education_idx + 300]
        years = YEAR_PATTERN.findall(snippet)
        valid_years = [int(y) for y in years if 2000 <= int(y) <= 2030]
        if valid_years:
            return max(valid_years)

    return None


# =============================================================================
# POST /api/resume/upload
# =============================================================================

@resume_router.post("/upload")
async def upload_resume(user_id: str, file: UploadFile = File(...)):
    """
    Upload a resume (PDF or DOCX), extract skills + name + experience.
    Updates the user's profile in Supabase.
    """
    if not file.filename:
        raise HTTPException(400, "No file provided")

    ext = file.filename.lower().split(".")[-1]
    if ext not in ("pdf", "docx"):
        raise HTTPException(400, "Unsupported file type. Use PDF or DOCX.")

    # Save to temp file
    content = await file.read()
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Read text
        if ext == "pdf":
            text = read_pdf(tmp_path)
        else:
            text = read_docx(tmp_path)

        if not text or len(text.strip()) < 20:
            raise HTTPException(400, "Could not extract text from resume. File might be image-based.")

        # Extract data
        skills = extract_skills(text)
        name = extract_name(text)
        experience = extract_experience_summary(text)
        passout_year = extract_passout_year(text)

        # Update profile in Supabase
        sb = get_supabase()
        update_data = {
            "skills": skills,
            "experience_summary": experience,
            "resume_parsed_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        if name:
            update_data["name"] = name
        if passout_year:
            # For alumni → passout_year, for student → graduation_year
            user = sb.table("profiles").select("role").eq("id", user_id).execute()
            if user.data:
                role = user.data[0]["role"]
                if role == "alumni":
                    update_data["passout_year"] = passout_year
                else:
                    update_data["graduation_year"] = passout_year

        result = sb.table("profiles").update(update_data).eq("id", user_id).execute()

        return {
            "message": "Resume parsed successfully",
            "extracted": {
                "name": name,
                "skills": skills,
                "skills_count": len(skills),
                "experience_summary": experience,
                "passout_year": passout_year,
            },
            "profile_updated": bool(result.data),
        }

    finally:
        os.unlink(tmp_path)


# =============================================================================
# GET /api/resume/skills — available skills list
# =============================================================================

@resume_router.get("/skills")
async def get_skills_list():
    """Return the list of skills the extractor can detect."""
    return {"skills": SKILLS, "count": len(SKILLS)}
