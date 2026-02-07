# =============================================
# AfterGrad — Events API (Supabase-connected)
# =============================================
#
# All original endpoints preserved + Supabase integration
#
# Endpoints:
#   GET  /api/events                        — list events (NO location)
#   GET  /api/events/{id}                   — event detail (NO location)
#   POST /api/events                        — create event
#   GET  /api/events/{id}/alumni            — invited alumni
#   POST /api/events/{id}/request           — student requests alumni
#   GET  /api/events/{id}/requests          — list requests for event
#   GET  /api/events/{id}/request-status    — student checks status
#   POST /api/events/request/{id}/accept    — alumni accepts
#   POST /api/events/request/{id}/reject    — alumni rejects
#   POST /api/events/request/{id}/revoke    — alumni revokes access
#   GET  /api/events/{id}/location          — protected location
#   GET  /api/events/location-requests/all  — student's requests
#   GET  /api/events/location-control/all   — alumni's grants
# =============================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from db import get_supabase

events_router = APIRouter(prefix="/api/events", tags=["events"])


# =============================================================================
# Models
# =============================================================================

class EventCreate(BaseModel):
    title: str
    description: str
    event_type: str
    venue_name: Optional[str] = None
    start_time: str
    end_time: Optional[str] = None
    geo_lat: Optional[float] = None
    geo_lng: Optional[float] = None
    allow_requests: bool = True
    created_by: str


class EventRequestCreate(BaseModel):
    student_id: str
    alumni_id: str
    message: Optional[str] = ""


# =============================================================================
# Helpers
# =============================================================================

def _safe_event(evt: dict) -> dict:
    """Strip geo coordinates from event for public response."""
    return {
        "id": evt["id"],
        "title": evt["title"],
        "description": evt.get("description"),
        "event_type": evt["event_type"],
        "venue_name": evt.get("venue_name"),
        "start_time": evt["start_time"],
        "end_time": evt.get("end_time"),
        "allow_requests": evt.get("allow_requests", True),
        "created_by": evt.get("created_by"),
        "created_at": evt.get("created_at"),
    }


def _get_event_alumni(event_id: str) -> list[dict]:
    """Get alumni participants for an event with profile info."""
    sb = get_supabase()
    participants = sb.table("event_participants").select("*").eq("event_id", event_id).execute()

    alumni_list = []
    for p in (participants.data or []):
        profile = sb.table("profiles").select("*").eq("id", p["user_id"]).execute()
        if profile.data and profile.data[0].get("role") == "alumni":
            user = profile.data[0]
            alumni_list.append({
                "id": user["id"],
                "name": user.get("name"),
                "company": user.get("company"),
                "job_title": user.get("job_title"),
                "avatar": (user.get("name") or "??")[:2].upper(),
                "verified": True,
                "event_role": p["role"],
            })
    return alumni_list


# =============================================================================
# GET /api/events
# =============================================================================

@events_router.get("")
async def list_events():
    sb = get_supabase()
    result = sb.table("events").select("*").order("created_at", desc=True).execute()

    safe_events = []
    for evt in (result.data or []):
        safe = _safe_event(evt)
        safe["alumni"] = _get_event_alumni(evt["id"])
        safe_events.append(safe)

    return safe_events


# =============================================================================
# GET /api/events/{id}
# =============================================================================

@events_router.get("/{event_id}")
async def get_event(event_id: str):
    sb = get_supabase()
    result = sb.table("events").select("*").eq("id", event_id).execute()
    if not result.data:
        raise HTTPException(404, "Event not found")

    evt = result.data[0]
    safe = _safe_event(evt)
    safe["alumni"] = _get_event_alumni(event_id)
    return safe


# =============================================================================
# POST /api/events
# =============================================================================

@events_router.post("")
async def create_event(req: EventCreate):
    sb = get_supabase()

    event_data = {
        "title": req.title,
        "description": req.description,
        "event_type": req.event_type,
        "venue_name": req.venue_name,
        "start_time": req.start_time,
        "end_time": req.end_time,
        "geo_lat": req.geo_lat if req.event_type == "offline" else None,
        "geo_lng": req.geo_lng if req.event_type == "offline" else None,
        "allow_requests": req.allow_requests,
        "created_by": req.created_by,
    }

    result = sb.table("events").insert(event_data).execute()
    if not result.data:
        raise HTTPException(500, "Failed to create event")

    new_event = result.data[0]

    # Add creator as host participant
    sb.table("event_participants").insert({
        "event_id": new_event["id"],
        "user_id": req.created_by,
        "role": "host",
    }).execute()

    return {**_safe_event(new_event), "message": "Event created successfully"}


# =============================================================================
# GET /api/events/{id}/alumni
# =============================================================================

@events_router.get("/{event_id}/alumni")
async def get_event_alumni(event_id: str):
    return _get_event_alumni(event_id)


# =============================================================================
# POST /api/events/{id}/request
# =============================================================================

@events_router.post("/{event_id}/request")
async def create_request(event_id: str, req: EventRequestCreate):
    sb = get_supabase()

    # Check event
    evt = sb.table("events").select("*").eq("id", event_id).execute()
    if not evt.data:
        raise HTTPException(404, "Event not found")
    if not evt.data[0].get("allow_requests"):
        raise HTTPException(403, "This event does not accept requests")

    # Check for duplicate
    existing = (sb.table("event_requests")
                .select("id")
                .eq("event_id", event_id)
                .eq("student_id", req.student_id)
                .eq("alumni_id", req.alumni_id)
                .execute())
    if existing.data:
        raise HTTPException(409, "Request already sent")

    new_req = {
        "event_id": event_id,
        "student_id": req.student_id,
        "alumni_id": req.alumni_id,
        "message": req.message or "",
        "status": "pending",
    }

    result = sb.table("event_requests").insert(new_req).execute()
    if not result.data:
        raise HTTPException(500, "Failed to create request")

    return {
        "id": result.data[0]["id"],
        "status": "pending",
        "message": "Request sent successfully. You'll be notified when the alumni responds.",
    }


# =============================================================================
# GET /api/events/{id}/requests
# =============================================================================

@events_router.get("/{event_id}/requests")
async def list_event_requests(event_id: str):
    sb = get_supabase()
    reqs = sb.table("event_requests").select("*").eq("event_id", event_id).execute()

    enriched = []
    for r in (reqs.data or []):
        student = sb.table("profiles").select("name, avatar_url").eq("id", r["student_id"]).execute()
        s = student.data[0] if student.data else {}
        enriched.append({
            **r,
            "student_name": s.get("name", "Unknown"),
            "student_avatar": (s.get("name") or "??")[:2].upper(),
        })
    return enriched


# =============================================================================
# GET /api/events/{id}/request-status
# =============================================================================

@events_router.get("/{event_id}/request-status")
async def get_request_status(event_id: str, student_id: str):
    sb = get_supabase()
    result = (sb.table("event_requests")
              .select("*")
              .eq("event_id", event_id)
              .eq("student_id", student_id)
              .execute())

    if result.data:
        r = result.data[0]
        return {"status": r["status"], "request_id": r["id"], "alumni_id": r["alumni_id"]}
    return {"status": "none"}


# =============================================================================
# POST /api/events/request/{id}/accept
# =============================================================================

@events_router.post("/request/{request_id}/accept")
async def accept_request(request_id: str):
    sb = get_supabase()
    req = sb.table("event_requests").select("*").eq("id", request_id).execute()
    if not req.data:
        raise HTTPException(404, "Request not found")

    r = req.data[0]
    sb.table("event_requests").update({
        "status": "accepted",
        "responded_at": datetime.now().isoformat(),
    }).eq("id", request_id).execute()

    # Grant location access
    sb.table("event_location_access").upsert({
        "event_id": r["event_id"],
        "student_id": r["student_id"],
        "alumni_id": r["alumni_id"],
        "access_granted": True,
        "granted_at": datetime.now().isoformat(),
    }).execute()

    return {"message": "Request accepted. Location access granted.", "status": "accepted"}


# =============================================================================
# POST /api/events/request/{id}/reject
# =============================================================================

@events_router.post("/request/{request_id}/reject")
async def reject_request(request_id: str):
    sb = get_supabase()
    req = sb.table("event_requests").select("*").eq("id", request_id).execute()
    if not req.data:
        raise HTTPException(404, "Request not found")

    sb.table("event_requests").update({
        "status": "rejected",
        "responded_at": datetime.now().isoformat(),
    }).eq("id", request_id).execute()

    return {"message": "Request rejected.", "status": "rejected"}


# =============================================================================
# POST /api/events/request/{id}/revoke
# =============================================================================

@events_router.post("/request/{request_id}/revoke")
async def revoke_request(request_id: str):
    sb = get_supabase()
    req = sb.table("event_requests").select("*").eq("id", request_id).execute()
    if not req.data:
        raise HTTPException(404, "Request not found")

    r = req.data[0]
    sb.table("event_requests").update({
        "status": "revoked",
        "responded_at": datetime.now().isoformat(),
    }).eq("id", request_id).execute()

    # Revoke location access
    sb.table("event_location_access").update({
        "access_granted": False,
        "revoked_at": datetime.now().isoformat(),
    }).eq("event_id", r["event_id"]).eq("student_id", r["student_id"]).eq("alumni_id", r["alumni_id"]).execute()

    return {"message": "Access revoked.", "status": "revoked"}


# =============================================================================
# GET /api/events/location-requests/all
# =============================================================================

@events_router.get("/location-requests/all")
async def get_student_location_requests(student_id: str):
    sb = get_supabase()
    reqs = sb.table("event_requests").select("*").eq("student_id", student_id).execute()

    results = []
    for r in (reqs.data or []):
        evt = sb.table("events").select("title, event_type").eq("id", r["event_id"]).execute()
        alumni = sb.table("profiles").select("name, company, avatar_url").eq("id", r["alumni_id"]).execute()
        access = (sb.table("event_location_access")
                  .select("*")
                  .eq("event_id", r["event_id"])
                  .eq("student_id", r["student_id"])
                  .execute())

        e = evt.data[0] if evt.data else {}
        a = alumni.data[0] if alumni.data else {}
        loc = access.data[0] if access.data else {}

        results.append({
            **r,
            "event_title": e.get("title", "Unknown"),
            "event_type": e.get("event_type", "unknown"),
            "alumni_name": a.get("name", "Unknown"),
            "alumni_avatar": (a.get("name") or "??")[:2].upper(),
            "alumni_company": a.get("company", ""),
            "granted_at": loc.get("granted_at"),
            "revoked_at": loc.get("revoked_at"),
        })
    return results


# =============================================================================
# GET /api/events/location-control/all
# =============================================================================

@events_router.get("/location-control/all")
async def get_alumni_location_control(alumni_id: str):
    sb = get_supabase()

    # Get events created by this alumni
    my_events = sb.table("events").select("id").eq("created_by", alumni_id).execute()
    event_ids = [e["id"] for e in (my_events.data or [])]

    if not event_ids:
        return []

    results = []
    for eid in event_ids:
        reqs = sb.table("event_requests").select("*").eq("event_id", eid).execute()
        for r in (reqs.data or []):
            student = sb.table("profiles").select("name, avatar_url").eq("id", r["student_id"]).execute()
            evt = sb.table("events").select("title").eq("id", r["event_id"]).execute()
            access = (sb.table("event_location_access")
                      .select("*")
                      .eq("event_id", r["event_id"])
                      .eq("student_id", r["student_id"])
                      .execute())

            s = student.data[0] if student.data else {}
            e = evt.data[0] if evt.data else {}
            loc = access.data[0] if access.data else {}

            results.append({
                **r,
                "event_title": e.get("title", "Unknown"),
                "student_name": s.get("name", "Unknown"),
                "student_avatar": (s.get("name") or "??")[:2].upper(),
                "location_granted": loc.get("access_granted", False),
                "granted_at": loc.get("granted_at"),
                "revoked_at": loc.get("revoked_at"),
            })
    return results


# =============================================================================
# GET /api/events/{id}/location — PROTECTED
# =============================================================================

@events_router.get("/{event_id}/location")
async def get_event_location(event_id: str, student_id: str):
    sb = get_supabase()

    evt = sb.table("events").select("*").eq("id", event_id).execute()
    if not evt.data:
        raise HTTPException(404, "Event not found")

    event = evt.data[0]
    if event["event_type"] == "online":
        return {"location_type": "online", "message": "This is an online event — no physical location."}

    # Check access
    access = (sb.table("event_location_access")
              .select("*")
              .eq("event_id", event_id)
              .eq("student_id", student_id)
              .eq("access_granted", True)
              .execute())

    if not access.data:
        raise HTTPException(403, "Location access not granted. Wait for alumni to accept your request.")

    return {
        "location_type": "offline",
        "geo_lat": event.get("geo_lat"),
        "geo_lng": event.get("geo_lng"),
        "access_granted": True,
        "granted_at": access.data[0].get("granted_at"),
    }
