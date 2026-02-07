# =============================================
# AfterGrad — Mentorship Backend (FastAPI)
# Privacy-first, escrow-ready mentorship system
# =============================================
#
# Endpoints:
#   GET  /api/mentorship/offerings             — browse mentor offerings (students)
#   POST /api/mentorship/offerings             — create offering (alumni)
#   PATCH /api/mentorship/offerings/{id}       — toggle active/inactive (alumni)
#   GET  /api/mentorship/offerings/mine        — alumni's own offerings
#   POST /api/mentorship/request               — student requests mentorship
#   GET  /api/mentorship/requests/student      — student's requests
#   GET  /api/mentorship/requests/alumni       — alumni's incoming requests
#   POST /api/mentorship/requests/{id}/accept  — alumni accepts request
#   POST /api/mentorship/requests/{id}/reject  — alumni rejects request
#   POST /api/mentorship/requests/{id}/cancel  — student cancels pending request
#   GET  /api/mentorship/sessions/student      — student's sessions
#   GET  /api/mentorship/sessions/alumni       — alumni's sessions
#   POST /api/mentorship/sessions/{id}/complete-alumni   — alumni marks complete
#   POST /api/mentorship/sessions/{id}/complete-student  — student confirms complete
#
# =============================================

from typing import Optional
from datetime import datetime, timedelta
import uuid
import random
import string

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

mentorship_router = APIRouter(prefix="/api/mentorship", tags=["mentorship"])


def _generate_meet_link():
    """Generate a working Jitsi Meet link (free, no auth required)."""
    room_id = uuid.uuid4().hex[:12]
    return f"https://meet.jit.si/AfterGrad-{room_id}"


# =============================================================================
# In-memory data store
# =============================================================================

MOCK_USERS = {
    "alumni_001": {"id": "alumni_001", "name": "Priya Sharma", "role": "alumni", "company": "Google", "job_title": "Senior PM", "avatar": "PS", "verified": True},
    "alumni_002": {"id": "alumni_002", "name": "Rahul Verma", "role": "alumni", "company": "Amazon", "job_title": "Senior SDE", "avatar": "RV", "verified": True},
    "alumni_003": {"id": "alumni_003", "name": "Sneha Patel", "role": "alumni", "company": "Microsoft", "job_title": "Staff Engineer", "avatar": "SP", "verified": True},
    "alumni_004": {"id": "alumni_004", "name": "Arjun Mehta", "role": "alumni", "company": "Flipkart", "job_title": "Engineering Lead", "avatar": "AM", "verified": True},
    "student_001": {"id": "student_001", "name": "Tirth Chudasama", "role": "student", "avatar": "TC", "verified": False},
    "student_002": {"id": "student_002", "name": "Aisha Khan", "role": "student", "avatar": "AK", "verified": False},
}

# Seed mentorship offerings
MOCK_OFFERINGS = [
    {
        "id": "offer_001",
        "alumni_id": "alumni_001",
        "topic": "Breaking into Product Management",
        "description": "1-on-1 guidance on transitioning from engineering to PM roles at top tech companies. Covers resume crafting, case study prep, and interview strategy.",
        "duration": 30,
        "price": 0,
        "active": True,
        "created_at": "2026-01-20T10:00:00",
        "tags": ["Product Management", "Career Switch", "Interview Prep"],
    },
    {
        "id": "offer_002",
        "alumni_id": "alumni_002",
        "topic": "System Design Interview Mastery",
        "description": "Deep-dive into distributed systems concepts, real-world architecture patterns, and how to ace system design rounds at FAANG companies.",
        "duration": 60,
        "price": 0,
        "active": True,
        "created_at": "2026-01-22T14:00:00",
        "tags": ["System Design", "Backend", "FAANG"],
    },
    {
        "id": "offer_003",
        "alumni_id": "alumni_003",
        "topic": "Open Source Contributions for Career Growth",
        "description": "How to leverage open-source work to build credibility, get noticed by recruiters, and grow as a software engineer. Includes portfolio review.",
        "duration": 30,
        "price": 0,
        "active": True,
        "created_at": "2026-01-25T09:00:00",
        "tags": ["Open Source", "Portfolio", "Career Growth"],
    },
    {
        "id": "offer_004",
        "alumni_id": "alumni_004",
        "topic": "Startup Fundamentals — From Idea to MVP",
        "description": "Practical walkthrough of validating ideas, building MVPs, and pitching to investors. Real stories from bootstrapping and raising seed funding.",
        "duration": 60,
        "price": 0,
        "active": True,
        "created_at": "2026-01-28T11:00:00",
        "tags": ["Startup", "Entrepreneurship", "MVP"],
    },
    {
        "id": "offer_005",
        "alumni_id": "alumni_001",
        "topic": "Resume & LinkedIn Optimization",
        "description": "Get actionable feedback on your resume and LinkedIn profile. Learn what hiring managers actually look for and how to stand out in applicant pools.",
        "duration": 15,
        "price": 0,
        "active": True,
        "created_at": "2026-02-01T08:00:00",
        "tags": ["Resume", "LinkedIn", "Job Search"],
    },
]

# Mentorship requests: student → offering
MOCK_REQUESTS = [
    {
        "id": "mreq_001",
        "offering_id": "offer_001",
        "student_id": "student_001",
        "alumni_id": "alumni_001",
        "topic": "Breaking into Product Management",
        "duration": 30,
        "note": "I'm a final-year CS student exploring PM roles. Would love guidance on how to position my engineering background.",
        "status": "accepted",  # pending | accepted | rejected | cancelled
        "created_at": "2026-01-25T16:00:00",
        "responded_at": "2026-01-26T10:00:00",
    },
    {
        "id": "mreq_002",
        "offering_id": "offer_002",
        "student_id": "student_001",
        "alumni_id": "alumni_002",
        "topic": "System Design Interview Mastery",
        "duration": 60,
        "note": "Preparing for upcoming Amazon interview. Need help with design patterns for distributed systems.",
        "status": "pending",
        "created_at": "2026-02-03T11:00:00",
        "responded_at": None,
    },
    {
        "id": "mreq_003",
        "offering_id": "offer_003",
        "student_id": "student_002",
        "alumni_id": "alumni_003",
        "topic": "Open Source Contributions for Career Growth",
        "duration": 30,
        "note": "Want to start contributing to open-source but don't know where to begin.",
        "status": "rejected",
        "created_at": "2026-02-01T09:30:00",
        "responded_at": "2026-02-02T14:00:00",
    },
]

# Sessions: created when a request is accepted
MOCK_SESSIONS = [
    {
        "id": "msess_001",
        "request_id": "mreq_001",
        "offering_id": "offer_001",
        "student_id": "student_001",
        "alumni_id": "alumni_001",
        "topic": "Breaking into Product Management",
        "duration": 30,
        "status": "scheduled",  # scheduled | awaiting_completion | completed | disputed
        "scheduled_at": "2026-02-10T15:00:00",
        "alumni_completed": False,
        "student_completed": False,
        "completed_at": None,
        "meet_link": "https://meet.jit.si/AfterGrad-pm-session-001",
        "created_at": "2026-01-26T10:00:00",
    },
]


# =============================================================================
# Pydantic models
# =============================================================================

class CreateOfferingRequest(BaseModel):
    alumni_id: str
    topic: str
    description: str
    duration: int  # 15 | 30 | 60
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
# Helper: enrich with user info
# =============================================================================

def _enrich_offering(o):
    alumni = MOCK_USERS.get(o["alumni_id"], {})
    return {
        **o,
        "alumni": {
            "id": alumni.get("id"),
            "name": alumni.get("name"),
            "company": alumni.get("company"),
            "job_title": alumni.get("job_title"),
            "avatar": alumni.get("avatar"),
            "verified": alumni.get("verified", False),
        }
    }


def _enrich_request(r):
    alumni = MOCK_USERS.get(r["alumni_id"], {})
    student = MOCK_USERS.get(r["student_id"], {})
    return {
        **r,
        "alumni": {
            "id": alumni.get("id"),
            "name": alumni.get("name"),
            "company": alumni.get("company"),
            "job_title": alumni.get("job_title"),
            "avatar": alumni.get("avatar"),
            "verified": alumni.get("verified", False),
        },
        "student": {
            "id": student.get("id"),
            "name": student.get("name"),
            "avatar": student.get("avatar"),
        },
    }


def _enrich_session(s):
    alumni = MOCK_USERS.get(s["alumni_id"], {})
    student = MOCK_USERS.get(s["student_id"], {})
    return {
        **s,
        "alumni": {
            "id": alumni.get("id"),
            "name": alumni.get("name"),
            "company": alumni.get("company"),
            "job_title": alumni.get("job_title"),
            "avatar": alumni.get("avatar"),
            "verified": alumni.get("verified", False),
        },
        "student": {
            "id": student.get("id"),
            "name": student.get("name"),
            "avatar": student.get("avatar"),
        },
    }


# =============================================================================
# OFFERINGS endpoints
# =============================================================================

@mentorship_router.get("/offerings")
def list_offerings():
    """Browse active mentorship offerings (students)."""
    active = [o for o in MOCK_OFFERINGS if o["active"]]
    return [_enrich_offering(o) for o in active]


@mentorship_router.get("/offerings/mine")
def my_offerings(alumni_id: str = "alumni_001"):
    """Alumni's own offerings."""
    mine = [o for o in MOCK_OFFERINGS if o["alumni_id"] == alumni_id]
    return [_enrich_offering(o) for o in mine]


@mentorship_router.post("/offerings")
def create_offering(body: CreateOfferingRequest):
    """Alumni creates a mentorship offering."""
    if body.duration not in [15, 30, 60]:
        raise HTTPException(400, "Duration must be 15, 30, or 60 minutes")

    offering = {
        "id": f"offer_{uuid.uuid4().hex[:6]}",
        "alumni_id": body.alumni_id,
        "topic": body.topic,
        "description": body.description,
        "duration": body.duration,
        "price": body.price,
        "active": True,
        "created_at": datetime.now().isoformat(),
        "tags": body.tags,
    }
    MOCK_OFFERINGS.append(offering)
    return _enrich_offering(offering)


@mentorship_router.patch("/offerings/{offering_id}")
def toggle_offering(offering_id: str, alumni_id: str = "alumni_001"):
    """Toggle an offering active/inactive."""
    for o in MOCK_OFFERINGS:
        if o["id"] == offering_id and o["alumni_id"] == alumni_id:
            o["active"] = not o["active"]
            return _enrich_offering(o)
    raise HTTPException(404, "Offering not found")


# =============================================================================
# REQUEST endpoints
# =============================================================================

@mentorship_router.post("/request")
def create_request(body: MentorshipRequestCreate):
    """Student requests mentorship for a specific offering."""
    # Find offering
    offering = next((o for o in MOCK_OFFERINGS if o["id"] == body.offering_id), None)
    if not offering:
        raise HTTPException(404, "Offering not found")
    if not offering["active"]:
        raise HTTPException(400, "This offering is currently inactive")

    # Check duplicate pending
    existing = next(
        (r for r in MOCK_REQUESTS
         if r["offering_id"] == body.offering_id
         and r["student_id"] == body.student_id
         and r["status"] == "pending"),
        None
    )
    if existing:
        raise HTTPException(400, "You already have a pending request for this offering")

    req = {
        "id": f"mreq_{uuid.uuid4().hex[:6]}",
        "offering_id": body.offering_id,
        "student_id": body.student_id,
        "alumni_id": offering["alumni_id"],
        "topic": offering["topic"],
        "duration": offering["duration"],
        "note": body.note or "",
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "responded_at": None,
    }
    MOCK_REQUESTS.append(req)
    return _enrich_request(req)


@mentorship_router.get("/requests/student")
def student_requests(student_id: str = "student_001"):
    """All mentorship requests for a student."""
    reqs = [r for r in MOCK_REQUESTS if r["student_id"] == student_id]
    reqs.sort(key=lambda r: r["created_at"], reverse=True)
    return [_enrich_request(r) for r in reqs]


@mentorship_router.get("/requests/alumni")
def alumni_requests(alumni_id: str = "alumni_001"):
    """Incoming mentorship requests for an alumni."""
    reqs = [r for r in MOCK_REQUESTS if r["alumni_id"] == alumni_id]
    reqs.sort(key=lambda r: r["created_at"], reverse=True)
    return [_enrich_request(r) for r in reqs]


@mentorship_router.post("/requests/{request_id}/accept")
def accept_request(request_id: str, body: AcceptRejectBody):
    """Alumni accepts a mentorship request → creates a session."""
    req = next((r for r in MOCK_REQUESTS if r["id"] == request_id), None)
    if not req:
        raise HTTPException(404, "Request not found")
    if req["alumni_id"] != body.user_id:
        raise HTTPException(403, "Not authorized")
    if req["status"] != "pending":
        raise HTTPException(400, f"Cannot accept a {req['status']} request")

    req["status"] = "accepted"
    req["responded_at"] = datetime.now().isoformat()

    # Create session with shared meet link
    meet_link = _generate_meet_link()
    session = {
        "id": f"msess_{uuid.uuid4().hex[:6]}",
        "request_id": request_id,
        "offering_id": req["offering_id"],
        "student_id": req["student_id"],
        "alumni_id": req["alumni_id"],
        "topic": req["topic"],
        "duration": req["duration"],
        "status": "scheduled",
        "scheduled_at": (datetime.now() + timedelta(days=7)).isoformat(),
        "alumni_completed": False,
        "student_completed": False,
        "completed_at": None,
        "meet_link": meet_link,
        "created_at": datetime.now().isoformat(),
    }
    MOCK_SESSIONS.append(session)
    return {"request": _enrich_request(req), "session": _enrich_session(session)}


@mentorship_router.post("/requests/{request_id}/reject")
def reject_request(request_id: str, body: AcceptRejectBody):
    """Alumni rejects a mentorship request."""
    req = next((r for r in MOCK_REQUESTS if r["id"] == request_id), None)
    if not req:
        raise HTTPException(404, "Request not found")
    if req["alumni_id"] != body.user_id:
        raise HTTPException(403, "Not authorized")
    if req["status"] != "pending":
        raise HTTPException(400, f"Cannot reject a {req['status']} request")

    req["status"] = "rejected"
    req["responded_at"] = datetime.now().isoformat()
    return _enrich_request(req)


@mentorship_router.post("/requests/{request_id}/cancel")
def cancel_request(request_id: str, body: CancelBody):
    """Student cancels a pending request."""
    req = next((r for r in MOCK_REQUESTS if r["id"] == request_id), None)
    if not req:
        raise HTTPException(404, "Request not found")
    if req["student_id"] != body.student_id:
        raise HTTPException(403, "Not authorized")
    if req["status"] != "pending":
        raise HTTPException(400, "Only pending requests can be cancelled")

    req["status"] = "cancelled"
    req["responded_at"] = datetime.now().isoformat()
    return _enrich_request(req)


# =============================================================================
# SESSION endpoints
# =============================================================================

@mentorship_router.get("/sessions/student")
def student_sessions(student_id: str = "student_001"):
    """Student's mentorship sessions."""
    sessions = [s for s in MOCK_SESSIONS if s["student_id"] == student_id]
    sessions.sort(key=lambda s: s["created_at"], reverse=True)
    return [_enrich_session(s) for s in sessions]


@mentorship_router.get("/sessions/alumni")
def alumni_sessions(alumni_id: str = "alumni_001"):
    """Alumni's mentorship sessions."""
    sessions = [s for s in MOCK_SESSIONS if s["alumni_id"] == alumni_id]
    sessions.sort(key=lambda s: s["created_at"], reverse=True)
    return [_enrich_session(s) for s in sessions]


@mentorship_router.post("/sessions/{session_id}/complete-alumni")
def alumni_complete_session(session_id: str, body: CompleteBody):
    """Alumni marks session as completed (first step of dual completion)."""
    session = next((s for s in MOCK_SESSIONS if s["id"] == session_id), None)
    if not session:
        raise HTTPException(404, "Session not found")
    if session["alumni_id"] != body.user_id:
        raise HTTPException(403, "Not authorized")
    if session["status"] not in ["scheduled", "awaiting_completion"]:
        raise HTTPException(400, f"Cannot complete a {session['status']} session")

    session["alumni_completed"] = True
    session["status"] = "awaiting_completion"

    # If both sides completed
    if session["alumni_completed"] and session["student_completed"]:
        session["status"] = "completed"
        session["completed_at"] = datetime.now().isoformat()

    return _enrich_session(session)


@mentorship_router.post("/sessions/{session_id}/complete-student")
def student_complete_session(session_id: str, body: CompleteBody):
    """Student confirms session completion (requires alumni to mark first)."""
    session = next((s for s in MOCK_SESSIONS if s["id"] == session_id), None)
    if not session:
        raise HTTPException(404, "Session not found")
    if session["student_id"] != body.user_id:
        raise HTTPException(403, "Not authorized")
    if not session["alumni_completed"]:
        raise HTTPException(400, "Alumni must mark completion first before student can confirm")
    if session["student_completed"]:
        raise HTTPException(400, "You have already confirmed completion")

    session["student_completed"] = True
    session["status"] = "completed"
    session["completed_at"] = datetime.now().isoformat()
    return _enrich_session(session)
