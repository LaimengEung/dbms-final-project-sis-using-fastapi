"""
FastAPI Student Information System — Python Back-End
Mirrors the Express.js SIS backend exactly.
Run with: uvicorn main:app --reload --port 5002
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth,
    courses,
    degree_requirements,
    departments,
    enrollments,
    faculty,
    grades,
    majors,
    sections,
    semesters,
    students,
    users,
)

load_dotenv()

app = FastAPI(
    title="SIS API (Python / FastAPI)",
    description="Student Information System — Python backend mirroring the Node.js/Express implementation.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ── CORS ────────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(faculty.router)
app.include_router(users.router)
app.include_router(courses.router)
app.include_router(semesters.router)
app.include_router(enrollments.router)
app.include_router(grades.router)
app.include_router(sections.router)
app.include_router(majors.router)
app.include_router(departments.router)
app.include_router(degree_requirements.router)


# ── Health endpoints ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "SIS Python API"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
