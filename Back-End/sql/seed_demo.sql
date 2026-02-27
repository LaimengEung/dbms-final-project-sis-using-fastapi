-- =============================================================================
-- seed_demo.sql
-- Minimal demo seed: 3 departments, 5 majors, 5 courses, 5 faculty,
-- 5 students, 1 semester, 5 sections, enrollments, and grades.
--
-- Self-contained — no dependency on seed_catalog.sql.
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING).
-- Password  : password123
-- Bcrypt    : $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em
-- Run with  : psql -U postgres -d DBMS -f seed_demo.sql
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- DEPARTMENTS  (3)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO departments (department_code, department_name, description) VALUES
  ('CS',  'Computer Science', 'Covers algorithms, software engineering, AI, and systems programming.'),
  ('LAW', 'Law',              'Covers legal theory, constitutional law, contracts, and litigation.'),
  ('BUS', 'Business',         'Covers management, finance, marketing, and entrepreneurship.')
ON CONFLICT (department_code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- MAJORS  (5)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO majors (major_code, major_name, department_id, required_credits, description)
SELECT t.code, t.name, d.department_id, t.cr::INTEGER, t.desc
FROM (VALUES
  ('CS-BS',  'Computer Science',         'CS',  120, 'Bachelor of Science in Computer Science.'),
  ('CS-SE',  'Software Engineering',     'CS',  120, 'Bachelor of Science in Software Engineering.'),
  ('LAW-JD', 'Juris Doctor (JD)',        'LAW', 90,  'Professional law degree (J.D.) program.'),
  ('BUS-BA', 'Business Administration',  'BUS', 120, 'Bachelor of Science in Business Administration.'),
  ('BUS-FIN','Finance',                  'BUS', 120, 'Bachelor of Science in Finance.')
) AS t(code, name, dept_code, cr, desc)
JOIN departments d ON d.department_code = t.dept_code
ON CONFLICT (major_code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- COURSES  (5)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO courses (course_code, course_name, description, credits, department_id)
SELECT t.code, t.name, t.desc, t.cr::INTEGER, d.department_id
FROM (VALUES
  ('CS101',  'Introduction to Computer Science', 'Fundamental concepts of programming and computational thinking.', 3, 'CS'),
  ('CS201',  'Programming II',                   'Object-oriented programming and data structures using Java.',     3, 'CS'),
  ('LAW101', 'Legal Foundations',                'Introduction to legal systems, reasoning, and core principles.', 3, 'LAW'),
  ('BUS101', 'Business Principles',              'Core concepts in business organization and management.',          3, 'BUS'),
  ('BUS201', 'Financial Accounting',             'Fundamentals of financial statements and reporting.',            3, 'BUS')
) AS t(code, name, desc, cr, dept_code)
JOIN departments d ON d.department_code = t.dept_code
ON CONFLICT (course_code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- SEMESTER  (1 — Fall 2025, current)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO semesters (semester_name, semester_year, start_date, end_date,
                       registration_start, registration_end, is_current)
VALUES ('Fall', 2025, '2025-08-20', '2025-12-20', '2025-06-01', '2025-08-10', true)
ON CONFLICT (semester_name, semester_year) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- FACULTY USERS  (5)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO users (email, password_hash, role, first_name, last_name, is_active) VALUES
  ('john.smith@university.edu',   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'John',  'Smith',   true),
  ('anna.lee@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'Anna',  'Lee',     true),
  ('henry.adams@university.edu',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'Henry', 'Adams',   true),
  ('diana.cruz@university.edu',   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'Diana', 'Cruz',    true),
  ('peter.nguyen@university.edu', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'Peter', 'Nguyen',  true)
ON CONFLICT (email) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- FACULTY RECORDS  (5)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO faculty (user_id, faculty_number, department_id, title, office_location)
SELECT u.user_id, t.fnum, d.department_id, t.title, t.office
FROM (VALUES
  ('john.smith@university.edu',   'FAC001', 'CS',  'Professor',           'CS Building 101'),
  ('anna.lee@university.edu',     'FAC002', 'CS',  'Associate Professor', 'CS Building 102'),
  ('henry.adams@university.edu',  'FAC003', 'LAW', 'Professor',           'Law Hall 201'),
  ('diana.cruz@university.edu',   'FAC004', 'BUS', 'Professor',           'Business Center 301'),
  ('peter.nguyen@university.edu', 'FAC005', 'BUS', 'Associate Professor', 'Business Center 302')
) AS t(email, fnum, dept_code, title, office)
JOIN users u ON u.email = t.email
JOIN departments d ON d.department_code = t.dept_code
ON CONFLICT (faculty_number) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- STUDENT USERS  (5)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO users (email, password_hash, role, first_name, last_name, is_active) VALUES
  ('alice.brown@university.edu',   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Alice',  'Brown',    true),
  ('bob.wilson@university.edu',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Bob',    'Wilson',   true),
  ('carol.davis@university.edu',   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Carol',  'Davis',    true),
  ('david.kim@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'David',  'Kim',      true),
  ('eva.martinez@university.edu',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Eva',    'Martinez', true)
ON CONFLICT (email) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- STUDENT RECORDS  (5)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO students
  (user_id, student_number, classification, major_id,
   admission_date, credits_earned, gpa, academic_standing, advisor_id)
SELECT u.user_id, t.snum, t.class, m.major_id,
       t.admit::DATE, t.cr::INTEGER, t.gpa::NUMERIC(3,2), t.standing, f.faculty_id
FROM (VALUES
  -- email                          snum     class        major      admit          cr   gpa   standing  advisor
  ('alice.brown@university.edu',  'STU001', 'senior',    'CS-BS',  '2021-08-20', 105, 3.80, 'good',   'FAC001'),
  ('bob.wilson@university.edu',   'STU002', 'sophomore', 'CS-SE',  '2023-08-20',  36, 3.10, 'good',   'FAC002'),
  ('carol.davis@university.edu',  'STU003', 'junior',    'LAW-JD', '2022-08-20',  60, 3.50, 'good',   'FAC003'),
  ('david.kim@university.edu',    'STU004', 'senior',    'BUS-FIN','2021-08-20',  98, 2.75, 'good',   'FAC004'),
  ('eva.martinez@university.edu', 'STU005', 'freshman',  'BUS-BA', '2024-08-20',  15, 3.90, 'good',   'FAC005')
) AS t(email, snum, class, major_code, admit, cr, gpa, standing, fac_num)
JOIN users u ON u.email = t.email
JOIN majors m ON m.major_code = t.major_code
JOIN faculty f ON f.faculty_number = t.fac_num
ON CONFLICT (student_number) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- CLASS SECTIONS  (5 — one per course, Fall 2025)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO class_sections
  (csn, course_id, semester_id, section_number, faculty_id,
   classroom, schedule, start_date, end_date, max_capacity, enrolled_count, status)
SELECT t.csn, c.course_id, sem.semester_id, '001', f.faculty_id,
       t.room, t.sched, '2025-08-25', '2025-12-12', t.cap::INTEGER, 0, 'open'
FROM (VALUES
  ('D0001', 'CS101',  'FAC001', 'CS-101',  'Mon/Wed 09:00-10:15',     30),
  ('D0002', 'CS201',  'FAC002', 'CS-102',  'Tue/Thu 10:30-11:45',     25),
  ('D0003', 'LAW101', 'FAC003', 'LAW-101', 'Mon/Wed 13:00-14:15',     35),
  ('D0004', 'BUS101', 'FAC004', 'BUS-101', 'Mon/Wed/Fri 10:00-10:50', 40),
  ('D0005', 'BUS201', 'FAC005', 'BUS-201', 'Tue/Thu 13:00-14:15',     30)
) AS t(csn, course_code, fac_num, room, sched, cap)
JOIN courses c ON c.course_code = t.course_code
JOIN semesters sem ON sem.semester_name = 'Fall' AND sem.semester_year = 2025
JOIN faculty f ON f.faculty_number = t.fac_num
ON CONFLICT (csn) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- ENROLLMENTS  (2 sections per student = 10 enrollments)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO enrollments (student_id, section_id, enrollment_date, status)
SELECT s.student_id, cs.section_id, '2025-08-20 08:00:00', 'enrolled'
FROM (VALUES
  ('STU001', 'D0001'), ('STU001', 'D0002'),   -- Alice: CS intro + CS201
  ('STU002', 'D0001'), ('STU002', 'D0002'),   -- Bob: CS intro + CS201
  ('STU003', 'D0003'), ('STU003', 'D0004'),   -- Carol: LAW101 + BUS elective
  ('STU004', 'D0004'), ('STU004', 'D0005'),   -- David: BUS101 + BUS201
  ('STU005', 'D0004'), ('STU005', 'D0003')    -- Eva: BUS101 + LAW elective
) AS t(snum, csn)
JOIN students s ON s.student_number = t.snum
JOIN class_sections cs ON cs.csn = t.csn
ON CONFLICT (student_id, section_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- GRADES  (midterm grades posted for enrolled students)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO grades
  (enrollment_id, letter_grade, numeric_grade, grade_points,
   semester_id, posted_date, posted_by)
SELECT e.enrollment_id, t.lg, t.ng::NUMERIC(5,2), t.gp::NUMERIC(3,2),
       sem.semester_id, '2025-10-20 12:00:00', u.user_id
FROM (VALUES
  ('STU001', 'D0001', 'A',  95.0, 4.0),
  ('STU001', 'D0002', 'A-', 92.0, 3.7),
  ('STU002', 'D0001', 'B+', 88.0, 3.3),
  ('STU002', 'D0002', 'B',  84.0, 3.0),
  ('STU003', 'D0003', 'A-', 91.0, 3.7),
  ('STU003', 'D0004', 'B+', 87.0, 3.3),
  ('STU004', 'D0004', 'B',  84.0, 3.0),
  ('STU004', 'D0005', 'B+', 86.0, 3.3),
  ('STU005', 'D0004', 'A',  96.0, 4.0),
  ('STU005', 'D0003', 'A-', 90.0, 3.7)
) AS t(snum, csn, lg, ng, gp)
JOIN students s ON s.student_number = t.snum
JOIN class_sections cs ON cs.csn = t.csn
JOIN enrollments e ON e.student_id = s.student_id AND e.section_id = cs.section_id
JOIN semesters sem ON sem.semester_name = 'Fall' AND sem.semester_year = 2025
JOIN faculty f ON f.faculty_id = cs.faculty_id
JOIN users u ON u.user_id = f.user_id;

-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE enrolled_count
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE class_sections cs
SET enrolled_count = (
    SELECT COUNT(*)
    FROM enrollments e
    WHERE e.section_id = cs.section_id
      AND e.status IN ('enrolled', 'completed')
);

COMMIT;

-- =============================================================================
-- Summary
-- =============================================================================
-- Departments : 3  (CS, LAW, BUS)
-- Majors      : 5  (CS-BS, CS-SE, LAW-JD, BUS-BA, BUS-FIN)
-- Courses     : 5  (CS101, CS201, LAW101, BUS101, BUS201)
-- Semester    : 1  (Fall 2025 — current)
-- Faculty     : 5  (FAC001-FAC005 — 2 CS, 1 LAW, 2 BUS)
-- Students    : 5  (STU001-STU005 — 2 CS, 1 LAW, 2 BUS)
--              senior × 2, junior × 1, sophomore × 1, freshman × 1
--              GPA range: 2.75 – 3.90  |  all good standing
-- Sections    : 5  (D0001-D0005, one per course)
-- Enrollments : 10 (2 per student)
-- Grades      : 10 (midterm grades for all enrollments)
-- Password    : password123
-- =============================================================================
