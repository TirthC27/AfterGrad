# =============================================
# AfterGrad — Gigs / Internships API (Supabase)
# =============================================
#
# Endpoints:
#   GET  /api/gigs                  — list gigs
#   GET  /api/gigs/{id}             — single gig
#   POST /api/gigs                  — create gig (alumni)
#   POST /api/gigs/{id}/apply       — student applies
#   GET  /api/gigs/applications/me  — my applications
# =============================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from db import get_supabase

gigs_router = APIRouter(prefix="/api/gigs", tags=["gigs"])


class GigCreate(BaseModel):
    title: str
    company: str
    description: str
    gig_type: str  # 'internship' or 'micro_gig'
    stipend: Optional[str] = None
    duration: Optional[str] = None
    skills_required: list[str] = []
    posted_by: str


class ApplyRequest(BaseModel):
    student_id: str


def _enrich_gig(g: dict) -> dict:
    sb = get_supabase()
    if g.get("posted_by"):
        poster = sb.table("profiles").select("name, company, job_title").eq("id", g["posted_by"]).execute()
        if poster.data:
            g["posted_by_name"] = poster.data[0].get("name")
    return g


@gigs_router.get("")
async def list_gigs():
    sb = get_supabase()
    result = sb.table("gigs").select("*").order("created_at", desc=True).execute()
    return [_enrich_gig(g) for g in (result.data or [])]


@gigs_router.get("/applications/me")
async def my_applications(student_id: str):
    sb = get_supabase()
    result = sb.table("gig_applications").select("*").eq("student_id", student_id).execute()
    enriched = []
    for app in (result.data or []):
        gig = sb.table("gigs").select("title, company, gig_type").eq("id", app["gig_id"]).execute()
        enriched.append({
            **app,
            "gig": gig.data[0] if gig.data else {},
        })
    return enriched


@gigs_router.get("/{gig_id}")
async def get_gig(gig_id: str):
    sb = get_supabase()
    result = sb.table("gigs").select("*").eq("id", gig_id).execute()
    if not result.data:
        raise HTTPException(404, "Gig not found")
    return _enrich_gig(result.data[0])


@gigs_router.post("")
async def create_gig(body: GigCreate):
    sb = get_supabase()
    gig = {
        "title": body.title,
        "company": body.company,
        "description": body.description,
        "gig_type": body.gig_type,
        "stipend": body.stipend,
        "duration": body.duration,
        "skills_required": body.skills_required,
        "posted_by": body.posted_by,
    }
    result = sb.table("gigs").insert(gig).execute()
    if not result.data:
        raise HTTPException(500, "Failed to create gig")
    return result.data[0]


@gigs_router.post("/{gig_id}/apply")
async def apply_to_gig(gig_id: str, body: ApplyRequest):
    sb = get_supabase()

    # Check gig exists
    gig = sb.table("gigs").select("id").eq("id", gig_id).execute()
    if not gig.data:
        raise HTTPException(404, "Gig not found")

    # Check duplicate
    existing = (sb.table("gig_applications")
                .select("id")
                .eq("gig_id", gig_id)
                .eq("student_id", body.student_id)
                .execute())
    if existing.data:
        raise HTTPException(409, "Already applied")

    result = sb.table("gig_applications").insert({
        "gig_id": gig_id,
        "student_id": body.student_id,
        "status": "applied",
    }).execute()

    return {"message": "Application submitted!", "application": result.data[0] if result.data else None}
