# Student Information System (SIS)

A full-stack web application that digitizes and centralizes academic operations for a university — from student enrollment and grade management to faculty scheduling and departmental administration.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features by Role](#features-by-role)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Seed Data](#seed-data)
- [API Overview](#api-overview)
- [User Roles & Access](#user-roles--access)

---

## Overview

The SIS is designed to serve four distinct user roles — **Admin**, **Registrar**, **Faculty**, and **Student** — each with a dedicated interface and permission set. The system handles the full academic lifecycle: managing departments, majors, courses, class sections, student enrollment, and grade posting.

---

## Tech Stack

| Layer     | Technology                                                          |
|-----------|---------------------------------------------------------------------|
| Frontend  | React 19, Vite, Tailwind CSS, Axios, React Router v7, Lucide React |
| Backend   | Python 3, FastAPI 0.111, Uvicorn                                    |
| ORM / DB  | SQLAlchemy 2, psycopg2-binary, PostgreSQL                           |
| Auth      | JWT (python-jose), bcrypt / passlib                                 |
| Utilities | pydantic v2, python-dotenv, date-fns, xlsx                          |

---

## Features by Role

### Admin
| Page | Capabilities |
|---|---|
| Dashboard | System-wide stats overview |
| Users | Create, edit, delete all user accounts |
| Students | Full CRUD — view profile, academic standing, GPA, enrollment history |
| Faculty | Full CRUD — view profile, department, office, assigned sections |
| Departments | Create, edit, delete departments |
| Majors | Create, edit, delete majors linked to departments |
| Semesters | Create and manage semesters; set current semester |
| Courses | Full CRUD on the course catalog |
| Sections | Schedule class sections per course per semester |
| Enrollments | Enroll/drop students into sections; manage enrollment status |
| Grades | View and post grades across all sections and semesters |
| Reports | Academic reports with 4 tabs: Enrollment, GPA, Grades, Section Capacity |

### Faculty
| Page | Capabilities |
|---|---|
| Dashboard | Overview of assigned courses and schedule |
| My Courses | View all sections assigned to the logged-in faculty |
| My Schedule | Weekly schedule view of teaching assignments |
| Grade Management | Post and update grades for students in owned sections |
| Student Requests | View and respond to student-related requests |

### Student
| Page | Capabilities |
|---|---|
| Dashboard | GPA, credit summary, current enrollment status |
| My Enrollments | View current and past enrollments with section details |
| My Grades | View posted grades by semester |
| Course Catalog | Browse all available courses and sections |
| My Profile | View personal academic profile |

---

## Project Structure

```
/
├── sis_schema_v2.sql          # Clean PostgreSQL schema (current)
├── sis_schema.sql             # Original draft schema
├── Back-End-Python/           # FastAPI backend
│   ├── main.py                # App entry point, router registration
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── database.py        # SQLAlchemy engine + session
│       ├── dependencies/
│       │   └── auth.py        # JWT authentication + role guards
│       ├── routers/           # 12 API routers (one per resource)
│       ├── services/          # Business logic layer
│       └── utils/
│           └── mappers.py     # Row-to-dict helpers
├── Front-End/                 # React + Vite frontend
│   └── src/
│       ├── App.jsx            # Route definitions
│       ├── pages/
│       │   ├── admin/         # 12 admin page groups
│       │   ├── faculty/       # 5 faculty pages
│       │   ├── student/       # 5 student pages
│       │   └── auth/          # Login, forgot/reset/change password
│       ├── components/
│       │   ├── layout/        # AdminLayout, FacultyLayout, StudentLayout
│       │   ├── auth/          # ProtectedRoute
│       │   ├── shared/        # Reusable components
│       │   └── ui/            # Base UI components (Badge, Button, Card, etc.)
│       ├── services/          # Axios API service modules
│       └── context/
│           └── ThemeContext.jsx
└── Back-End/
    └── sql/
        ├── seed_catalog.sql             # Departments, majors, courses
        ├── seed_students_faculty.sql    # 25 students, 10 faculty, 3 semesters, grades
        └── seed_demo.sql               # Minimal 5-record demo seed (self-contained)
```

---

## Database Schema

11 tables — see [`sis_schema_v2.sql`](sis_schema_v2.sql) for the full definition.

```
users
 ├── faculty          → department, title, office
 └── students         → major, advisor, GPA, standing

departments
 └── majors           → required_credits

courses              → department

semesters
 └── class_sections   → course, faculty, schedule, capacity
      └── enrollments → student
           └── grades → semester, posted_by

degree_requirements  → major + course mapping
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### 1. Database
```sql
-- Create the database
CREATE DATABASE "DBMS";
```
```bash
-- Run the schema
psql -U postgres -d DBMS -f sis_schema_v2.sql

-- Load seed data (run in order)
psql -U postgres -d DBMS -f Back-End/sql/seed_catalog.sql
psql -U postgres -d DBMS -f Back-End/sql/seed_students_faculty.sql
```

### 2. Backend
```bash
cd Back-End-Python

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DB_PASSWORD and JWT_SECRET

# Start the server
uvicorn main:app --reload --port 5002
```

API docs available at: `http://localhost:5002/api/docs`

### 3. Frontend
```bash
cd Front-End
npm install
npm run dev
```

App available at: `http://localhost:5173`

---

## Seed Data

| File | Contents |
|---|---|
| `seed_catalog.sql` | 3 departments, 8 majors, 52 courses |
| `seed_students_faculty.sql` | 10 faculty, 25 students, 3 semesters, 36 sections, ~200 enrollments, full grades |
| `seed_demo.sql` | Self-contained minimal demo: 5 of everything, Fall 2025 only |

**Default password for all seed accounts:** `password123`

Sample login credentials:

| Role | Email | Password |
|---|---|---|
| Admin | *(create manually or via psql)* | — |
| Faculty | `james.morrison@university.edu` | `password123` |
| Student | `alex.johnson@university.edu` | `password123` |

---

## API Overview

All endpoints are prefixed with `/api`. Interactive documentation: `http://localhost:5002/api/docs`

| Prefix | Resource |
|---|---|
| `/api/auth` | Login, token refresh, change password |
| `/api/users` | User management |
| `/api/students` | Student profiles |
| `/api/faculty` | Faculty profiles |
| `/api/departments` | Department management |
| `/api/majors` | Major management |
| `/api/courses` | Course catalog |
| `/api/semesters` | Semester management |
| `/api/sections` | Class sections |
| `/api/enrollments` | Student enrollments |
| `/api/grades` | Grade posting and retrieval |
| `/api/degree-requirements` | Major-to-course requirement mapping |

---

## User Roles & Access

| Role | Access Level |
|---|---|
| `admin` | Full access to all resources and all admin pages |
| `registrar` | Read/write access to enrollments, students, and grades |
| `faculty` | Read own sections, post grades for own students |
| `student` | Read own profile, enrollments, and grades |

Authentication uses **JWT Bearer tokens** with an 8-hour expiry. Role enforcement is applied at the API layer via dependency injection on every protected route.
