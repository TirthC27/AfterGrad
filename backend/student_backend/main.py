# =============================================
# AfterGrad — Backend (FastAPI)
# =============================================
#
# Single server: API + both React frontends
#
# Run:
#   cd backend/student_backend
#   pip install -r requirements.txt
#   uvicorn main:app --reload --port 8001
# =============================================

import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from events_api import events_router
from mentorship_api import mentorship_router
from auth_api import auth_router
from resume_api import resume_router
from profile_api import profile_router
from donations_api import donations_router
from gigs_api import gigs_router
from invitations_api import invitations_router
from onboarding_api import onboarding_router

app = FastAPI(title="AfterGrad Backend", version="2.0.0")

# -- CORS (keep for dev mode) -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- Mount API routers ---------------------------------------------------------
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(resume_router)
app.include_router(events_router)
app.include_router(mentorship_router)
app.include_router(donations_router)
app.include_router(gigs_router)
app.include_router(invitations_router)
app.include_router(onboarding_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "aftergrad-backend"}


# -- Serve built React frontends ----------------------------------------------
# Paths relative to this file (backend/student_backend/)
_THIS_DIR = Path(__file__).resolve().parent
STUDENT_DIST = _THIS_DIR / ".." / ".." / "frontend" / "student_frontend" / "dist"
ALUMNI_DIST = _THIS_DIR / ".." / ".." / "frontend" / "alumni_frontend" / "dist"

# Alumni frontend at /alumni/  (mounted first so it takes priority)
if ALUMNI_DIST.is_dir():
    # Serve alumni static assets (js, css, images)
    app.mount("/alumni/assets", StaticFiles(directory=str(ALUMNI_DIST / "assets")), name="alumni-assets")

    @app.get("/alumni/{rest_of_path:path}")
    async def serve_alumni_spa(request: Request, rest_of_path: str = ""):
        # Try to serve the exact static file first
        file_path = ALUMNI_DIST / rest_of_path
        if rest_of_path and file_path.is_file():
            return FileResponse(str(file_path))
        # Otherwise always return index.html (SPA client-side routing)
        return FileResponse(str(ALUMNI_DIST / "index.html"))

    @app.get("/alumni")
    async def serve_alumni_root():
        return FileResponse(str(ALUMNI_DIST / "index.html"))

# Student frontend at /  (catch-all, must be last)
if STUDENT_DIST.is_dir():
    # Serve student static assets
    app.mount("/assets", StaticFiles(directory=str(STUDENT_DIST / "assets")), name="student-assets")

    @app.get("/{rest_of_path:path}")
    async def serve_student_spa(request: Request, rest_of_path: str = ""):
        # Don't intercept /api or /alumni routes
        if rest_of_path.startswith("api/") or rest_of_path.startswith("alumni"):
            return
        file_path = STUDENT_DIST / rest_of_path
        if rest_of_path and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(STUDENT_DIST / "index.html"))
