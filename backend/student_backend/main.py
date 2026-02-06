# =============================================
# AfterGrad — Student Backend (FastAPI)
# =============================================
#
# Features:
#   - Events API (create, list, manage, location access)
#   - Mentorship API (offerings, requests, sessions)
#
# Run:
#   cd backend/student_backend
#   pip install -r requirements.txt
#   uvicorn main:app --reload --port 8001
# =============================================

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from events_api import events_router
from mentorship_api import mentorship_router

app = FastAPI(title="AfterGrad Student Backend", version="1.0.0")

# -- CORS for React frontend --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -- Mount Events API router --------------------------------------------------
app.include_router(events_router)

# -- Mount Mentorship API router -----------------------------------------------
app.include_router(mentorship_router)


# =============================================================================
# Health check
# =============================================================================

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "aftergrad-student-backend"}
