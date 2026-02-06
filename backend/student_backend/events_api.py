# =============================================
# AfterGrad — Events Backend (FastAPI)
# Event Listing & Creation Feature
# =============================================
#
# Context: Students list/create events, then invite
# alumni as judges, mentors, or speakers.
#
# Endpoints:
#   GET  /api/events                        — list events (NO location)
#   GET  /api/events/{id}                   — event detail (NO location)
#   POST /api/events                        — create event (students)
#   GET  /api/events/{id}/alumni            — invited alumni for an event
#   POST /api/events/{id}/request           — student invites alumni
#   GET  /api/events/{id}/requests          — list invitations for event
#   POST /api/events/request/{id}/accept    — alumni accepts invitation
#   POST /api/events/request/{id}/reject    — alumni rejects invitation
#   GET  /api/events/{id}/location          — protected location access
#   GET  /api/events/{id}/request-status    — student checks their status
#
# Run:
#   cd backend/student_backend
#   uvicorn events_api:events_router  (mounted in main.py)
# =============================================

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import uuid
from datetime import datetime

events_router = APIRouter(prefix="/api/events", tags=["events"])

# =============================================================================
# In-memory data store (hackathon — no Supabase required)
# =============================================================================

# Mock alumni/student users
MOCK_USERS = {
    "alumni_001": {"id": "alumni_001", "name": "Priya Sharma", "role": "alumni", "company": "Google", "job_title": "Senior PM", "avatar": "PS", "verified": True},
    "alumni_002": {"id": "alumni_002", "name": "Rahul Verma", "role": "alumni", "company": "Amazon", "job_title": "Senior SDE", "avatar": "RV", "verified": True},
    "alumni_003": {"id": "alumni_003", "name": "Sneha Patel", "role": "alumni", "company": "Microsoft", "job_title": "Staff Engineer", "avatar": "SP", "verified": True},
    "alumni_004": {"id": "alumni_004", "name": "Arjun Mehta", "role": "alumni", "company": "Flipkart", "job_title": "Engineering Lead", "avatar": "AM", "verified": True},
    "student_001": {"id": "student_001", "name": "Tirth Chudasama", "role": "student", "company": None, "job_title": None, "avatar": "TC", "verified": False},
    "student_002": {"id": "student_002", "name": "Aisha Khan", "role": "student", "company": None, "job_title": None, "avatar": "AK", "verified": False},
}

# Seed events
MOCK_EVENTS = [
    {
        "id": "evt_001",
        "title": "Tech Career Paths in 2026",
        "description": "An interactive session with Google & Amazon alumni discussing emerging career paths in AI, Cloud, and Product Management. Learn what it takes to break into top tech companies straight from the people who did it.",
        "event_type": "offline",
        "venue_name": "IIT Bombay, Powai",
        "start_time": "2026-02-15T14:00:00",
        "end_time": "2026-02-15T17:00:00",
        "geo_lat": 19.0760,
        "geo_lng": 72.8777,
        "allow_requests": True,
        "created_by": "student_001",
        "created_at": "2026-01-28T10:00:00",
    },
    {
        "id": "evt_002",
        "title": "Resume & Portfolio Review Night",
        "description": "Get your resume reviewed by hiring managers from Microsoft and Flipkart. Bring your portfolio, LinkedIn profile, or GitHub — alumni will provide 1-on-1 feedback in breakout rooms.",
        "event_type": "online",
        "venue_name": "Zoom Meeting",
        "start_time": "2026-02-20T19:00:00",
        "end_time": "2026-02-20T21:00:00",
        "geo_lat": None,
        "geo_lng": None,
        "allow_requests": True,
        "created_by": "student_002",
        "created_at": "2026-02-01T09:00:00",
    },
    {
        "id": "evt_003",
        "title": "Startup Founders Meetup",
        "description": "A casual offline meetup for students interested in entrepreneurship. Hear real stories from alumni who bootstrapped their startups, raised funding, and navigated failures.",
        "event_type": "offline",
        "venue_name": "WeWork Galaxy, Bangalore",
        "start_time": "2026-03-01T10:00:00",
        "end_time": "2026-03-01T13:00:00",
        "geo_lat": 12.9716,
        "geo_lng": 77.5946,
        "allow_requests": True,
        "created_by": "student_001",
        "created_at": "2026-02-05T15:00:00",
    },
    {
        "id": "evt_004",
        "title": "System Design Deep Dive",
        "description": "A hands-on workshop covering distributed systems, microservices, and real-world system design interviews. Alumni from Amazon and Google will share actual interview problems and solutions.",
        "event_type": "online",
        "venue_name": "Google Meet",
        "start_time": "2026-03-10T18:00:00",
        "end_time": "2026-03-10T20:30:00",
        "geo_lat": None,
        "geo_lng": None,
        "allow_requests": True,
        "created_by": "student_002",
        "created_at": "2026-02-06T08:00:00",
    },
    {
        "id": "evt_005",
        "title": "Women in Tech Networking Brunch",
        "description": "An exclusive offline brunch for women in tech, featuring alumni mentors from top companies. Connect, share experiences, and build lasting professional relationships in a safe, supportive space.",
        "event_type": "offline",
        "venue_name": "India Habitat Centre, Delhi",
        "start_time": "2026-03-08T11:00:00",
        "end_time": "2026-03-08T14:00:00",
        "geo_lat": 28.6139,
        "geo_lng": 77.2090,
        "allow_requests": True,
        "created_by": "student_001",
        "created_at": "2026-02-04T12:00:00",
    },
]

# Event participants (invited alumni — judges/mentors/speakers)
MOCK_PARTICIPANTS = [
    {"event_id": "evt_001", "user_id": "alumni_001", "role": "judge"},
    {"event_id": "evt_001", "user_id": "alumni_002", "role": "mentor"},
    {"event_id": "evt_002", "user_id": "alumni_003", "role": "mentor"},
    {"event_id": "evt_002", "user_id": "alumni_004", "role": "judge"},
    {"event_id": "evt_003", "user_id": "alumni_004", "role": "speaker"},
    {"event_id": "evt_003", "user_id": "alumni_001", "role": "mentor"},
    {"event_id": "evt_004", "user_id": "alumni_002", "role": "speaker"},
    {"event_id": "evt_004", "user_id": "alumni_003", "role": "judge"},
    {"event_id": "evt_005", "user_id": "alumni_001", "role": "mentor"},
    {"event_id": "evt_005", "user_id": "alumni_003", "role": "speaker"},
]

# In-memory request store
event_requests_store: list[dict] = []

# In-memory location access store
location_access_store: list[dict] = []


# =============================================================================
# Pydantic Models
# =============================================================================

class EventCreate(BaseModel):
    title: str
    description: str
    event_type: str  # online | offline
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


class RequestStatusQuery(BaseModel):
    student_id: str


# =============================================================================
# GET /api/events — list all events (NO location ever returned)
# =============================================================================

@events_router.get("")
async def list_events():
    """Return all events WITHOUT geo coordinates."""
    safe_events = []
    for evt in MOCK_EVENTS:
        safe = {
            "id": evt["id"],
            "title": evt["title"],
            "description": evt["description"],
            "event_type": evt["event_type"],
            "start_time": evt["start_time"],
            "end_time": evt["end_time"],
            "venue_name": evt.get("venue_name"),
            "allow_requests": evt["allow_requests"],
            "created_by": evt["created_by"],
            "created_at": evt["created_at"],
            # Attach alumni info
            "alumni": _get_event_alumni(evt["id"]),
        }
        safe_events.append(safe)
    return safe_events


# =============================================================================
# GET /api/events/{id} — single event detail (NO location)
# =============================================================================

@events_router.get("/{event_id}")
async def get_event(event_id: str):
    """Return single event detail WITHOUT geo coordinates."""
    evt = _find_event(event_id)
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")
    return {
        "id": evt["id"],
        "title": evt["title"],
        "description": evt["description"],
        "event_type": evt["event_type"],
        "start_time": evt["start_time"],
        "end_time": evt["end_time"],
        "venue_name": evt.get("venue_name"),
        "allow_requests": evt["allow_requests"],
        "created_by": evt["created_by"],
        "created_at": evt["created_at"],
        "alumni": _get_event_alumni(evt["id"]),
    }


# =============================================================================
# POST /api/events — create event (alumni only)
# =============================================================================

@events_router.post("")
async def create_event(req: EventCreate):
    """Create a new event. Alumni only."""
    user = MOCK_USERS.get(req.created_by)
    if not user or user["role"] != "alumni":
        raise HTTPException(status_code=403, detail="Only alumni can create events")

    new_event = {
        "id": f"evt_{str(uuid.uuid4())[:8]}",
        "title": req.title,
        "description": req.description,
        "event_type": req.event_type,
        "start_time": req.start_time,
        "end_time": req.end_time,
        "geo_lat": req.geo_lat if req.event_type == "offline" else None,
        "geo_lng": req.geo_lng if req.event_type == "offline" else None,
        "allow_requests": req.allow_requests,
        "created_by": req.created_by,
        "created_at": datetime.now().isoformat(),
    }
    MOCK_EVENTS.append(new_event)

    # Creator is host participant
    MOCK_PARTICIPANTS.append({
        "event_id": new_event["id"],
        "user_id": req.created_by,
        "role": "host",
    })

    # Return safe (no location)
    return {
        "id": new_event["id"],
        "title": new_event["title"],
        "description": new_event["description"],
        "event_type": new_event["event_type"],
        "start_time": new_event["start_time"],
        "end_time": new_event["end_time"],
        "allow_requests": new_event["allow_requests"],
        "created_by": new_event["created_by"],
        "created_at": new_event["created_at"],
        "message": "Event created successfully",
    }


# =============================================================================
# GET /api/events/{id}/alumni — alumni attending this event
# =============================================================================

@events_router.get("/{event_id}/alumni")
async def get_event_alumni(event_id: str):
    """Return alumni info for an event."""
    evt = _find_event(event_id)
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")
    return _get_event_alumni(event_id)


# =============================================================================
# POST /api/events/{id}/request — student sends request to alumni
# =============================================================================

@events_router.post("/{event_id}/request")
async def create_request(event_id: str, req: EventRequestCreate):
    """Student requests an alumni for an event."""
    evt = _find_event(event_id)
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")

    if not evt["allow_requests"]:
        raise HTTPException(status_code=403, detail="This event does not accept requests")

    # Check student exists
    student = MOCK_USERS.get(req.student_id)
    if not student or student["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can send requests")

    # Check alumni exists and is participant
    alumni = MOCK_USERS.get(req.alumni_id)
    if not alumni or alumni["role"] != "alumni":
        raise HTTPException(status_code=400, detail="Invalid alumni")

    # Check for duplicate
    for existing in event_requests_store:
        if (existing["event_id"] == event_id and
            existing["student_id"] == req.student_id and
            existing["alumni_id"] == req.alumni_id):
            raise HTTPException(status_code=409, detail="Request already sent")

    new_request = {
        "id": f"req_{str(uuid.uuid4())[:8]}",
        "event_id": event_id,
        "student_id": req.student_id,
        "alumni_id": req.alumni_id,
        "message": req.message or "",
        "status": "pending",
        "created_at": datetime.now().isoformat(),
    }
    event_requests_store.append(new_request)

    return {
        "id": new_request["id"],
        "status": "pending",
        "message": "Request sent successfully. You'll be notified when the alumni responds.",
    }


# =============================================================================
# GET /api/events/{id}/requests — get all requests for an event
# =============================================================================

@events_router.get("/{event_id}/requests")
async def list_event_requests(event_id: str):
    """List all requests for an event (for alumni dashboard)."""
    reqs = [r for r in event_requests_store if r["event_id"] == event_id]
    enriched = []
    for r in reqs:
        student = MOCK_USERS.get(r["student_id"], {})
        enriched.append({
            **r,
            "student_name": student.get("name", "Unknown"),
            "student_avatar": student.get("avatar", "??"),
        })
    return enriched


# =============================================================================
# GET /api/events/{id}/request-status?student_id=xxx — student checks status
# =============================================================================

@events_router.get("/{event_id}/request-status")
async def get_request_status(event_id: str, student_id: str):
    """Check student's request status for a specific event."""
    for r in event_requests_store:
        if r["event_id"] == event_id and r["student_id"] == student_id:
            return {"status": r["status"], "request_id": r["id"], "alumni_id": r["alumni_id"]}
    return {"status": "none"}


# =============================================================================
# POST /api/events/request/{id}/accept — alumni accepts
# =============================================================================

@events_router.post("/request/{request_id}/accept")
async def accept_request(request_id: str):
    """Alumni accepts a student request → grants location access."""
    req = _find_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    req["status"] = "accepted"

    # Grant location access
    location_access_store.append({
        "id": f"loc_{str(uuid.uuid4())[:8]}",
        "event_id": req["event_id"],
        "student_id": req["student_id"],
        "alumni_id": req["alumni_id"],
        "access_granted": True,
        "granted_at": datetime.now().isoformat(),
    })

    return {"message": "Request accepted. Location access granted.", "status": "accepted"}


# =============================================================================
# POST /api/events/request/{id}/reject — alumni rejects
# =============================================================================

@events_router.post("/request/{request_id}/reject")
async def reject_request(request_id: str):
    """Alumni rejects a student request."""
    req = _find_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    req["status"] = "rejected"
    return {"message": "Request rejected.", "status": "rejected"}


# =============================================================================
# POST /api/events/request/{id}/revoke — alumni revokes location access
# =============================================================================

@events_router.post("/request/{request_id}/revoke")
async def revoke_request(request_id: str):
    """Alumni revokes a previously accepted request → removes location access."""
    req = _find_request(request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    req["status"] = "revoked"

    # Revoke location access
    for a in location_access_store:
        if (a["event_id"] == req["event_id"] and
            a["student_id"] == req["student_id"] and
            a["alumni_id"] == req["alumni_id"]):
            a["access_granted"] = False
            a["revoked_at"] = datetime.now().isoformat()

    return {"message": "Access revoked. Log recorded.", "status": "revoked"}


# =============================================================================
# GET /api/events/location-requests?student_id=xxx — student's location requests
# =============================================================================

@events_router.get("/location-requests/all")
async def get_student_location_requests(student_id: str):
    """Get all location requests for a student across all events."""
    results = []
    for r in event_requests_store:
        if r["student_id"] == student_id:
            evt = _find_event(r["event_id"])
            alumni = MOCK_USERS.get(r["alumni_id"], {})
            # Check if location access was granted then revoked
            access_entry = None
            for a in location_access_store:
                if (a["event_id"] == r["event_id"] and
                    a["student_id"] == r["student_id"]):
                    access_entry = a
            results.append({
                **r,
                "event_title": evt["title"] if evt else "Unknown",
                "event_type": evt["event_type"] if evt else "unknown",
                "alumni_name": alumni.get("name", "Unknown"),
                "alumni_avatar": alumni.get("avatar", "??"),
                "alumni_company": alumni.get("company", ""),
                "granted_at": access_entry.get("granted_at") if access_entry else None,
                "revoked_at": access_entry.get("revoked_at") if access_entry else None,
            })
    return results


# =============================================================================
# GET /api/events/location-control/all — alumni's location grants
# =============================================================================

@events_router.get("/location-control/all")
async def get_alumni_location_control(alumni_id: str):
    """Get all location access records for events created by this alumni."""
    # Get events created by this alumni
    my_events = [e for e in MOCK_EVENTS if e["created_by"] == alumni_id]
    my_event_ids = {e["id"] for e in my_events}

    results = []
    for r in event_requests_store:
        if r["event_id"] in my_event_ids:
            evt = _find_event(r["event_id"])
            student = MOCK_USERS.get(r["student_id"], {})
            access_entry = None
            for a in location_access_store:
                if (a["event_id"] == r["event_id"] and
                    a["student_id"] == r["student_id"]):
                    access_entry = a
            results.append({
                **r,
                "event_title": evt["title"] if evt else "Unknown",
                "student_name": student.get("name", "Unknown"),
                "student_avatar": student.get("avatar", "??"),
                "location_granted": access_entry.get("access_granted", False) if access_entry else False,
                "granted_at": access_entry.get("granted_at") if access_entry else None,
                "revoked_at": access_entry.get("revoked_at") if access_entry else None,
            })
    return results


# =============================================================================
# GET /api/events/{id}/location?student_id=xxx — PROTECTED location endpoint
# =============================================================================

@events_router.get("/{event_id}/location")
async def get_event_location(event_id: str, student_id: str):
    """
    CRITICAL: Only returns location if student has been granted access.
    Checks event_location_access table.
    """
    evt = _find_event(event_id)
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")

    if evt["event_type"] == "online":
        return {"location_type": "online", "message": "This is an online event — no physical location."}

    # Check access
    has_access = any(
        a["event_id"] == event_id and
        a["student_id"] == student_id and
        a["access_granted"]
        for a in location_access_store
    )

    if not has_access:
        raise HTTPException(
            status_code=403,
            detail="Location access not granted. Wait for alumni to accept your request."
        )

    # Find the granted_at timestamp
    granted_at = None
    for a in location_access_store:
        if (a["event_id"] == event_id and a["student_id"] == student_id and a["access_granted"]):
            granted_at = a.get("granted_at")
            break

    return {
        "location_type": "offline",
        "geo_lat": evt["geo_lat"],
        "geo_lng": evt["geo_lng"],
        "access_granted": True,
        "granted_at": granted_at,
    }


# =============================================================================
# Helper functions
# =============================================================================

def _find_event(event_id: str) -> Optional[dict]:
    for evt in MOCK_EVENTS:
        if evt["id"] == event_id:
            return evt
    return None


def _find_request(request_id: str) -> Optional[dict]:
    for r in event_requests_store:
        if r["id"] == request_id:
            return r
    return None


def _get_event_alumni(event_id: str) -> list[dict]:
    """Get invited alumni details for an event (judges/mentors/speakers)."""
    participants = [p for p in MOCK_PARTICIPANTS if p["event_id"] == event_id]
    result = []
    for p in participants:
        user = MOCK_USERS.get(p["user_id"])
        if user and user["role"] == "alumni":
            result.append({
                "id": user["id"],
                "name": user["name"],
                "company": user["company"],
                "job_title": user["job_title"],
                "avatar": user["avatar"],
                "verified": user["verified"],
                "event_role": p["role"],  # judge | mentor | speaker
            })
    return result
