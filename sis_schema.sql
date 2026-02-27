-- USERS & AUTHENTICATION
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    -- username VARCHAR(50) UNIQUE NOT NULL, -- for login; either username or email
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN
    ('student', 'faculty', 'admin', 'registrar')),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEPARTMENTS (this table might not need, if we just want to offer majors, and no need departments)
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_code VARCHAR(10) UNIQUE NOT NULL, -- like SDT (School of Digital Science), but may not need
    department_name VARCHAR(100) NOT NULL,
    description TEXT
);

-- MAJORS/PROGRAMS
CREATE TABLE majors (
    major_id SERIAL PRIMARY KEY,
    major_code VARCHAR(10) UNIQUE NOT NULL, -- MAY NOT NEED
    major_name VARCHAR(100) NOT NULL,
    department_id INTEGER REFERENCES departments(department_id), -- MAY NOT NEED (IF REMOVE departments table)
    required_credits INTEGER NOT NULL, -- required credits for graduation
    description TEXT
);

-- FACULTY
CREATE TABLE faculty (
    faculty_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    faculty_number VARCHAR(20) UNIQUE NOT NULL,
    department_id INTEGER REFERENCES departments(department_id),
    title VARCHAR(50),
    office_location VARCHAR(100)
    -- no need office_hours
);

-- STUDENTS
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY, -- like the literal ID of the student (e.g: 2024440)
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    student_number VARCHAR(20) UNIQUE NOT NULL, -- WTH IS THIS (CHECK)
    classification VARCHAR(20) CHECK (classification IN ('freshman', 'sophomore', 'junior', 'senior')), 
	major_id INTEGER REFERENCES majors(major_id),
    admission_date DATE,
    credits_earned INT DEFAULT 0, -- may be computed from enrollments, class_sections, and courses; and may not need to be a column here.
    gpa DECIMAL(3,2) DEFAULT 0.00,
    academic_standing VARCHAR(20) DEFAULT 'good', -- may not need this, since AUPP_SIS doesn't display anything, and REAN displays probation LMAOOO
    advisor_id INTEGER REFERENCES faculty(faculty_id) 
);

-- COURSES
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL, -- like COSC 121
    course_name VARCHAR(200) NOT NULL,
    description TEXT,
    credits INTEGER NOT NULL,
    department_id INTEGER REFERENCES departments(department_id) -- MAY NOT NEED
);

-- SEMESTERS
CREATE TABLE semesters (
    semester_id SERIAL PRIMARY KEY, -- A surrogate primary key, which is an artificial, system-generated unique identifier (like an auto-incrementing integer or UUID)
    semester_name VARCHAR(50) NOT NULL,
    semester_year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_start DATE,
    registration_end DATE,
    is_current BOOLEAN DEFAULT false,
    UNIQUE(semester_name, semester_year) 
);

-- CLASS SECTIONS (Class Schedule)
CREATE TABLE class_sections (
    section_id SERIAL PRIMARY KEY,
    csn VARCHAR(20) UNIQUE NOT NULL, -- Course Serial Number
    course_id INTEGER REFERENCES courses(course_id),
    semester_id INTEGER REFERENCES semesters(semester_id),
    section_number VARCHAR(10) NOT NULL, -- LIKE 001, 002, 003..., CANNOT be INT, since INT only starts from 0, so the backend will handle the assignment of section numbers
    -- def create_section(course_id, semester_id):
    --      # Get next section number for this course+semester
    --      next_num = get_next_section_number(course_id, semester_id)
    --      section_number = f"{next_num:03d}"
    --  # :03d:  fixed width of 3 characters, filling any empty space with leading zeros.
    faculty_id INTEGER REFERENCES faculty(faculty_id),
    classroom VARCHAR(50),
    schedule VARCHAR(100), -- e.g., "MWF 8:30 - 11:00" or anything u want (handled by the backend)
    start_date DATE,
    end_date DATE,
    max_capacity INTEGER DEFAULT 30,
    enrolled_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')) -- cancelled may not need
    -- the whole column may not need actually, we'll see
);

-- ENROLLMENTS (Student's Registered Classes)
CREATE TABLE enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id),
    section_id INTEGER REFERENCES class_sections(section_id),
    enrollment_date TIMESTAMP DEFAULT LOCALTIMESTAMP,
    status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped', 'withdrawn', 'completed')),
    UNIQUE(student_id, section_id)
);

-- GRADES 
CREATE TABLE grades (
    grade_id SERIAL PRIMARY KEY,
    enrollment_id INTEGER REFERENCES enrollments(enrollment_id), -- WHY IS THIZ=S HERE
    letter_grade VARCHAR(2), -- A, A-, B+, B... or RG
    numeric_grade DECIMAL(5, 2),
    grade_points DECIMAL(3, 2), -- 4.00 scale
    semester_id INTEGER REFERENCES semesters(semester_id),
    posted_date TIMESTAMP, -- MIGHT NOT NEED; OR NEED FOR FACULTY/ADMIN to see
    posted_by INTEGER REFERENCES users(user_id)
);

-- PRE-REGISTERED COURSES (The Shopping Cart)
CREATE TABLE pre_registered_courses (
    pre_reg_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id), 
    section_id INTEGER REFERENCES class_sections(section_id),
    semester_id INTEGER REFERENCES semesters(semester_id),
    requested_date TIMESTAMP DEFAULT LOCALTIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER REFERENCES users(user_id),
    approved_date TIMESTAMP,
    notes TEXT, -- may or may not need
    UNIQUE(student_id, section_id)
);

-- DEGREE REQUIREMENTS (creates a mapping between majors and their required/elective courses)
    -- need this to prevent HARDCODING which courses each major needs
CREATE TABLE degree_requirements (
    requirement_id SERIAL PRIMARY KEY, 
    major_id INTEGER REFERENCES majors(major_id),
    course_id INTEGER REFERENCES courses(course_id),
    requirement_type VARCHAR(20) CHECK (requirement_type IN ('major', 'elective', 'ge')),
    is_required BOOLEAN DEFAULT true,
    credits INTEGER
);

-- FINANCE RECORDS (MIGHT NOT NEED THIS)
CREATE TABLE finance_records (
    finance_id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(student_id),
    semester_id INTEGER REFERENCES semesters(semester_id),
    amount DECIMAL(10, 2) NOT NULL, -- newly added
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('tuition', 'payment', 'fee', 'refund', 'penalty')), -- MIGHT NOT NEED THIS MUCH
    description TEXT,
    transaction_date DATE NOT NULL,
    payment_method VARCHAR(50), -- online (aba...), offline... 
    reference_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')), -- MIGHT NOT NEED
    created_at TIMESTAMP DEFAULT LOCALTIMESTAMP
);

CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_section ON enrollments(section_id);
CREATE INDEX idx_grades_enrollment ON grades(enrollment_id);
CREATE INDEX idx_sections_semester ON class_sections(semester_id);
CREATE INDEX idx_sections_faculty ON class_sections(faculty_id);
CREATE INDEX idx_finance__student ON finance_records(student_id);