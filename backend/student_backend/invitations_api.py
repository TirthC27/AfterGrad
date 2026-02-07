# =============================================
# AfterGrad — Alumni Invitations API
# =============================================
#
# Students can invite alumni as mentor/judge/speaker for events.
# Alumni can view and respond to invitations.
#
# Endpoints:
#   POST /api/invitations              — student invites alumni
#   GET  /api/invitations/alumni       — alumni's incoming invitations
#   GET  /api/invitations/student      — student's sent invitations
#   POST /api/invitations/{id}/accept  — alumni accepts
#   POST /api/invitations/{id}/decline — alumni declines
#   GET  /api/invitations/event/{id}   — invitations for a specific event
# =============================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from db import get_supabase

invitations_router = APIRouter(prefix="/api/invitations", tags=["invitations"])


# =============================================================================
# Models
# =============================================================================

class InvitationCreate(BaseModel):
    event_id: str
    student_id: str
    alumni_id: str
    role: str  # mentor, judge, speaker, guest
    message: Optional[str] = ""


class InvitationResponse(BaseModel):
    user_id: str


# =============================================================================
# Helpers
# =============================================================================

def _enrich_invitation(inv: dict) -> dict:
    sb = get_supabase()
    alumni = sb.table("profiles").select("*").eq("id", inv["alumni_id"]).execute()
    student = sb.table("profiles").select("*").eq("id", inv["student_id"]).execute()
    event = sb.table("events").select("id, title, event_type, start_time, venue_name").eq("id", inv["event_id"]).execute()

    a = alumni.data[0] if alumni.data else {}
    s = student.data[0] if student.data else {}
    e = event.data[0] if event.data else {}

    return {
        **inv,
        "alumni": {
            "id": a.get("id"),
            "name": a.get("name"),
            "company": a.get("company"),
            "job_title": a.get("job_title"),
            "avatar": (a.get("name") or "??")[:2].upper(),
        },
        "student": {
            "id": s.get("id"),
            "name": s.get("name"),
            "college": s.get("college"),
            "avatar": (s.get("name") or "??")[:2].upper(),
        },
        "event": {
            "id": e.get("id"),
            "title": e.get("title"),
            "event_type": e.get("event_type"),
            "start_time": e.get("start_time"),
            "venue_name": e.get("venue_name"),
        },
    }


# =============================================================================
# POST /api/invitations — student invites alumni
# =============================================================================

@invitations_router.post("")
async def create_invitation(req: InvitationCreate):
    sb = get_supabase()

    if req.role not in ("mentor", "judge", "speaker", "guest"):
        raise HTTPException(400, "Role must be: mentor, judge, speaker, or guest")

    # Check event exists
    evt = sb.table("events").select("id").eq("id", req.event_id).execute()
    if not evt.data:
        raise HTTPException(404, "Event not found")

    # Check alumni exists
    alumni = sb.table("profiles").select("id, role").eq("id", req.alumni_id).execute()
    if not alumni.data or alumni.data[0]["role"] != "alumni":
        raise HTTPException(404, "Alumni not found")

    # Check for duplicate
    existing = (sb.table("alumni_invitations")
                .select("id")
                .eq("event_id", req.event_id)
                .eq("student_id", req.student_id)
                .eq("alumni_id", req.alumni_id)
                .execute())
    if existing.data:
        raise HTTPException(409, "Invitation already sent to this alumni for this event")

    new_inv = {
        "event_id": req.event_id,
        "student_id": req.student_id,
        "alumni_id": req.alumni_id,
        "role": req.role,
        "message": req.message or "",
        "status": "pending",
    }

    result = sb.table("alumni_invitations").insert(new_inv).execute()
    if not result.data:
        raise HTTPException(500, "Failed to create invitation")

    return {
        "invitation": _enrich_invitation(result.data[0]),
        "message": "Invitation sent successfully!",
    }


# =============================================================================
# GET /api/invitations/alumni — alumni's incoming invitations
# =============================================================================

@invitations_router.get("/alumni")
async def alumni_invitations(alumni_id: str):
    sb = get_supabase()
    result = (sb.table("alumni_invitations")
              .select("*")
              .eq("alumni_id", alumni_id)
              .order("created_at", desc=True)
              .execute())
    return [_enrich_invitation(inv) for inv in (result.data or [])]


# =============================================================================
# GET /api/invitations/student — student's sent invitations
# =============================================================================

@invitations_router.get("/student")
async def student_invitations(student_id: str):
    sb = get_supabase()
    result = (sb.table("alumni_invitations")
              .select("*")
              .eq("student_id", student_id)
              .order("created_at", desc=True)
              .execute())
    return [_enrich_invitation(inv) for inv in (result.data or [])]


# =============================================================================
# GET /api/invitations/event/{id} — invitations for an event
# =============================================================================

@invitations_router.get("/event/{event_id}")
async def event_invitations(event_id: str):
    sb = get_supabase()
    result = (sb.table("alumni_invitations")
              .select("*")
              .eq("event_id", event_id)
              .order("created_at", desc=True)
              .execute())
    return [_enrich_invitation(inv) for inv in (result.data or [])]


# =============================================================================
# POST /api/invitations/{id}/accept
# =============================================================================

@invitations_router.post("/{invitation_id}/accept")
async def accept_invitation(invitation_id: str, body: InvitationResponse):
    sb = get_supabase()

    inv = sb.table("alumni_invitations").select("*").eq("id", invitation_id).execute()
    if not inv.data:
        raise HTTPException(404, "Invitation not found")

    i = inv.data[0]
    if i["alumni_id"] != body.user_id:
        raise HTTPException(403, "Not authorized")
    if i["status"] != "pending":
        raise HTTPException(400, f"Cannot accept a {i['status']} invitation")

    sb.table("alumni_invitations").update({
        "status": "accepted",
        "responded_at": datetime.now().isoformat(),
    }).eq("id", invitation_id).execute()

    # Also add alumni as participant in the event
    try:
        sb.table("event_participants").upsert({
            "event_id": i["event_id"],
            "user_id": i["alumni_id"],
            "role": i["role"],
        }).execute()
    except Exception:
        pass  # Might already be a participant

    return {"message": "Invitation accepted. You've been added to the event!", "status": "accepted"}


# =============================================================================
# POST /api/invitations/{id}/decline
# =============================================================================

@invitations_router.post("/{invitation_id}/decline")
async def decline_invitation(invitation_id: str, body: InvitationResponse):
    sb = get_supabase()

    inv = sb.table("alumni_invitations").select("*").eq("id", invitation_id).execute()
    if not inv.data:
        raise HTTPException(404, "Invitation not found")

    i = inv.data[0]
    if i["alumni_id"] != body.user_id:
        raise HTTPException(403, "Not authorized")
    if i["status"] != "pending":
        raise HTTPException(400, f"Cannot decline a {i['status']} invitation")

    sb.table("alumni_invitations").update({
        "status": "declined",
        "responded_at": datetime.now().isoformat(),
    }).eq("id", invitation_id).execute()

    return {"message": "Invitation declined.", "status": "declined"}
