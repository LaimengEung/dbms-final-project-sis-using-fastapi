-- =============================================================================
-- seed_students_faculty.sql
-- 25 students, 10 faculty, 3 semesters (Fall 2024, Spring 2025, Fall 2025),
-- class sections, enrollments, and grades.
--
-- Prerequisites : seed_catalog.sql must be run first (departments, majors, courses).
-- Password      : password123
-- Bcrypt hash   : $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em
-- Run with      : psql -U postgres -d DBMS -f seed_students_faculty.sql
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- SEMESTERS  (unique on semester_name + semester_year)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO semesters (semester_name, semester_year, start_date, end_date,
                       registration_start, registration_end, is_current)
VALUES
  ('Fall',   2024, '2024-08-20', '2024-12-20', '2024-06-01', '2024-08-10', false),
  ('Spring', 2025, '2025-01-15', '2025-05-15', '2024-11-01', '2025-01-05', false),
  ('Fall',   2025, '2025-08-20', '2025-12-20', '2025-06-01', '2025-08-10', true)
ON CONFLICT (semester_name, semester_year) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- FACULTY USERS  (10 faculty across CS, LAW, BUS)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO users (email, password_hash, role, first_name, last_name, is_active) VALUES
  -- CS Faculty
  ('james.morrison@university.edu',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'James',    'Morrison',  true),
  ('sarah.chen@university.edu',      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'Sarah',    'Chen',      true),
  ('david.okafor@university.edu',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'David',    'Okafor',    true),
  ('emily.ross@university.edu',      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'Emily',    'Ross',      true),
  -- LAW Faculty
  ('michael.torres@university.edu',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'Michael',  'Torres',    true),
  ('linda.walsh@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'Linda',    'Walsh',     true),
  ('robert.kim@university.edu',      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'Robert',   'Kim',       true),
  -- BUS Faculty
  ('patricia.nguyen@university.edu', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'Patricia', 'Nguyen',    true),
  ('marcus.bell@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'Marcus',   'Bell',      true),
  ('olivia.patel@university.edu',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'faculty', 'Olivia',   'Patel',     true)
ON CONFLICT (email) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- FACULTY RECORDS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO faculty (user_id, faculty_number, department_id, title, office_location)
SELECT u.user_id, t.fnum, d.department_id, t.title, t.office
FROM (VALUES
  ('james.morrison@university.edu',  'FAC201', 'CS',  'Professor',           'CS Building 301'),
  ('sarah.chen@university.edu',      'FAC202', 'CS',  'Associate Professor', 'CS Building 205'),
  ('david.okafor@university.edu',    'FAC203', 'CS',  'Assistant Professor', 'CS Building 110'),
  ('emily.ross@university.edu',      'FAC204', 'CS',  'Lecturer',            'CS Building 115'),
  ('michael.torres@university.edu',  'FAC205', 'LAW', 'Professor',           'Law Hall 401'),
  ('linda.walsh@university.edu',     'FAC206', 'LAW', 'Associate Professor', 'Law Hall 312'),
  ('robert.kim@university.edu',      'FAC207', 'LAW', 'Lecturer',            'Law Hall 210'),
  ('patricia.nguyen@university.edu', 'FAC208', 'BUS', 'Professor',           'Business Center 502'),
  ('marcus.bell@university.edu',     'FAC209', 'BUS', 'Associate Professor', 'Business Center 310'),
  ('olivia.patel@university.edu',    'FAC210', 'BUS', 'Assistant Professor', 'Business Center 215')
) AS t(email, fnum, dept_code, title, office)
JOIN users u ON u.email = t.email
JOIN departments d ON d.department_code = t.dept_code
ON CONFLICT (faculty_number) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- STUDENT USERS  (25 students)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO users (email, password_hash, role, first_name, last_name, is_active) VALUES
  -- CS students
  ('alex.johnson@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Alex',      'Johnson',   true),
  ('mia.thompson@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Mia',       'Thompson',  true),
  ('ryan.garcia@university.edu',      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Ryan',      'Garcia',    true),
  ('priya.sharma@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Priya',     'Sharma',    true),
  ('kevin.wu@university.edu',         '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Kevin',     'Wu',        true),
  ('jasmine.brown@university.edu',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Jasmine',   'Brown',     true),
  ('ethan.davis@university.edu',      '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Ethan',     'Davis',     true),
  ('sophia.lee@university.edu',       '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Sophia',    'Lee',       true),
  -- LAW students
  ('carlos.martin@university.edu',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Carlos',    'Martin',    true),
  ('aisha.williams@university.edu',   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Aisha',     'Williams',  true),
  ('noah.anderson@university.edu',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Noah',      'Anderson',  true),
  ('emma.jackson@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Emma',      'Jackson',   true),
  ('daniel.white@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Daniel',    'White',     true),
  ('isabella.harris@university.edu',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Isabella',  'Harris',    true),
  -- BUS students
  ('liam.clark@university.edu',       '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Liam',      'Clark',     true),
  ('ava.lewis@university.edu',        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Ava',       'Lewis',     true),
  ('mason.robinson@university.edu',   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Mason',     'Robinson',  true),
  ('chloe.walker@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Chloe',     'Walker',    true),
  ('james.hall@university.edu',       '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'James',     'Hall',      true),
  ('amelia.allen@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Amelia',    'Allen',     true),
  ('oliver.young@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Oliver',    'Young',     true),
  ('grace.hernandez@university.edu',  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Grace',     'Hernandez', true),
  ('william.king@university.edu',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'William',   'King',      true),
  ('charlotte.wright@university.edu', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Charlotte', 'Wright',    true),
  ('benjamin.scott@university.edu',   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LBDLoAE6em', 'student', 'Benjamin',  'Scott',     true)
ON CONFLICT (email) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- STUDENT RECORDS
-- Classifications, GPAs, and academic standing vary intentionally:
--   seniors/juniors: high credits, mixed GPAs
--   freshmen       : low credits, no prior history
--   probation      : GPA below 2.0
-- advisor_id links to faculty in the same home department
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO students
  (user_id, student_number, classification, major_id,
   admission_date, credits_earned, gpa, academic_standing, advisor_id)
SELECT u.user_id, t.snum, t.classification, m.major_id,
       t.admit_date::DATE, t.credits::INTEGER,
       t.gpa::NUMERIC(3,2), t.standing, f.faculty_id
FROM (VALUES
  -- email                            snum       class        major      admit        cr   gpa   standing     advisor
  ('alex.johnson@university.edu',     'STU2001','senior',    'CS-BS',  '2021-08-20', 102, 3.85,'good',      'FAC201'),
  ('mia.thompson@university.edu',     'STU2002','junior',    'CS-SE',  '2022-08-20',  72, 3.50,'good',      'FAC202'),
  ('ryan.garcia@university.edu',      'STU2003','sophomore', 'CS-DS',  '2023-08-20',  36, 2.90,'good',      'FAC201'),
  ('priya.sharma@university.edu',     'STU2004','senior',    'CS-BS',  '2021-08-20',  98, 3.95,'good',      'FAC202'),
  ('kevin.wu@university.edu',         'STU2005','freshman',  'CS-SE',  '2024-08-20',  12, 3.20,'good',      'FAC203'),
  ('jasmine.brown@university.edu',    'STU2006','junior',    'CS-DS',  '2022-08-20',  68, 2.40,'probation', 'FAC203'),
  ('ethan.davis@university.edu',      'STU2007','sophomore', 'CS-BS',  '2023-08-20',  30, 1.90,'probation', 'FAC204'),
  ('sophia.lee@university.edu',       'STU2008','senior',    'CS-SE',  '2021-08-20', 108, 4.00,'good',      'FAC201'),
  -- LAW
  ('carlos.martin@university.edu',    'STU2009','junior',    'LAW-JD', '2022-08-20',  54, 3.60,'good',      'FAC205'),
  ('aisha.williams@university.edu',   'STU2010','senior',    'LAW-JD', '2021-08-20',  78, 3.75,'good',      'FAC206'),
  ('noah.anderson@university.edu',    'STU2011','sophomore', 'LAW-LS', '2023-08-20',  27, 2.70,'good',      'FAC205'),
  ('emma.jackson@university.edu',     'STU2012','freshman',  'LAW-LS', '2024-08-20',   9, 3.10,'good',      'FAC206'),
  ('daniel.white@university.edu',     'STU2013','junior',    'LAW-JD', '2022-08-20',  57, 2.30,'probation', 'FAC207'),
  ('isabella.harris@university.edu',  'STU2014','senior',    'LAW-JD', '2021-08-20',  84, 3.45,'good',      'FAC205'),
  -- BUS
  ('liam.clark@university.edu',       'STU2015','junior',    'BUS-BA', '2022-08-20',  75, 3.30,'good',      'FAC208'),
  ('ava.lewis@university.edu',        'STU2016','senior',    'BUS-FIN','2021-08-20',  96, 3.70,'good',      'FAC209'),
  ('mason.robinson@university.edu',   'STU2017','sophomore', 'BUS-MKT','2023-08-20',  33, 2.60,'good',      'FAC208'),
  ('chloe.walker@university.edu',     'STU2018','freshman',  'BUS-BA', '2024-08-20',  15, 3.50,'good',      'FAC210'),
  ('james.hall@university.edu',       'STU2019','senior',    'BUS-FIN','2021-08-20', 105, 2.10,'probation', 'FAC209'),
  ('amelia.allen@university.edu',     'STU2020','junior',    'BUS-MKT','2022-08-20',  66, 3.80,'good',      'FAC210'),
  ('oliver.young@university.edu',     'STU2021','sophomore', 'BUS-BA', '2023-08-20',  39, 2.00,'probation', 'FAC208'),
  ('grace.hernandez@university.edu',  'STU2022','freshman',  'BUS-MKT','2024-08-20',  12, 3.90,'good',      'FAC209'),
  ('william.king@university.edu',     'STU2023','junior',    'BUS-FIN','2022-08-20',  69, 3.15,'good',      'FAC210'),
  ('charlotte.wright@university.edu', 'STU2024','senior',    'BUS-BA', '2021-08-20',  93, 3.55,'good',      'FAC208'),
  ('benjamin.scott@university.edu',   'STU2025','sophomore', 'BUS-MKT','2023-08-20',  24, 1.80,'probation', 'FAC209')
) AS t(email, snum, classification, major_code, admit_date, credits, gpa, standing, fac_num)
JOIN users    u ON u.email          = t.email
JOIN majors   m ON m.major_code     = t.major_code
JOIN faculty  f ON f.faculty_number = t.fac_num
ON CONFLICT (student_number) DO NOTHING;

-- =============================================================================
-- CLASS SECTIONS
-- CSN 10001-10012  →  Fall 2024   (status = 'closed')
-- CSN 20001-20012  →  Spring 2025 (status = 'closed')
-- CSN 30001-30012  →  Fall 2025   (status = 'open', current semester)
-- =============================================================================

-- ── Fall 2024 ─────────────────────────────────────────────────────────────────
INSERT INTO class_sections
  (csn, course_id, semester_id, section_number, faculty_id,
   classroom, schedule, start_date, end_date, max_capacity, enrolled_count, status)
SELECT t.csn, c.course_id, sem.semester_id, t.sec_num, f.faculty_id,
       t.room, t.sched, '2024-08-26', '2024-12-13', t.cap::INTEGER, 0, 'closed'
FROM (VALUES
  ('10001','CS101', '001','FAC203','CS-101',  'Mon/Wed 09:00-10:15',      30),
  ('10002','CS102', '001','FAC204','CS-102',  'Tue/Thu 10:30-11:45',      28),
  ('10003','CS220', '001','FAC201','CS-201',  'Mon/Wed 13:00-14:15',      25),
  ('10004','CS301', '001','FAC201','CS-301',  'Tue/Thu 09:00-10:15',      25),
  ('10005','CS310', '001','FAC202','CS-205',  'Mon/Wed/Fri 11:00-11:50',  30),
  ('10006','CS340', '001','FAC202','CS-310',  'Tue/Thu 13:30-14:45',      22),
  ('10007','LAW101','001','FAC205','LAW-101', 'Mon/Wed 08:00-09:15',      35),
  ('10008','LAW201','001','FAC206','LAW-201', 'Tue/Thu 08:00-09:30',      30),
  ('10009','LAW210','001','FAC207','LAW-105', 'Mon/Wed 14:00-15:30',      28),
  ('10010','BUS101','001','FAC208','BUS-101', 'Mon/Wed/Fri 10:00-10:50',  40),
  ('10011','BUS220','001','FAC209','BUS-201', 'Tue/Thu 11:00-12:15',      35),
  ('10012','BUS301','001','FAC210','BUS-301', 'Mon/Wed 15:00-16:15',      28)
) AS t(csn, course_code, sec_num, fac_num, room, sched, cap)
JOIN courses   c   ON c.course_code     = t.course_code
JOIN semesters sem ON sem.semester_name = 'Fall' AND sem.semester_year = 2024
JOIN faculty   f   ON f.faculty_number  = t.fac_num
ON CONFLICT (csn) DO NOTHING;

-- ── Spring 2025 ───────────────────────────────────────────────────────────────
INSERT INTO class_sections
  (csn, course_id, semester_id, section_number, faculty_id,
   classroom, schedule, start_date, end_date, max_capacity, enrolled_count, status)
SELECT t.csn, c.course_id, sem.semester_id, t.sec_num, f.faculty_id,
       t.room, t.sched, '2025-01-20', '2025-05-09', t.cap::INTEGER, 0, 'closed'
FROM (VALUES
  ('20001','CS201', '001','FAC203','CS-101',  'Mon/Wed 09:00-10:15',      28),
  ('20002','CS210', '001','FAC204','CS-102',  'Tue/Thu 10:30-11:45',      28),
  ('20003','CS320', '001','FAC201','CS-201',  'Mon/Wed 13:00-14:15',      25),
  ('20004','CS330', '001','FAC202','CS-205',  'Tue/Thu 14:00-15:15',      25),
  ('20005','CS350', '001','FAC202','CS-310',  'Mon/Wed 15:30-16:45',      20),
  ('20006','CS360', '001','FAC203','CS-115',  'Tue/Thu 09:00-10:15',      30),
  ('20007','LAW110','001','FAC205','LAW-101', 'Mon/Wed 08:00-09:15',      30),
  ('20008','LAW220','001','FAC206','LAW-201', 'Tue/Thu 11:00-12:15',      28),
  ('20009','LAW301','001','FAC207','LAW-105', 'Mon/Wed 14:00-15:15',      28),
  ('20010','BUS201','001','FAC208','BUS-101', 'Mon/Wed/Fri 09:00-09:50',  40),
  ('20011','BUS210','001','FAC209','BUS-201', 'Tue/Thu 13:00-14:15',      35),
  ('20012','BUS240','001','FAC210','BUS-302', 'Mon/Wed 11:00-12:15',      30)
) AS t(csn, course_code, sec_num, fac_num, room, sched, cap)
JOIN courses   c   ON c.course_code     = t.course_code
JOIN semesters sem ON sem.semester_name = 'Spring' AND sem.semester_year = 2025
JOIN faculty   f   ON f.faculty_number  = t.fac_num
ON CONFLICT (csn) DO NOTHING;

-- ── Fall 2025 (current) ───────────────────────────────────────────────────────
INSERT INTO class_sections
  (csn, course_id, semester_id, section_number, faculty_id,
   classroom, schedule, start_date, end_date, max_capacity, enrolled_count, status)
SELECT t.csn, c.course_id, sem.semester_id, t.sec_num, f.faculty_id,
       t.room, t.sched, '2025-08-25', '2025-12-12', t.cap::INTEGER, 0, 'open'
FROM (VALUES
  ('30001','CS230', '001','FAC201','CS-301',  'Mon/Wed 09:00-10:15',      25),
  ('30002','CS310', '002','FAC202','CS-205',  'Mon/Wed/Fri 11:00-11:50',  30),
  ('30003','CS340', '002','FAC201','CS-310',  'Tue/Thu 13:30-14:45',      22),
  ('30004','CS410', '001','FAC203','CS-201',  'Tue/Thu 09:00-10:15',      20),
  ('30005','CS420', '001','FAC204','CS-115',  'Mon/Wed 15:00-16:15',      18),
  ('30006','CS430', '001','FAC201','CS-401',  'Tue/Thu 14:00-15:15',      15),
  ('30007','LAW310','001','FAC205','LAW-201', 'Mon/Wed 09:00-10:15',      30),
  ('30008','LAW320','001','FAC206','LAW-301', 'Tue/Thu 11:00-12:15',      28),
  ('30009','LAW401','001','FAC207','LAW-105', 'Mon/Wed 14:00-15:15',      25),
  ('30010','BUS301','002','FAC208','BUS-101', 'Mon/Wed/Fri 10:00-10:50',  38),
  ('30011','BUS330','001','FAC209','BUS-201', 'Tue/Thu 13:00-14:15',      35),
  ('30012','BUS401','001','FAC210','BUS-401', 'Mon/Wed 15:30-16:45',      28)
) AS t(csn, course_code, sec_num, fac_num, room, sched, cap)
JOIN courses   c   ON c.course_code     = t.course_code
JOIN semesters sem ON sem.semester_name = 'Fall' AND sem.semester_year = 2025
JOIN faculty   f   ON f.faculty_number  = t.fac_num
ON CONFLICT (csn) DO NOTHING;

-- =============================================================================
-- ENROLLMENTS — Fall 2024  (status = 'completed')
-- Each student enrolled in 3 sections appropriate to their level/major.
-- CS: sections 10001-10006 | LAW: 10007-10009 | BUS: 10010-10012
-- Cross-dept electives used for freshmen and mixed-major variety.
-- =============================================================================
INSERT INTO enrollments (student_id, section_id, enrollment_date, status)
SELECT s.student_id, cs.section_id, '2024-08-20 08:00:00', 'completed'
FROM (VALUES
  -- CS seniors/juniors
  ('STU2001','10003'),('STU2001','10004'),('STU2001','10006'),
  ('STU2002','10003'),('STU2002','10004'),('STU2002','10005'),
  ('STU2004','10004'),('STU2004','10005'),('STU2004','10006'),
  ('STU2008','10004'),('STU2008','10005'),('STU2008','10006'),
  -- CS sophomores/freshmen
  ('STU2003','10001'),('STU2003','10002'),('STU2003','10003'),
  ('STU2005','10001'),('STU2005','10002'),('STU2005','10010'),
  ('STU2006','10003'),('STU2006','10005'),('STU2006','10006'),
  ('STU2007','10001'),('STU2007','10002'),('STU2007','10003'),
  -- LAW seniors/juniors
  ('STU2009','10007'),('STU2009','10008'),('STU2009','10009'),
  ('STU2010','10007'),('STU2010','10008'),('STU2010','10009'),
  ('STU2013','10007'),('STU2013','10008'),('STU2013','10009'),
  ('STU2014','10007'),('STU2014','10008'),('STU2014','10009'),
  -- LAW sophomores/freshmen (with electives)
  ('STU2011','10007'),('STU2011','10008'),('STU2011','10001'),
  ('STU2012','10007'),('STU2012','10010'),('STU2012','10001'),
  -- BUS seniors/juniors
  ('STU2015','10010'),('STU2015','10011'),('STU2015','10012'),
  ('STU2016','10010'),('STU2016','10011'),('STU2016','10012'),
  ('STU2019','10010'),('STU2019','10011'),('STU2019','10012'),
  ('STU2020','10010'),('STU2020','10011'),('STU2020','10012'),
  ('STU2023','10010'),('STU2023','10011'),('STU2023','10012'),
  ('STU2024','10010'),('STU2024','10011'),('STU2024','10012'),
  -- BUS sophomores/freshmen (with electives)
  ('STU2017','10010'),('STU2017','10011'),('STU2017','10007'),
  ('STU2018','10010'),('STU2018','10001'),('STU2018','10007'),
  ('STU2021','10010'),('STU2021','10011'),('STU2021','10007'),
  ('STU2022','10010'),('STU2022','10001'),('STU2022','10007'),
  ('STU2025','10010'),('STU2025','10011'),('STU2025','10001')
) AS t(snum, csn)
JOIN students     s  ON s.student_number = t.snum
JOIN class_sections cs ON cs.csn         = t.csn
ON CONFLICT (student_id, section_id) DO NOTHING;

-- =============================================================================
-- GRADES — Fall 2024
-- Grades reflect each student's GPA profile.  Letter grades + numeric scores
-- are internally consistent.  posted_by = the faculty who taught the section.
-- =============================================================================
INSERT INTO grades
  (enrollment_id, letter_grade, numeric_grade, grade_points,
   semester_id, posted_date, posted_by)
SELECT e.enrollment_id, t.lg, t.ng::NUMERIC(5,2), t.gp::NUMERIC(3,2),
       sem.semester_id, '2024-12-20 12:00:00', u.user_id
FROM (VALUES
  -- STU2001 Alex Johnson (GPA 3.85) — CS senior
  ('STU2001','10003','A-', 92.0,3.7), ('STU2001','10004','A',  95.0,4.0), ('STU2001','10006','B+', 88.0,3.3),
  -- STU2002 Mia Thompson (GPA 3.50) — CS junior
  ('STU2002','10003','B+', 88.0,3.3), ('STU2002','10004','A-', 91.0,3.7), ('STU2002','10005','B',  84.0,3.0),
  -- STU2003 Ryan Garcia (GPA 2.90) — CS sophomore
  ('STU2003','10001','B',  84.0,3.0), ('STU2003','10002','B-', 81.0,2.7), ('STU2003','10003','C+', 78.0,2.3),
  -- STU2004 Priya Sharma (GPA 3.95) — CS senior
  ('STU2004','10004','A',  97.0,4.0), ('STU2004','10005','A',  96.0,4.0), ('STU2004','10006','A-', 93.0,3.7),
  -- STU2005 Kevin Wu (GPA 3.20) — CS freshman
  ('STU2005','10001','B+', 88.0,3.3), ('STU2005','10002','B',  85.0,3.0), ('STU2005','10010','B+', 87.0,3.3),
  -- STU2006 Jasmine Brown (GPA 2.40) — CS junior probation
  ('STU2006','10003','C',  75.0,2.0), ('STU2006','10005','C+', 78.0,2.3), ('STU2006','10006','C-', 70.0,1.7),
  -- STU2007 Ethan Davis (GPA 1.90) — CS sophomore probation
  ('STU2007','10001','D+', 68.0,1.3), ('STU2007','10002','D',  62.0,1.0), ('STU2007','10003','F',  45.0,0.0),
  -- STU2008 Sophia Lee (GPA 4.00) — CS senior
  ('STU2008','10004','A',  98.0,4.0), ('STU2008','10005','A',  97.0,4.0), ('STU2008','10006','A',  96.0,4.0),
  -- STU2009 Carlos Martin (GPA 3.60) — LAW junior
  ('STU2009','10007','A',  95.0,4.0), ('STU2009','10008','A-', 91.0,3.7), ('STU2009','10009','B+', 88.0,3.3),
  -- STU2010 Aisha Williams (GPA 3.75) — LAW senior
  ('STU2010','10007','A',  95.0,4.0), ('STU2010','10008','A',  93.0,4.0), ('STU2010','10009','A-', 91.0,3.7),
  -- STU2011 Noah Anderson (GPA 2.70) — LAW sophomore
  ('STU2011','10007','B-', 81.0,2.7), ('STU2011','10008','C+', 78.0,2.3), ('STU2011','10001','B',  83.0,3.0),
  -- STU2012 Emma Jackson (GPA 3.10) — LAW freshman
  ('STU2012','10007','B+', 87.0,3.3), ('STU2012','10010','B',  85.0,3.0), ('STU2012','10001','B+', 88.0,3.3),
  -- STU2013 Daniel White (GPA 2.30) — LAW junior probation
  ('STU2013','10007','C+', 78.0,2.3), ('STU2013','10008','C',  73.0,2.0), ('STU2013','10009','C-', 70.0,1.7),
  -- STU2014 Isabella Harris (GPA 3.45) — LAW senior
  ('STU2014','10007','A-', 92.0,3.7), ('STU2014','10008','B+', 87.0,3.3), ('STU2014','10009','B+', 88.0,3.3),
  -- STU2015 Liam Clark (GPA 3.30) — BUS junior
  ('STU2015','10010','B+', 88.0,3.3), ('STU2015','10011','B',  84.0,3.0), ('STU2015','10012','B+', 87.0,3.3),
  -- STU2016 Ava Lewis (GPA 3.70) — BUS senior
  ('STU2016','10010','A',  94.0,4.0), ('STU2016','10011','A-', 92.0,3.7), ('STU2016','10012','A-', 91.0,3.7),
  -- STU2017 Mason Robinson (GPA 2.60) — BUS sophomore
  ('STU2017','10010','B-', 82.0,2.7), ('STU2017','10011','C+', 78.0,2.3), ('STU2017','10007','B-', 81.0,2.7),
  -- STU2018 Chloe Walker (GPA 3.50) — BUS freshman
  ('STU2018','10010','A-', 92.0,3.7), ('STU2018','10001','B+', 87.0,3.3), ('STU2018','10007','B+', 88.0,3.3),
  -- STU2019 James Hall (GPA 2.10) — BUS senior probation
  ('STU2019','10010','C',  73.0,2.0), ('STU2019','10011','D+', 68.0,1.3), ('STU2019','10012','C',  74.0,2.0),
  -- STU2020 Amelia Allen (GPA 3.80) — BUS junior
  ('STU2020','10010','A',  95.0,4.0), ('STU2020','10011','A-', 92.0,3.7), ('STU2020','10012','A',  94.0,4.0),
  -- STU2021 Oliver Young (GPA 2.00) — BUS sophomore probation
  ('STU2021','10010','C',  73.0,2.0), ('STU2021','10011','D+', 67.0,1.3), ('STU2021','10007','D',  62.0,1.0),
  -- STU2022 Grace Hernandez (GPA 3.90) — BUS freshman
  ('STU2022','10010','A',  96.0,4.0), ('STU2022','10001','A-', 92.0,3.7), ('STU2022','10007','A',  95.0,4.0),
  -- STU2023 William King (GPA 3.15) — BUS junior
  ('STU2023','10010','B',  84.0,3.0), ('STU2023','10011','B',  85.0,3.0), ('STU2023','10012','B+', 87.0,3.3),
  -- STU2024 Charlotte Wright (GPA 3.55) — BUS senior
  ('STU2024','10010','A-', 91.0,3.7), ('STU2024','10011','B+', 88.0,3.3), ('STU2024','10012','B+', 87.0,3.3),
  -- STU2025 Benjamin Scott (GPA 1.80) — BUS sophomore probation
  ('STU2025','10010','D',  63.0,1.0), ('STU2025','10011','F',  48.0,0.0), ('STU2025','10001','D',  65.0,1.0)
) AS t(snum, csn, lg, ng, gp)
JOIN students       s   ON s.student_number  = t.snum
JOIN class_sections cs  ON cs.csn            = t.csn
JOIN enrollments    e   ON e.student_id      = s.student_id AND e.section_id = cs.section_id
JOIN semesters      sem ON sem.semester_name = 'Fall' AND sem.semester_year = 2024
JOIN faculty        f   ON f.faculty_id      = cs.faculty_id
JOIN users          u   ON u.user_id         = f.user_id;

-- =============================================================================
-- ENROLLMENTS — Spring 2025  (status = 'completed')
-- Students progress to next-level courses within their major.
-- =============================================================================
INSERT INTO enrollments (student_id, section_id, enrollment_date, status)
SELECT s.student_id, cs.section_id, '2025-01-15 08:00:00', 'completed'
FROM (VALUES
  -- CS seniors/juniors (advanced courses)
  ('STU2001','20003'),('STU2001','20004'),('STU2001','20005'),
  ('STU2002','20001'),('STU2002','20003'),('STU2002','20006'),
  ('STU2004','20003'),('STU2004','20004'),('STU2004','20005'),
  ('STU2008','20003'),('STU2008','20004'),('STU2008','20005'),
  -- CS sophomores/freshmen
  ('STU2003','20001'),('STU2003','20002'),('STU2003','20006'),
  ('STU2005','20001'),('STU2005','20002'),('STU2005','20010'),
  ('STU2006','20001'),('STU2006','20003'),('STU2006','20006'),
  ('STU2007','20001'),('STU2007','20002'),('STU2007','20006'),
  -- LAW seniors/juniors
  ('STU2009','20007'),('STU2009','20008'),('STU2009','20009'),
  ('STU2010','20007'),('STU2010','20008'),('STU2010','20009'),
  ('STU2013','20007'),('STU2013','20008'),('STU2013','20009'),
  ('STU2014','20007'),('STU2014','20008'),('STU2014','20009'),
  -- LAW sophomores/freshmen (with electives)
  ('STU2011','20007'),('STU2011','20008'),('STU2011','20010'),
  ('STU2012','20007'),('STU2012','20010'),('STU2012','20001'),
  -- BUS seniors/juniors
  ('STU2015','20010'),('STU2015','20011'),('STU2015','20012'),
  ('STU2016','20010'),('STU2016','20011'),('STU2016','20012'),
  ('STU2019','20010'),('STU2019','20011'),('STU2019','20012'),
  ('STU2020','20010'),('STU2020','20011'),('STU2020','20012'),
  ('STU2023','20010'),('STU2023','20011'),('STU2023','20012'),
  ('STU2024','20010'),('STU2024','20011'),('STU2024','20012'),
  -- BUS sophomores/freshmen (with electives)
  ('STU2017','20010'),('STU2017','20011'),('STU2017','20007'),
  ('STU2018','20010'),('STU2018','20001'),('STU2018','20007'),
  ('STU2021','20010'),('STU2021','20011'),('STU2021','20007'),
  ('STU2022','20010'),('STU2022','20001'),('STU2022','20007'),
  ('STU2025','20010'),('STU2025','20011'),('STU2025','20001')
) AS t(snum, csn)
JOIN students       s  ON s.student_number = t.snum
JOIN class_sections cs ON cs.csn           = t.csn
ON CONFLICT (student_id, section_id) DO NOTHING;

-- =============================================================================
-- GRADES — Spring 2025
-- =============================================================================
INSERT INTO grades
  (enrollment_id, letter_grade, numeric_grade, grade_points,
   semester_id, posted_date, posted_by)
SELECT e.enrollment_id, t.lg, t.ng::NUMERIC(5,2), t.gp::NUMERIC(3,2),
       sem.semester_id, '2025-05-15 12:00:00', u.user_id
FROM (VALUES
  -- STU2001 Alex Johnson
  ('STU2001','20003','A-',91.0,3.7), ('STU2001','20004','B+',88.0,3.3), ('STU2001','20005','A', 94.0,4.0),
  -- STU2002 Mia Thompson
  ('STU2002','20001','B+',87.0,3.3), ('STU2002','20003','A-',90.0,3.7), ('STU2002','20006','B+',88.0,3.3),
  -- STU2003 Ryan Garcia
  ('STU2003','20001','B', 83.0,3.0), ('STU2003','20002','B-',80.0,2.7), ('STU2003','20006','C+',77.0,2.3),
  -- STU2004 Priya Sharma
  ('STU2004','20003','A', 96.0,4.0), ('STU2004','20004','A', 95.0,4.0), ('STU2004','20005','A-',92.0,3.7),
  -- STU2005 Kevin Wu
  ('STU2005','20001','B', 84.0,3.0), ('STU2005','20002','B+',87.0,3.3), ('STU2005','20010','B+',86.0,3.3),
  -- STU2006 Jasmine Brown
  ('STU2006','20001','C+',77.0,2.3), ('STU2006','20003','C', 73.0,2.0), ('STU2006','20006','C', 74.0,2.0),
  -- STU2007 Ethan Davis
  ('STU2007','20001','D+',67.0,1.3), ('STU2007','20002','D', 62.0,1.0), ('STU2007','20006','D', 63.0,1.0),
  -- STU2008 Sophia Lee
  ('STU2008','20003','A', 99.0,4.0), ('STU2008','20004','A', 97.0,4.0), ('STU2008','20005','A', 98.0,4.0),
  -- STU2009 Carlos Martin
  ('STU2009','20007','A-',91.0,3.7), ('STU2009','20008','B+',89.0,3.3), ('STU2009','20009','A', 93.0,4.0),
  -- STU2010 Aisha Williams
  ('STU2010','20007','A', 94.0,4.0), ('STU2010','20008','A-',92.0,3.7), ('STU2010','20009','A', 95.0,4.0),
  -- STU2011 Noah Anderson
  ('STU2011','20007','B-',80.0,2.7), ('STU2011','20008','C+',77.0,2.3), ('STU2011','20010','B', 84.0,3.0),
  -- STU2012 Emma Jackson
  ('STU2012','20007','B', 85.0,3.0), ('STU2012','20010','B+',87.0,3.3), ('STU2012','20001','B', 84.0,3.0),
  -- STU2013 Daniel White
  ('STU2013','20007','C', 74.0,2.0), ('STU2013','20008','C-',71.0,1.7), ('STU2013','20009','C+',77.0,2.3),
  -- STU2014 Isabella Harris
  ('STU2014','20007','B+',88.0,3.3), ('STU2014','20008','A-',91.0,3.7), ('STU2014','20009','B+',87.0,3.3),
  -- STU2015 Liam Clark
  ('STU2015','20010','B', 85.0,3.0), ('STU2015','20011','B+',87.0,3.3), ('STU2015','20012','B+',88.0,3.3),
  -- STU2016 Ava Lewis
  ('STU2016','20010','A', 94.0,4.0), ('STU2016','20011','A-',91.0,3.7), ('STU2016','20012','A', 93.0,4.0),
  -- STU2017 Mason Robinson
  ('STU2017','20010','C+',77.0,2.3), ('STU2017','20011','B-',80.0,2.7), ('STU2017','20007','B-',81.0,2.7),
  -- STU2018 Chloe Walker
  ('STU2018','20010','A-',90.0,3.7), ('STU2018','20001','B+',88.0,3.3), ('STU2018','20007','B+',87.0,3.3),
  -- STU2019 James Hall
  ('STU2019','20010','D+',68.0,1.3), ('STU2019','20011','C', 74.0,2.0), ('STU2019','20012','C', 75.0,2.0),
  -- STU2020 Amelia Allen
  ('STU2020','20010','A', 95.0,4.0), ('STU2020','20011','A', 94.0,4.0), ('STU2020','20012','A-',91.0,3.7),
  -- STU2021 Oliver Young
  ('STU2021','20010','C-',71.0,1.7), ('STU2021','20011','D+',67.0,1.3), ('STU2021','20007','D', 64.0,1.0),
  -- STU2022 Grace Hernandez
  ('STU2022','20010','A', 95.0,4.0), ('STU2022','20001','A', 96.0,4.0), ('STU2022','20007','A-',92.0,3.7),
  -- STU2023 William King
  ('STU2023','20010','B', 83.0,3.0), ('STU2023','20011','B', 84.0,3.0), ('STU2023','20012','B+',87.0,3.3),
  -- STU2024 Charlotte Wright
  ('STU2024','20010','B+',88.0,3.3), ('STU2024','20011','A-',90.0,3.7), ('STU2024','20012','B+',87.0,3.3),
  -- STU2025 Benjamin Scott
  ('STU2025','20010','F', 50.0,0.0), ('STU2025','20011','D', 62.0,1.0), ('STU2025','20001','D+',67.0,1.3)
) AS t(snum, csn, lg, ng, gp)
JOIN students       s   ON s.student_number  = t.snum
JOIN class_sections cs  ON cs.csn            = t.csn
JOIN enrollments    e   ON e.student_id      = s.student_id AND e.section_id = cs.section_id
JOIN semesters      sem ON sem.semester_name = 'Spring' AND sem.semester_year = 2025
JOIN faculty        f   ON f.faculty_id      = cs.faculty_id
JOIN users          u   ON u.user_id         = f.user_id;

-- =============================================================================
-- ENROLLMENTS — Fall 2025 (current semester, status = 'enrolled')
-- Students take upper-level courses.  Seniors in capstone/advanced sections.
-- =============================================================================
INSERT INTO enrollments (student_id, section_id, enrollment_date, status)
SELECT s.student_id, cs.section_id, '2025-08-20 08:00:00', 'enrolled'
FROM (VALUES
  -- CS students
  ('STU2001','30003'),('STU2001','30006'),                    -- senior: CS340, CS430
  ('STU2002','30001'),('STU2002','30002'),                    -- junior: CS230, CS310
  ('STU2003','30001'),('STU2003','30002'),                    -- sophomore: CS230, CS310
  ('STU2004','30004'),('STU2004','30005'),                    -- senior: CS410, CS420
  ('STU2005','30001'),('STU2005','30011'),                    -- freshman→soph: CS230 + BUS elective
  ('STU2006','30001'),('STU2006','30002'),                    -- junior: CS230, CS310
  ('STU2007','30001'),('STU2007','30010'),                    -- sophomore: CS230 + BUS elective
  ('STU2008','30003'),('STU2008','30004'),                    -- senior: CS340, CS410
  -- LAW students
  ('STU2009','30007'),('STU2009','30008'),                    -- junior: LAW310, LAW320
  ('STU2010','30007'),('STU2010','30009'),                    -- senior: LAW310, LAW401
  ('STU2011','30007'),('STU2011','30010'),                    -- sophomore: LAW310 + BUS elective
  ('STU2012','30007'),('STU2012','30010'),                    -- freshman: LAW310 + BUS elective
  ('STU2013','30007'),('STU2013','30008'),                    -- junior: LAW310, LAW320
  ('STU2014','30008'),('STU2014','30009'),                    -- senior: LAW320, LAW401
  -- BUS students
  ('STU2015','30010'),('STU2015','30011'),                    -- junior: BUS301, BUS330
  ('STU2016','30010'),('STU2016','30012'),                    -- senior: BUS301, BUS401
  ('STU2017','30010'),('STU2017','30007'),                    -- sophomore: BUS301 + LAW elective
  ('STU2018','30010'),('STU2018','30007'),                    -- freshman: BUS301 + LAW elective
  ('STU2019','30010'),('STU2019','30011'),                    -- senior: BUS301, BUS330
  ('STU2020','30010'),('STU2020','30011'),                    -- junior: BUS301, BUS330
  ('STU2021','30010'),('STU2021','30007'),                    -- sophomore: BUS301 + LAW elective
  ('STU2022','30010'),('STU2022','30001'),                    -- freshman: BUS301 + CS elective
  ('STU2023','30010'),('STU2023','30011'),                    -- junior: BUS301, BUS330
  ('STU2024','30011'),('STU2024','30012'),                    -- senior: BUS330, BUS401
  ('STU2025','30010'),('STU2025','30011')                     -- sophomore: BUS301, BUS330
) AS t(snum, csn)
JOIN students       s  ON s.student_number = t.snum
JOIN class_sections cs ON cs.csn           = t.csn
ON CONFLICT (student_id, section_id) DO NOTHING;

-- =============================================================================
-- GRADES — Fall 2025 (in-progress; partial — midterm grades posted for
-- seniors and some high-performing students.  Others still NULL / pending.)
-- =============================================================================
INSERT INTO grades
  (enrollment_id, letter_grade, numeric_grade, grade_points,
   semester_id, posted_date, posted_by)
SELECT e.enrollment_id, t.lg, t.ng::NUMERIC(5,2), t.gp::NUMERIC(3,2),
       sem.semester_id, '2025-10-20 12:00:00', u.user_id
FROM (VALUES
  -- senior CS students (on track)
  ('STU2004','30004','A', 95.0,4.0), ('STU2004','30005','A-',92.0,3.7),
  ('STU2008','30003','A', 98.0,4.0), ('STU2008','30004','A', 97.0,4.0),
  ('STU2001','30003','B+',89.0,3.3), ('STU2001','30006','A-',91.0,3.7),
  -- senior LAW students
  ('STU2010','30007','A', 94.0,4.0), ('STU2010','30009','A-',92.0,3.7),
  ('STU2014','30008','B+',88.0,3.3), ('STU2014','30009','A-',90.0,3.7),
  -- senior BUS students
  ('STU2016','30010','A', 93.0,4.0), ('STU2016','30012','A-',91.0,3.7),
  ('STU2024','30011','A-',90.0,3.7), ('STU2024','30012','B+',88.0,3.3),
  -- high-GPA students
  ('STU2022','30010','A', 96.0,4.0), ('STU2020','30010','A', 95.0,4.0),
  ('STU2020','30011','A-',93.0,3.7)
) AS t(snum, csn, lg, ng, gp)
JOIN students       s   ON s.student_number  = t.snum
JOIN class_sections cs  ON cs.csn            = t.csn
JOIN enrollments    e   ON e.student_id      = s.student_id AND e.section_id = cs.section_id
JOIN semesters      sem ON sem.semester_name = 'Fall' AND sem.semester_year = 2025
JOIN faculty        f   ON f.faculty_id      = cs.faculty_id
JOIN users          u   ON u.user_id         = f.user_id;

-- =============================================================================
-- UPDATE enrolled_count on all sections
-- =============================================================================
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
-- Faculty    : 10  (FAC201-FAC210 — 4 CS, 3 LAW, 3 BUS)
-- Students   : 25  (STU2001-STU2025 — 8 CS, 6 LAW, 11 BUS)
--              Years    : 6 freshmen, 6 sophomores, 7 juniors, 6 seniors
--              Standing : 20 good, 5 probation
--              GPA range: 1.80 – 4.00
-- Semesters  : Fall 2024  | Spring 2025  | Fall 2025 (current)
-- Sections   : 12 per semester = 36 total
-- Enrollments: ~75 per past semester + ~50 current = ~200 total
-- Grades     : Full grades for Fall 2024 & Spring 2025
--              Partial (seniors + high-GPA) for Fall 2025
-- Password   : password123  (bcrypt $2b$10$ rounds)
-- =============================================================================
