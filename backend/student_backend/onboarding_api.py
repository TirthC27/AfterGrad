# =============================================
# AfterGrad — Onboarding MCQ API
# =============================================
#
# Provides MCQ questions for the onboarding flow
# and stores answers in the database.
#
# Endpoints:
#   GET  /api/onboarding/questions         — get MCQ questions
#   POST /api/onboarding/answers           — submit answers
#   GET  /api/onboarding/answers/{user_id} — get user's answers
# =============================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

from db import get_supabase

onboarding_router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])


# =============================================================================
# MCQ Questions
# =============================================================================

ALUMNI_QUESTIONS = [
    {
        "id": "alum_q1",
        "question": "What's your primary motivation for joining AfterGrad?",
        "options": [
            "Give back to my alma mater through mentoring",
            "Recruit talented students for my company",
            "Build networking connections",
            "Share my expertise through events & talks",
        ],
    },
    {
        "id": "alum_q2",
        "question": "How much time can you dedicate to mentoring per month?",
        "options": [
            "1-2 hours",
            "3-5 hours",
            "5-10 hours",
            "More than 10 hours",
        ],
    },
    {
        "id": "alum_q3",
        "question": "What type of guidance are you best at providing?",
        "options": [
            "Career advice & interview preparation",
            "Technical mentorship & code reviews",
            "Startup guidance & entrepreneurship",
            "Industry insights & networking",
        ],
    },
]

STUDENT_QUESTIONS = [
    {
        "id": "stud_q1",
        "question": "What are you looking for on AfterGrad?",
        "options": [
            "Mentorship from industry professionals",
            "Internship & job opportunities",
            "Networking with alumni",
            "Event participation & learning",
        ],
    },
    {
        "id": "stud_q2",
        "question": "Where are you in your academic journey?",
        "options": [
            "First year — exploring options",
            "Second year — building skills",
            "Pre-final year — seeking internships",
            "Final year — preparing for placements",
        ],
    },
    {
        "id": "stud_q3",
        "question": "Which area interests you the most?",
        "options": [
            "Software Development",
            "Data Science & AI/ML",
            "Product Management",
            "Entrepreneurship & Startups",
        ],
    },
]


# =============================================================================
# Models
# =============================================================================

class AnswerSubmit(BaseModel):
    user_id: str
    answers: list[dict]  # [{"question_id": "alum_q1", "question_text": "...", "selected_option": "..."}]


# =============================================================================
# GET /api/onboarding/questions
# =============================================================================

@onboarding_router.get("/questions")
async def get_questions(role: str = "alumni"):
    if role == "alumni":
        return {"questions": ALUMNI_QUESTIONS}
    elif role == "student":
        return {"questions": STUDENT_QUESTIONS}
    else:
        raise HTTPException(400, "Role must be 'alumni' or 'student'")


# =============================================================================
# POST /api/onboarding/answers
# =============================================================================

@onboarding_router.post("/answers")
async def submit_answers(body: AnswerSubmit):
    sb = get_supabase()

    # Verify user exists
    user = sb.table("profiles").select("id").eq("id", body.user_id).execute()
    if not user.data:
        raise HTTPException(404, "User not found")

    # Delete any existing answers for this user (re-submit)
    sb.table("onboarding_answers").delete().eq("user_id", body.user_id).execute()

    # Insert new answers
    rows = []
    for ans in body.answers:
        rows.append({
            "user_id": body.user_id,
            "question_id": ans.get("question_id", ""),
            "question_text": ans.get("question_text", ""),
            "selected_option": ans.get("selected_option", ""),
        })

    if rows:
        sb.table("onboarding_answers").insert(rows).execute()

    return {"message": "Answers saved successfully", "count": len(rows)}


# =============================================================================
# GET /api/onboarding/answers/{user_id}
# =============================================================================

@onboarding_router.get("/answers/{user_id}")
async def get_answers(user_id: str):
    sb = get_supabase()
    result = (sb.table("onboarding_answers")
              .select("*")
              .eq("user_id", user_id)
              .order("created_at")
              .execute())
    return result.data or []
