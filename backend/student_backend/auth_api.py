# =============================================
# AfterGrad — Auth API (Clerk + Mock SheerID)
# =============================================
#
# Endpoints:
#   POST /api/auth/register        — register from Clerk webhook / direct
#   POST /api/auth/verify-student  — mock SheerID student verification
#   POST /api/auth/login-demo      — demo login (for alumni / quick testing)
#   GET  /api/auth/me              — get current user profile
# =============================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from db import get_supabase

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])


# =============================================================================
# Models
# =============================================================================

class RegisterRequest(BaseModel):
    """Called after Clerk signup or directly for demo."""
    clerk_user_id: Optional[str] = None
    role: str  # 'student' or 'alumni'
    email: str
    name: str
    avatar_url: Optional[str] = None


class VerifyStudentRequest(BaseModel):
    """Mock SheerID verification for students."""
    user_id: str
    college: str
    graduation_year: int
    student_email: str  # .edu email


class DemoLoginRequest(BaseModel):
    """Quick demo login — returns user profile directly."""
    user_id: str  # e.g. 'student_001', 'alumni_001'


class PasswordLoginRequest(BaseModel):
    """Password-based login."""
    email: str
    password: str


class OnboardingRequest(BaseModel):
    """Onboarding questions after signup."""
    user_id: str
    bio: Optional[str] = ""
    interests: list[str] = []
    linkedin_url: Optional[str] = ""
    github_url: Optional[str] = ""
    location: Optional[str] = ""
    # Alumni-specific
    company: Optional[str] = None
    job_title: Optional[str] = None
    passout_year: Optional[int] = None
    # Student-specific
    college: Optional[str] = None
    graduation_year: Optional[int] = None


# =============================================================================
# POST /api/auth/register
# =============================================================================

@auth_router.post("/register")
async def register(req: RegisterRequest):
    """
    Register a new user from Clerk signup.
    Creates a profile row with minimal info. Onboarding comes next.
    """
    sb = get_supabase()

    user_id = req.clerk_user_id or f"user_{datetime.now().strftime('%Y%m%d%H%M%S')}"

    # Check if already exists
    existing = sb.table("profiles").select("id").eq("id", user_id).execute()
    if existing.data:
        return {"message": "User already registered", "user_id": user_id, "profile": existing.data[0]}

    profile = {
        "id": user_id,
        "role": req.role,
        "email": req.email,
        "name": req.name,
        "avatar_url": req.avatar_url,
        "onboarding_completed": False,
    }

    result = sb.table("profiles").insert(profile).execute()
    return {"message": "Registration successful", "user_id": user_id, "profile": result.data[0] if result.data else profile}


# =============================================================================
# POST /api/auth/verify-student — Mock SheerID
# =============================================================================

@auth_router.post("/verify-student")
async def verify_student(req: VerifyStudentRequest):
    """
    Mock SheerID verification for students.
    In production this would call SheerID API.
    For hackathon: any .edu email auto-verifies.
    """
    sb = get_supabase()

    # Check user exists
    user = sb.table("profiles").select("*").eq("id", req.user_id).execute()
    if not user.data:
        raise HTTPException(404, "User not found")

    profile = user.data[0]
    if profile["role"] != "student":
        raise HTTPException(400, "Only students can be verified via SheerID")

    # =========================================
    # MOCK SHEERID VERIFICATION LOGIC
    # In production: call SheerID API
    # For hackathon: .edu email = verified
    # =========================================
    is_verified = (
        req.student_email.endswith(".edu") or
        req.student_email.endswith(".ac.in") or
        req.student_email.endswith("@college.edu") or
        True  # Auto-verify for hackathon demo
    )

    if not is_verified:
        return {
            "verified": False,
            "message": "Verification failed. Please use your college email.",
        }

    # Update profile
    sb.table("profiles").update({
        "student_verified": True,
        "sheerid_verified_at": datetime.now().isoformat(),
        "college": req.college,
        "graduation_year": req.graduation_year,
    }).eq("id", req.user_id).execute()

    return {
        "verified": True,
        "message": "Student verification successful! (Mock SheerID)",
        "user_id": req.user_id,
        "college": req.college,
        "graduation_year": req.graduation_year,
    }


# =============================================================================
# POST /api/auth/login — Password-based login
# =============================================================================

@auth_router.post("/login")
async def login(req: PasswordLoginRequest):
    """
    Login with email and password.
    Returns profile if credentials match.
    """
    sb = get_supabase()

    user = sb.table("profiles").select("*").eq("email", req.email).execute()
    if not user.data:
        raise HTTPException(401, "Invalid email or password")

    profile = user.data[0]
    
    # Check password (in production this would be hashed comparison)
    if profile.get("password") != req.password:
        raise HTTPException(401, "Invalid email or password")

    return {
        "message": "Login successful",
        "profile": profile,
        "needs_onboarding": not profile.get("onboarding_completed", False),
        "needs_verification": profile["role"] == "student" and not profile.get("student_verified", False),
    }


# =============================================================================
# POST /api/auth/login-demo — Demo login
# =============================================================================

@auth_router.post("/login-demo")
async def demo_login(req: DemoLoginRequest):
    """
    Demo login: fetches profile by ID.
    For alumni: just login (no verification needed).
    For students: returns verification status too.
    """
    sb = get_supabase()

    user = sb.table("profiles").select("*").eq("id", req.user_id).execute()
    if not user.data:
        raise HTTPException(404, f"User '{req.user_id}' not found. Try 'student_001' or 'alumni_001'.")

    profile = user.data[0]
    return {
        "message": "Demo login successful",
        "profile": profile,
        "needs_onboarding": not profile.get("onboarding_completed", False),
        "needs_verification": profile["role"] == "student" and not profile.get("student_verified", False),
    }


# =============================================================================
# GET /api/auth/me — get user by ID
# =============================================================================

@auth_router.get("/me")
async def get_me(user_id: str):
    """Get current user profile."""
    sb = get_supabase()
    user = sb.table("profiles").select("*").eq("id", user_id).execute()
    if not user.data:
        raise HTTPException(404, "User not found")
    return user.data[0]


# =============================================================================
# POST /api/auth/onboarding
# =============================================================================

@auth_router.post("/onboarding")
async def complete_onboarding(req: OnboardingRequest):
    """Complete onboarding after signup. Works for both student & alumni."""
    sb = get_supabase()

    user = sb.table("profiles").select("*").eq("id", req.user_id).execute()
    if not user.data:
        raise HTTPException(404, "User not found")

    update_data = {
        "bio": req.bio,
        "interests": req.interests,
        "linkedin_url": req.linkedin_url,
        "github_url": req.github_url,
        "location": req.location,
        "onboarding_completed": True,
        "updated_at": datetime.now().isoformat(),
    }

    role = user.data[0]["role"]

    if role == "alumni":
        if req.company:
            update_data["company"] = req.company
        if req.job_title:
            update_data["job_title"] = req.job_title
        if req.passout_year:
            update_data["passout_year"] = req.passout_year

    if role == "student":
        if req.college:
            update_data["college"] = req.college
        if req.graduation_year:
            update_data["graduation_year"] = req.graduation_year

    result = sb.table("profiles").update(update_data).eq("id", req.user_id).execute()
    return {"message": "Onboarding completed", "profile": result.data[0] if result.data else update_data}
