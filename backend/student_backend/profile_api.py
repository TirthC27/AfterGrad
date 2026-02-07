# =============================================
# AfterGrad — Profile API
# =============================================
#
# Endpoints:
#   GET  /api/profile/{user_id}           — get profile
#   PATCH /api/profile/{user_id}          — update profile
#   GET  /api/profile/search              — search profiles
# =============================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from db import get_supabase

profile_router = APIRouter(prefix="/api/profile", tags=["profile"])


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[list[str]] = None
    interests: Optional[list[str]] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    college: Optional[str] = None


# =============================================================================
# GET /api/profile/{user_id}
# =============================================================================

@profile_router.get("/{user_id}")
async def get_profile(user_id: str):
    sb = get_supabase()
    result = sb.table("profiles").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(404, "Profile not found")
    return result.data[0]


# =============================================================================
# PATCH /api/profile/{user_id}
# =============================================================================

@profile_router.patch("/{user_id}")
async def update_profile(user_id: str, body: ProfileUpdate):
    sb = get_supabase()

    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(400, "Nothing to update")

    update["updated_at"] = datetime.now().isoformat()

    result = sb.table("profiles").update(update).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(404, "Profile not found")
    return result.data[0]


# =============================================================================
# GET /api/profile/search?role=student&q=react
# =============================================================================

@profile_router.get("/search/all")
async def search_profiles(role: Optional[str] = None, q: Optional[str] = None):
    sb = get_supabase()
    query = sb.table("profiles").select("id, name, role, avatar_url, company, job_title, college, skills, bio, location")

    if role:
        query = query.eq("role", role)

    result = query.execute()

    if q and result.data:
        q_lower = q.lower()
        result.data = [
            p for p in result.data
            if q_lower in (p.get("name") or "").lower()
            or q_lower in (p.get("bio") or "").lower()
            or any(q_lower in s.lower() for s in (p.get("skills") or []))
        ]

    return result.data or []
