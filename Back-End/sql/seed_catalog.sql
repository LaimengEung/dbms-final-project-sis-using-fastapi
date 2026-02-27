-- =============================================================================
-- seed_catalog.sql
-- Inserts departments, majors, and courses for CS, Law, and Business.
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING).
-- Run with: psql -U postgres -d DBMS -f seed_catalog.sql
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- DEPARTMENTS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO departments (department_code, department_name, description) VALUES
  ('CS',  'Computer Science',  'Covers algorithms, software engineering, AI, and systems programming.'),
  ('LAW', 'Law',               'Covers legal theory, constitutional law, contracts, and litigation.'),
  ('BUS', 'Business',          'Covers management, finance, marketing, and entrepreneurship.')
ON CONFLICT (department_code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- MAJORS  (major_code is UNIQUE — used as conflict target)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO majors (major_code, major_name, department_id, required_credits, description)
SELECT t.major_code, t.major_name, d.department_id, t.required_credits::INTEGER, t.description
FROM (VALUES
  ('CS-BS',   'Computer Science',        'CS',  120, 'Bachelor of Science in Computer Science.'),
  ('CS-SE',   'Software Engineering',    'CS',  120, 'Bachelor of Science in Software Engineering.'),
  ('CS-DS',   'Data Science',            'CS',  120, 'Bachelor of Science in Data Science.'),
  ('LAW-JD',  'Juris Doctor (JD)',       'LAW', 90,  'Professional law degree (J.D.) program.'),
  ('LAW-LS',  'Legal Studies',           'LAW', 60,  'Undergraduate Legal Studies program.'),
  ('BUS-BA',  'Business Administration', 'BUS', 120, 'Bachelor of Science in Business Administration.'),
  ('BUS-FIN', 'Finance',                 'BUS', 120, 'Bachelor of Science in Finance.'),
  ('BUS-MKT', 'Marketing',               'BUS', 120, 'Bachelor of Science in Marketing.')
) AS t(major_code, major_name, dept_code, required_credits, description)
JOIN departments d ON d.department_code = t.dept_code
ON CONFLICT (major_code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- COURSES — Computer Science
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO courses (course_code, course_name, description, credits, department_id)
SELECT t.course_code, t.course_name, t.description, t.credits::INTEGER, d.department_id
FROM (VALUES
  ('CS101',  'Introduction to Computer Science',    'Fundamental concepts of programming and computational thinking.',       3),
  ('CS102',  'Programming I',                       'Introduction to programming using Python.',                             3),
  ('CS201',  'Programming II',                      'Object-oriented programming and data structures using Java.',           3),
  ('CS210',  'Discrete Mathematics',                'Logic, sets, relations, graphs, and combinatorics for CS.',             3),
  ('CS220',  'Data Structures & Algorithms',        'Arrays, linked lists, trees, graphs, sorting and searching.',          3),
  ('CS230',  'Computer Organization',               'Digital logic, assembly language, memory hierarchy.',                  3),
  ('CS301',  'Operating Systems',                   'Process management, scheduling, memory, file systems.',                 3),
  ('CS310',  'Database Systems',                    'Relational model, SQL, normalization, transaction management.',         3),
  ('CS320',  'Software Engineering',                'SDLC, agile methods, design patterns, testing strategies.',             3),
  ('CS330',  'Computer Networks',                   'Network protocols, TCP/IP, routing, security.',                         3),
  ('CS340',  'Artificial Intelligence',             'Search, knowledge representation, machine learning basics.',            3),
  ('CS350',  'Machine Learning',                    'Supervised/unsupervised learning, neural networks, model evaluation.',  3),
  ('CS360',  'Web Development',                     'HTML, CSS, JavaScript, REST APIs, and modern frameworks.',              3),
  ('CS401',  'Compiler Design',                     'Lexical analysis, parsing, code generation.',                          3),
  ('CS410',  'Computer Security',                   'Cryptography, network security, ethical hacking fundamentals.',         3),
  ('CS420',  'Cloud Computing',                     'Virtualization, cloud platforms, microservices, containers.',           3),
  ('CS430',  'Senior Software Project I',           'Capstone project design and planning phase.',                          3),
  ('CS431',  'Senior Software Project II',          'Capstone project implementation and presentation.',                    3)
) AS t(course_code, course_name, description, credits)
JOIN departments d ON d.department_code = 'CS'
ON CONFLICT (course_code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- COURSES — Law
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO courses (course_code, course_name, description, credits, department_id)
SELECT t.course_code, t.course_name, t.description, t.credits::INTEGER, d.department_id
FROM (VALUES
  ('LAW101', 'Introduction to Law',              'Overview of the legal system, sources of law, and legal reasoning.',        3),
  ('LAW110', 'Legal Research & Writing',         'Legal citation, brief writing, statutory research, and memo drafting.',    3),
  ('LAW201', 'Constitutional Law',               'Structure of the U.S. Constitution, civil rights, and judicial review.',   4),
  ('LAW210', 'Contracts',                        'Formation, performance, breach, and remedies in contract law.',            4),
  ('LAW220', 'Torts',                            'Negligence, intentional torts, strict liability, and damages.',            3),
  ('LAW230', 'Civil Procedure',                  'Federal rules, jurisdiction, pleadings, discovery, and trial.',            4),
  ('LAW301', 'Criminal Law',                     'Crimes, defenses, and the criminal justice process.',                      3),
  ('LAW310', 'Property Law',                     'Real and personal property, landlord-tenant, easements.',                  3),
  ('LAW320', 'Administrative Law',               'Regulatory agencies, rulemaking, adjudication, and judicial review.',      3),
  ('LAW330', 'Business Law',                     'Corporations, partnerships, agency, and commercial transactions.',          3),
  ('LAW401', 'Evidence',                         'Rules of evidence, admissibility, hearsay, and witnesses.',                3),
  ('LAW410', 'International Law',                'Treaties, state responsibility, human rights, and trade law.',             3),
  ('LAW420', 'Environmental Law',                'Regulatory frameworks for environmental protection and compliance.',        3),
  ('LAW430', 'Family Law',                       'Marriage, divorce, child custody, adoption, and domestic relations.',      3),
  ('LAW440', 'Moot Court',                       'Oral argument practice, brief writing, and appellate advocacy.',           2),
  ('LAW499', 'Law Capstone & Clinic',            'Supervised legal clinic experience and case presentation.',                4)
) AS t(course_code, course_name, description, credits)
JOIN departments d ON d.department_code = 'LAW'
ON CONFLICT (course_code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- COURSES — Business
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO courses (course_code, course_name, description, credits, department_id)
SELECT t.course_code, t.course_name, t.description, t.credits::INTEGER, d.department_id
FROM (VALUES
  ('BUS101', 'Introduction to Business',           'Overview of business functions: management, marketing, finance, ops.',   3),
  ('BUS110', 'Business Communication',             'Professional writing, presentations, and workplace communication.',       3),
  ('BUS201', 'Principles of Management',           'Planning, organizing, leading, and controlling in organizations.',        3),
  ('BUS210', 'Principles of Marketing',            'Market segmentation, consumer behavior, branding, and pricing.',          3),
  ('BUS220', 'Financial Accounting',               'Recording, summarizing, and reporting financial transactions.',            3),
  ('BUS230', 'Managerial Accounting',              'Cost analysis, budgeting, and decision-making for managers.',             3),
  ('BUS240', 'Business Statistics',                'Descriptive and inferential statistics applied to business data.',        3),
  ('BUS301', 'Corporate Finance',                  'Capital structure, valuation, investment decisions, risk and return.',    3),
  ('BUS310', 'Operations Management',              'Supply chain, quality control, lean, and process improvement.',           3),
  ('BUS320', 'Human Resource Management',          'Recruitment, training, performance evaluation, and labor relations.',     3),
  ('BUS330', 'Organizational Behavior',            'Motivation, leadership, group dynamics, and organizational culture.',     3),
  ('BUS340', 'Business Ethics',                    'Ethical frameworks, corporate social responsibility, and governance.',    3),
  ('BUS350', 'Entrepreneurship',                   'Business plan development, startup funding, and venture strategy.',       3),
  ('BUS401', 'Strategic Management',               'Competitive analysis, strategy formulation, and case studies.',           3),
  ('BUS410', 'International Business',             'Global trade, foreign market entry, and cross-cultural management.',      3),
  ('BUS420', 'Digital Marketing',                  'SEO, social media, analytics, e-commerce, and content strategy.',        3),
  ('BUS430', 'Investment Analysis',                'Portfolio theory, equity valuation, fixed income, and derivatives.',      3),
  ('BUS499', 'Business Capstone',                  'Integrated business simulation and strategic consulting project.',        3)
) AS t(course_code, course_name, description, credits)
JOIN departments d ON d.department_code = 'BUS'
ON CONFLICT (course_code) DO NOTHING;

COMMIT;

-- Summary of inserted data:
-- Departments : CS, LAW, BUS (3)
-- Majors      : 8 total (3 CS, 2 LAW, 3 BUS)
-- Courses     : 52 total (18 CS, 16 LAW, 18 BUS)
