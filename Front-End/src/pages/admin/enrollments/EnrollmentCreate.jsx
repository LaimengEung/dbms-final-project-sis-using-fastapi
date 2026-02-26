import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, Select } from '../../../components/ui';
import EnrollmentForm from './components/EnrollmentForm';
import enrollmentService from '../../../services/enrollmentService';
import studentService from '../../../services/studentService';
import facultyService from '../../../services/facultyService';
import { courseService } from '../../../services/courseService';

const EnrollmentCreate = () => {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [hasStudents, setHasStudents] = useState(false);
  const [hasSections, setHasSections] = useState(false);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [prereqChecked, setPrereqChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [setupMessage, setSetupMessage] = useState('');
  const [setupError, setSetupError] = useState('');
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [creatingSection, setCreatingSection] = useState(false);
  const [newCourse, setNewCourse] = useState({
    course_code: '',
    course_name: '',
    credits: 3,
    department_id: '',
  });
  const [newSection, setNewSection] = useState({
    course_id: '',
    semester_id: '',
    faculty_id: '',
    section_number: '',
    schedule: '',
    max_capacity: 30,
    classroom: '',
  });

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [semestersRes, studentsRes, sectionsRes, coursesRes, facultyRes, departmentsRes] = await Promise.all([
          enrollmentService.getSemesters(),
          studentService.getAll({ limit: 1 }),
          enrollmentService.getSectionsBySemester(undefined),
          courseService.getAll(),
          facultyService.getAll({ limit: 100 }),
          facultyService.getDepartments(),
        ]);

        setSemesters(semestersRes.data || []);
        setHasStudents((studentsRes.data || []).length > 0);
        setHasSections((sectionsRes.data || []).length > 0);
        setCourses(Array.isArray(coursesRes?.data) ? coursesRes.data : []);
        setFaculty(facultyRes?.data || []);
        setDepartments(departmentsRes?.data || []);
      } finally {
        setPrereqChecked(true);
      }
    };

    loadPrerequisites();
  }, []);

  const refreshPrerequisites = async () => {
    const [semestersRes, studentsRes, sectionsRes, coursesRes, facultyRes, departmentsRes] = await Promise.all([
      enrollmentService.getSemesters(),
      studentService.getAll({ limit: 1 }),
      enrollmentService.getSectionsBySemester(undefined),
      courseService.getAll(),
      facultyService.getAll({ limit: 100 }),
      facultyService.getDepartments(),
    ]);
    setSemesters(semestersRes.data || []);
    setHasStudents((studentsRes.data || []).length > 0);
    setHasSections((sectionsRes.data || []).length > 0);
    setCourses(Array.isArray(coursesRes?.data) ? coursesRes.data : []);
    setFaculty(facultyRes?.data || []);
    setDepartments(departmentsRes?.data || []);
  };

  const missingPrerequisites = prereqChecked && (!semesters.length || !hasStudents || !hasSections || !courses.length || !faculty.length);

  const handleCreateCourse = async () => {
    setSetupError('');
    setSetupMessage('');
    if (!newCourse.course_code || !newCourse.course_name) {
      setSetupError('Course code and course name are required.');
      return;
    }
    setCreatingCourse(true);
    try {
      await courseService.create({
        course_code: newCourse.course_code,
        course_name: newCourse.course_name,
        credits: Number(newCourse.credits || 3),
        department_id: newCourse.department_id ? Number(newCourse.department_id) : null,
      });
      setSetupMessage('Course created successfully.');
      setNewCourse({ course_code: '', course_name: '', credits: 3, department_id: '' });
      await refreshPrerequisites();
    } catch (error) {
      setSetupError(error?.response?.data?.message || 'Failed to create course.');
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleCreateSection = async () => {
    setSetupError('');
    setSetupMessage('');
    if (!newSection.course_id || !newSection.semester_id) {
      setSetupError('Course and semester are required to create a section.');
      return;
    }
    setCreatingSection(true);
    try {
      await courseService.createSection(newSection.course_id, {
        semester_id: Number(newSection.semester_id),
        faculty_id: newSection.faculty_id ? Number(newSection.faculty_id) : null,
        section_number: newSection.section_number || undefined,
        max_capacity: Number(newSection.max_capacity || 30),
        schedule: newSection.schedule || null,
        classroom: newSection.classroom || null,
        status: 'open',
      });
      setSetupMessage('Section created successfully.');
      setNewSection({
        course_id: '',
        semester_id: '',
        faculty_id: '',
        section_number: '',
        schedule: '',
        max_capacity: 30,
        classroom: '',
      });
      await refreshPrerequisites();
    } catch (error) {
      setSetupError(error?.response?.data?.message || 'Failed to create section.');
    } finally {
      setCreatingSection(false);
    }
  };

  const handleSubmit = async (data) => {
    if (missingPrerequisites) return;
    setLoading(true);
    setSubmitError('');
    try {
      await enrollmentService.create(data);
      navigate('/admin/enrollments', { state: { message: 'Enrollment created!' } });
    } catch (error) {
      setSubmitError(error?.message || 'Failed to create enrollment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">New Enrollment</h1>
      <Card className="p-6">
        {missingPrerequisites && (
          <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 space-y-2">
            <div className="font-semibold">Academic setup is incomplete.</div>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>Semesters: {semesters.length > 0 ? 'Ready' : 'Missing'}</li>
              <li>Students: {hasStudents ? 'Ready' : 'Missing'}</li>
              <li>Courses: {courses.length > 0 ? 'Ready' : 'Missing'}</li>
              <li>Faculty: {faculty.length > 0 ? 'Ready' : 'Missing'}</li>
              <li>Sections: {hasSections ? 'Ready' : 'Missing'}</li>
            </ul>
            <div className="text-sm">
              Create missing data below, then enrollment will be enabled.
            </div>
          </div>
        )}
        {submitError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {submitError}
          </div>
        )}

        {missingPrerequisites && (
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Quick Create Course</h3>
              <div className="space-y-3">
                <Input
                  label="Course Code"
                  value={newCourse.course_code}
                  onChange={(e) => setNewCourse((prev) => ({ ...prev, course_code: e.target.value }))}
                  placeholder="CS101"
                />
                <Input
                  label="Course Name"
                  value={newCourse.course_name}
                  onChange={(e) => setNewCourse((prev) => ({ ...prev, course_name: e.target.value }))}
                  placeholder="Introduction to Computing"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Credits"
                    type="number"
                    min="1"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, credits: e.target.value }))}
                  />
                  <Select
                    label="Department"
                    value={newCourse.department_id}
                    onChange={(e) => setNewCourse((prev) => ({ ...prev, department_id: e.target.value }))}
                    options={departments.map((d) => ({ value: d.department_id, label: d.department_name }))}
                  />
                </div>
                <Button onClick={handleCreateCourse} isLoading={creatingCourse}>
                  Create Course
                </Button>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Quick Create Section</h3>
              <div className="space-y-3">
                <Select
                  label="Course"
                  value={newSection.course_id}
                  onChange={(e) => setNewSection((prev) => ({ ...prev, course_id: e.target.value }))}
                  options={courses.map((c) => ({ value: c.course_id, label: `${c.course_code} - ${c.course_name}` }))}
                />
                <Select
                  label="Semester"
                  value={newSection.semester_id}
                  onChange={(e) => setNewSection((prev) => ({ ...prev, semester_id: e.target.value }))}
                  options={semesters.map((s) => ({ value: s.semester_id, label: `${s.semester_name} ${s.semester_year}` }))}
                />
                <Select
                  label="Faculty"
                  value={newSection.faculty_id}
                  onChange={(e) => setNewSection((prev) => ({ ...prev, faculty_id: e.target.value }))}
                  options={faculty.map((f) => ({ value: f.faculty_id, label: `${f.first_name} ${f.last_name}` }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Section No."
                    value={newSection.section_number}
                    onChange={(e) => setNewSection((prev) => ({ ...prev, section_number: e.target.value }))}
                    placeholder="001"
                  />
                  <Input
                    label="Capacity"
                    type="number"
                    min="1"
                    value={newSection.max_capacity}
                    onChange={(e) => setNewSection((prev) => ({ ...prev, max_capacity: e.target.value }))}
                  />
                </div>
                <Input
                  label="Schedule"
                  value={newSection.schedule}
                  onChange={(e) => setNewSection((prev) => ({ ...prev, schedule: e.target.value }))}
                  placeholder="Mon/Wed 09:00-10:15"
                />
                <Input
                  label="Classroom"
                  value={newSection.classroom}
                  onChange={(e) => setNewSection((prev) => ({ ...prev, classroom: e.target.value }))}
                  placeholder="A-101"
                />
                <Button onClick={handleCreateSection} isLoading={creatingSection}>
                  Create Section
                </Button>
              </div>
            </Card>
          </div>
        )}

        {(setupMessage || setupError) && (
          <div className={`mb-4 rounded px-4 py-3 ${setupError ? 'border border-red-200 bg-red-50 text-red-700' : 'border border-green-200 bg-green-50 text-green-700'}`}>
            {setupError || setupMessage}
          </div>
        )}

        <EnrollmentForm 
          onSubmit={handleSubmit}
          isLoading={loading}
          semesters={semesters}
          disableSubmit={missingPrerequisites}
          onCancel={() => navigate('/admin/enrollments')}
        />
      </Card>
    </div>
  );
};

export default EnrollmentCreate;
