-- =============================================================================
-- sis_schema_v2.sql
-- Student Information System — PostgreSQL Schema
-- Reflects all features currently implemented in the application.
--
-- Run with: psql -U postgres -d DBMS -f sis_schema_v2.sql
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS & AUTHENTICATION
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE users (
    user_id        SERIAL PRIMARY KEY,
    email          VARCHAR(100) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    role           VARCHAR(20) NOT NULL
                       CHECK (role IN ('student', 'faculty', 'admin', 'registrar')),
    first_name     VARCHAR(50) NOT NULL,
    last_name      VARCHAR(50) NOT NULL,
    is_active      BOOLEAN DEFAULT true,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- DEPARTMENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE departments (
    department_id    SERIAL PRIMARY KEY,
    department_code  VARCHAR(10) UNIQUE NOT NULL,
    department_name  VARCHAR(100) NOT NULL,
    description      TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- MAJORS / PROGRAMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE majors (
    major_id          SERIAL PRIMARY KEY,
    major_code        VARCHAR(10) UNIQUE NOT NULL,
    major_name        VARCHAR(100) NOT NULL,
    department_id     INTEGER REFERENCES departments(department_id),
    required_credits  INTEGER NOT NULL,
    description       TEXT
);

-- ─────────────────────────────────────────────────────────────────────────────
-- FACULTY
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE faculty (
    faculty_id        SERIAL PRIMARY KEY,
    user_id           INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    faculty_number    VARCHAR(20) UNIQUE NOT NULL,
    department_id     INTEGER REFERENCES departments(department_id),
    title             VARCHAR(50),
    office_location   VARCHAR(100)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- STUDENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE students (
    student_id          SERIAL PRIMARY KEY,
    user_id             INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    student_number      VARCHAR(20) UNIQUE NOT NULL,
    classification      VARCHAR(20) CHECK (classification IN ('freshman', 'sophomore', 'junior', 'senior')),
    major_id            INTEGER REFERENCES majors(major_id),
    admission_date      DATE,
    credits_earned      INTEGER DEFAULT 0,
    gpa                 DECIMAL(3,2) DEFAULT 0.00,
    academic_standing   VARCHAR(20) DEFAULT 'good',
    advisor_id          INTEGER REFERENCES faculty(faculty_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- COURSES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE courses (
    course_id    SERIAL PRIMARY KEY,
    course_code  VARCHAR(20) UNIQUE NOT NULL,
    course_name  VARCHAR(200) NOT NULL,
    description  TEXT,
    credits      INTEGER NOT NULL,
    department_id INTEGER REFERENCES departments(department_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- SEMESTERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE semesters (
    semester_id         SERIAL PRIMARY KEY,
    semester_name       VARCHAR(50) NOT NULL,
    semester_year       INTEGER NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    registration_start  DATE,
    registration_end    DATE,
    is_current          BOOLEAN DEFAULT false,
    UNIQUE (semester_name, semester_year)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CLASS SECTIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE class_sections (
    section_id      SERIAL PRIMARY KEY,
    csn             VARCHAR(20) UNIQUE NOT NULL,
    course_id       INTEGER REFERENCES courses(course_id),
    semester_id     INTEGER REFERENCES semesters(semester_id),
    section_number  VARCHAR(10) NOT NULL,
    faculty_id      INTEGER REFERENCES faculty(faculty_id),
    classroom       VARCHAR(50),
    schedule        VARCHAR(100),
    start_date      DATE,
    end_date        DATE,
    max_capacity    INTEGER DEFAULT 30,
    enrolled_count  INTEGER DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'open'
                        CHECK (status IN ('open', 'closed', 'cancelled'))
);

-- ─────────────────────────────────────────────────────────────────────────────
-- ENROLLMENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE enrollments (
    enrollment_id    SERIAL PRIMARY KEY,
    student_id       INTEGER REFERENCES students(student_id),
    section_id       INTEGER REFERENCES class_sections(section_id),
    enrollment_date  TIMESTAMP DEFAULT LOCALTIMESTAMP,
    status           VARCHAR(20) DEFAULT 'enrolled'
                         CHECK (status IN ('enrolled', 'dropped', 'withdrawn', 'completed')),
    UNIQUE (student_id, section_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- GRADES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE grades (
    grade_id       SERIAL PRIMARY KEY,
    enrollment_id  INTEGER REFERENCES enrollments(enrollment_id),
    letter_grade   VARCHAR(2),
    numeric_grade  DECIMAL(5,2),
    grade_points   DECIMAL(3,2),
    semester_id    INTEGER REFERENCES semesters(semester_id),
    posted_date    TIMESTAMP,
    posted_by      INTEGER REFERENCES users(user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- DEGREE REQUIREMENTS
-- Maps majors to their required, elective, and general education courses.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE degree_requirements (
    requirement_id    SERIAL PRIMARY KEY,
    major_id          INTEGER REFERENCES majors(major_id),
    course_id         INTEGER REFERENCES courses(course_id),
    requirement_type  VARCHAR(20) CHECK (requirement_type IN ('major', 'elective', 'ge')),
    is_required       BOOLEAN DEFAULT true,
    credits           INTEGER
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_students_user_id        ON students(user_id);
CREATE INDEX idx_faculty_user_id         ON faculty(user_id);
CREATE INDEX idx_faculty_department      ON faculty(department_id);
CREATE INDEX idx_students_major          ON students(major_id);
CREATE INDEX idx_sections_course         ON class_sections(course_id);
CREATE INDEX idx_sections_semester       ON class_sections(semester_id);
CREATE INDEX idx_sections_faculty        ON class_sections(faculty_id);
CREATE INDEX idx_enrollments_student     ON enrollments(student_id);
CREATE INDEX idx_enrollments_section     ON enrollments(section_id);
CREATE INDEX idx_grades_enrollment       ON grades(enrollment_id);
CREATE INDEX idx_grades_semester         ON grades(semester_id);
CREATE INDEX idx_degree_req_major        ON degree_requirements(major_id);

-- =============================================================================
-- Tables            : 11
-- users             : authentication and role management
-- departments       : CS, LAW, BUS, etc.
-- majors            : programs under each department
-- faculty           : faculty profiles linked to users
-- students          : student profiles linked to users
-- courses           : course catalog
-- semesters         : academic terms
-- class_sections    : scheduled offerings of a course in a semester
-- enrollments       : student registrations in sections
-- grades            : letter/numeric/grade-point records per enrollment
-- degree_requirements    : major → course requirement mapping
-- =============================================================================
