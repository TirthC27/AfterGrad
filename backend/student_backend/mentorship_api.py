# =============================================
# AfterGrad — Mentorship API (Supabase-connected)
# =============================================
#
# Endpoints:
#   GET  /api/mentorship/offerings             — browse offerings
#   POST /api/mentorship/offerings             — create offering (alumni)
#   PATCH /api/mentorship/offerings/{id}       — toggle active
#   GET  /api/mentorship/offerings/mine        — alumni's offerings
#   POST /api/mentorship/request               — student requests
#   GET  /api/mentorship/requests/student      — student's requests
#   GET  /api/mentorship/requests/alumni       — alumni's requests
#   POST /api/mentorship/requests/{id}/accept  — alumni accepts
#   POST /api/mentorship/requests/{id}/reject  — alumni rejects
#   POST /api/mentorship/requests/{id}/cancel  — student cancels
#   GET  /api/mentorship/sessions/student      — student's sessions
#   GET  /api/mentorship/sessions/alumni       — alumni's sessions
#   POST /api/mentorship/sessions/{id}/complete-alumni
#   POST /api/mentorship/sessions/{id}/complete-student
# =============================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta

from db import get_supabase

mentorship_router = APIRouter(prefix="/api/mentorship", tags=["mentorship"])


# =============================================================================
# Models
# =============================================================================

class CreateOfferingRequest(BaseModel):
    alumni_id: str
    topic: str
    description: str
    duration: int
    price: float = 0
    tags: list[str] = []


class MentorshipRequestCreate(BaseModel):
    student_id: str
    offering_id: str
    note: Optional[str] = ""


class AcceptRejectBody(BaseModel):
    user_id: str


class CancelBody(BaseModel):
    student_id: str


class CompleteBody(BaseModel):
    user_id: str


# =============================================================================
# Helpers
# =============================================================================

def _enrich_offering(o: dict) -> dict:
    sb = get_supabase()
    alumni = sb.table("profiles").select("*").eq("id", o["alumni_id"]).execute()
    a = alumni.data[0] if alumni.data else {}
    return {
        **o,
        "alumni": {
            "id": a.get("id"),
            "name": a.get("name"),
            "company": a.get("company"),
            "job_title": a.get("job_title"),
            "avatar": (a.get("name") or "??")[:2].upper(),
            "verified": True,
        }
    }


def _enrich_request(r: dict) -> dict:
    sb = get_supabase()
    alumni = sb.table("profiles").select("*").eq("id", r["alumni_id"]).execute()
    student = sb.table("profiles").select("*").eq("id", r["student_id"]).execute()
    a = alumni.data[0] if alumni.data else {}
    s = student.data[0] if student.data else {}
    return {
        **r,
        "alumni": {
            "id": a.get("id"),
            "name": a.get("name"),
            "company": a.get("company"),
            "job_title": a.get("job_title"),
            "avatar": (a.get("name") or "??")[:2].upper(),
            "verified": True,
        },
        "student": {
            "id": s.get("id"),
            "name": s.get("name"),
            "avatar": (s.get("name") or "??")[:2].upper(),
        },
    }


def _enrich_session(s: dict) -> dict:
    sb = get_supabase()
    alumni = sb.table("profiles").select("*").eq("id", s["alumni_id"]).execute()
    student = sb.table("profiles").select("*").eq("id", s["student_id"]).execute()
    a = alumni.data[0] if alumni.data else {}
    st = student.data[0] if student.data else {}
    return {
        **s,
        "alumni": {
            "id": a.get("id"),
            "name": a.get("name"),
            "company": a.get("company"),
            "job_title": a.get("job_title"),
            "avatar": (a.get("name") or "??")[:2].upper(),
            "verified": True,
        },
        "student": {
            "id": st.get("id"),
            "name": st.get("name"),
            "avatar": (st.get("name") or "??")[:2].upper(),
        },
    }


# =============================================================================
# OFFERINGS
# =============================================================================

@mentorship_router.get("/offerings")
async def list_offerings():
    sb = get_supabase()
    result = sb.table("mentorship_offerings").select("*").eq("active", True).execute()
    return [_enrich_offering(o) for o in (result.data or [])]


@mentorship_router.get("/offerings/mine")
async def my_offerings(alumni_id: str = "alumni_001"):
    sb = get_supabase()
    result = sb.table("mentorship_offerings").select("*").eq("alumni_id", alumni_id).execute()
    return [_enrich_offering(o) for o in (result.data or [])]


@mentorship_router.post("/offerings")
async def create_offering(body: CreateOfferingRequest):
    if body.duration not in [15, 30, 60]:
        raise HTTPException(400, "Duration must be 15, 30, or 60 minutes")

    sb = get_supabase()
    offering = {
        "alumni_id": body.alumni_id,
        "topic": body.topic,
        "description": body.description,
        "duration": body.duration,
        "price": body.price,
        "active": True,
        "tags": body.tags,
    }

    result = sb.table("mentorship_offerings").insert(offering).execute()
    if not result.data:
        raise HTTPException(500, "Failed to create offering")
    return _enrich_offering(result.data[0])


@mentorship_router.patch("/offerings/{offering_id}")
async def toggle_offering(offering_id: str, alumni_id: str = "alumni_001"):
    sb = get_supabase()
    existing = (sb.table("mentorship_offerings")
                .select("*")
                .eq("id", offering_id)
                .eq("alumni_id", alumni_id)
                .execute())

    if not existing.data:
        raise HTTPException(404, "Offering not found")

    new_active = not existing.data[0]["active"]
    result = (sb.table("mentorship_offerings")
              .update({"active": new_active})
              .eq("id", offering_id)
              .execute())

    return _enrich_offering(result.data[0]) if result.data else _enrich_offering(existing.data[0])


# =============================================================================
# REQUESTS
# =============================================================================

@mentorship_router.post("/request")
async def create_request(body: MentorshipRequestCreate):
    sb = get_supabase()

    offering = sb.table("mentorship_offerings").select("*").eq("id", body.offering_id).execute()
    if not offering.data:
        raise HTTPException(404, "Offering not found")
    if not offering.data[0]["active"]:
        raise HTTPException(400, "This offering is currently inactive")

    o = offering.data[0]

    # Check for duplicate pending
    existing = (sb.table("mentorship_requests")
                .select("id")
                .eq("offering_id", body.offering_id)
                .eq("student_id", body.student_id)
                .eq("status", "pending")
                .execute())
    if existing.data:
        raise HTTPException(400, "You already have a pending request for this offering")

    req_data = {
        "offering_id": body.offering_id,
        "student_id": body.student_id,
        "alumni_id": o["alumni_id"],
        "topic": o["topic"],
        "duration": o["duration"],
        "note": body.note or "",
        "status": "pending",
    }

    result = sb.table("mentorship_requests").insert(req_data).execute()
    if not result.data:
        raise HTTPException(500, "Failed to create request")
    return _enrich_request(result.data[0])


@mentorship_router.get("/requests/student")
async def student_requests(student_id: str = "student_001"):
    sb = get_supabase()
    result = (sb.table("mentorship_requests")
              .select("*")
              .eq("student_id", student_id)
              .order("created_at", desc=True)
              .execute())
    return [_enrich_request(r) for r in (result.data or [])]


@mentorship_router.get("/requests/alumni")
async def alumni_requests(alumni_id: str = "alumni_001"):
    sb = get_supabase()
    result = (sb.table("mentorship_requests")
              .select("*")
              .eq("alumni_id", alumni_id)
              .order("created_at", desc=True)
              .execute())
    return [_enrich_request(r) for r in (result.data or [])]


@mentorship_router.post("/requests/{request_id}/accept")
async def accept_request(request_id: str, body: AcceptRejectBody):
    sb = get_supabase()

    req = sb.table("mentorship_requests").select("*").eq("id", request_id).execute()
    if not req.data:
        raise HTTPException(404, "Request not found")

    r = req.data[0]
    if r["alumni_id"] != body.user_id:
        raise HTTPException(403, "Not authorized")
    if r["status"] != "pending":
        raise HTTPException(400, f"Cannot accept a {r['status']} request")

    sb.table("mentorship_requests").update({
        "status": "accepted",
        "responded_at": datetime.now().isoformat(),
    }).eq("id", request_id).execute()

    # Create session
    session_data = {
        "request_id": request_id,
        "offering_id": r["offering_id"],
        "student_id": r["student_id"],
        "alumni_id": r["alumni_id"],
        "topic": r["topic"],
        "duration": r["duration"],
        "status": "scheduled",
        "scheduled_at": (datetime.now() + timedelta(days=7)).isoformat(),
        "alumni_completed": False,
        "student_completed": False,
    }

    session_result = sb.table("mentorship_sessions").insert(session_data).execute()

    r["status"] = "accepted"
    return {
        "request": _enrich_request(r),
        "session": _enrich_session(session_result.data[0]) if session_result.data else None,
    }


@mentorship_router.post("/requests/{request_id}/reject")
async def reject_request(request_id: str, body: AcceptRejectBody):
    sb = get_supabase()

    req = sb.table("mentorship_requests").select("*").eq("id", request_id).execute()
    if not req.data:
        raise HTTPException(404, "Request not found")

    r = req.data[0]
    if r["alumni_id"] != body.user_id:
        raise HTTPException(403, "Not authorized")
    if r["status"] != "pending":
        raise HTTPException(400, f"Cannot reject a {r['status']} request")

    result = sb.table("mentorship_requests").update({
        "status": "rejected",
        "responded_at": datetime.now().isoformat(),
    }).eq("id", request_id).execute()

    return _enrich_request(result.data[0]) if result.data else _enrich_request(r)


@mentorship_router.post("/requests/{request_id}/cancel")
async def cancel_request(request_id: str, body: CancelBody):
    sb = get_supabase()

    req = sb.table("mentorship_requests").select("*").eq("id", request_id).execute()
    if not req.data:
        raise HTTPException(404, "Request not found")

    r = req.data[0]
    if r["student_id"] != body.student_id:
        raise HTTPException(403, "Not authorized")
    if r["status"] != "pending":
        raise HTTPException(400, "Only pending requests can be cancelled")

    result = sb.table("mentorship_requests").update({
        "status": "cancelled",
        "responded_at": datetime.now().isoformat(),
    }).eq("id", request_id).execute()

    return _enrich_request(result.data[0]) if result.data else _enrich_request(r)


# =============================================================================
# SESSIONS
# =============================================================================

@mentorship_router.get("/sessions/student")
async def student_sessions(student_id: str = "student_001"):
    sb = get_supabase()
    result = (sb.table("mentorship_sessions")
              .select("*")
              .eq("student_id", student_id)
              .order("created_at", desc=True)
              .execute())
    return [_enrich_session(s) for s in (result.data or [])]


@mentorship_router.get("/sessions/alumni")
async def alumni_sessions(alumni_id: str = "alumni_001"):
    sb = get_supabase()
    result = (sb.table("mentorship_sessions")
              .select("*")
              .eq("alumni_id", alumni_id)
              .order("created_at", desc=True)
              .execute())
    return [_enrich_session(s) for s in (result.data or [])]


@mentorship_router.post("/sessions/{session_id}/complete-alumni")
async def alumni_complete_session(session_id: str, body: CompleteBody):
    sb = get_supabase()

    session = sb.table("mentorship_sessions").select("*").eq("id", session_id).execute()
    if not session.data:
        raise HTTPException(404, "Session not found")

    s = session.data[0]
    if s["alumni_id"] != body.user_id:
        raise HTTPException(403, "Not authorized")
    if s["status"] not in ["scheduled", "awaiting_completion"]:
        raise HTTPException(400, f"Cannot complete a {s['status']} session")

    update = {"alumni_completed": True, "status": "awaiting_completion"}

    if s.get("student_completed"):
        update["status"] = "completed"
        update["completed_at"] = datetime.now().isoformat()

    result = sb.table("mentorship_sessions").update(update).eq("id", session_id).execute()
    return _enrich_session(result.data[0]) if result.data else _enrich_session(s)


@mentorship_router.post("/sessions/{session_id}/complete-student")
async def student_complete_session(session_id: str, body: CompleteBody):
    sb = get_supabase()

    session = sb.table("mentorship_sessions").select("*").eq("id", session_id).execute()
    if not session.data:
        raise HTTPException(404, "Session not found")

    s = session.data[0]
    if s["student_id"] != body.user_id:
        raise HTTPException(403, "Not authorized")
    if not s.get("alumni_completed"):
        raise HTTPException(400, "Alumni must mark completion first")
    if s.get("student_completed"):
        raise HTTPException(400, "Already confirmed completion")

    result = sb.table("mentorship_sessions").update({
        "student_completed": True,
        "status": "completed",
        "completed_at": datetime.now().isoformat(),
    }).eq("id", session_id).execute()

    return _enrich_session(result.data[0]) if result.data else _enrich_session(s)
