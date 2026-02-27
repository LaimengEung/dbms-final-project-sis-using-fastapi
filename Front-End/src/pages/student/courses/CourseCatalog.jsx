import React, { useEffect, useMemo, useState } from 'react';
import StudentLayout from '../../../components/layout/StudentLayout';
import { Alert, Badge, Button, Card, Select, Spinner, Table } from '../../../components/ui';
import enrollmentService from '../../../services/enrollmentService';
import semesterService from '../../../services/semesterService';
import studentService from '../../../services/studentService';
import api from '../../../services/api';

const CourseCatalog = () => {
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null); // section_id being enrolled
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [semRes, secRes, profileRes] = await Promise.all([
          semesterService.getAll({ limit: 100 }),
          api.get('/sections'),
          studentService.getAll({ limit: 1 }),
        ]);

        const semList = Array.isArray(semRes?.data) ? semRes.data : [];
        setSemesters(semList);

        // Pre-select current semester
        const current = semList.find((s) => s.is_current);
        if (current) setSemesterFilter(String(current.semester_id));

        const secList = Array.isArray(secRes.data) ? secRes.data : secRes.data?.data || [];
        setSections(secList);

        const student = Array.isArray(profileRes?.data) ? profileRes.data[0] : null;
        if (student?.student_id) setStudentId(student.student_id);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load course catalog.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const semesterOptions = useMemo(
    () => semesters.map((s) => ({ value: String(s.semester_id), label: `${s.semester_name} ${s.semester_year}` })),
    [semesters]
  );

  const filtered = useMemo(
    () =>
      semesterFilter
        ? sections.filter((s) => String(s.semester_id) === semesterFilter)
        : sections,
    [sections, semesterFilter]
  );

  const handleEnroll = async (section) => {
    if (!studentId) { setError('Student profile not found.'); return; }
    setError('');
    setSuccess('');
    setEnrolling(section.section_id);
    try {
      await enrollmentService.create({
        student_id: studentId,
        section_id: section.section_id,
        semester_id: section.semester_id || section.semester?.semester_id,
      });
      const label = `${section.course?.course_code || section.course_code} – ${section.course?.course_name || section.course_name}`;
      setSuccess(`Enrolled in ${label} successfully!`);
    } catch (err) {
      const msg = err?.message || err?.detail || 'Enrollment failed.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setEnrolling(null);
    }
  };

  const columns = [
    { key: 'course_code', header: 'Code', render: (_, row) => row.course?.course_code || row.course_code || '-' },
    { key: 'course_name', header: 'Course', render: (_, row) => row.course?.course_name || row.course_name || '-' },
    { key: 'section_number', header: 'Section' },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (val) => val || 'TBA',
    },
    { key: 'credits', header: 'Credits', render: (_, row) => row.course?.credits ?? row.credits ?? '-' },
    {
      key: 'capacity',
      header: 'Seats',
      render: (_, row) => {
        const enrolled = Number(row.enrolled_count || 0);
        const max = Number(row.max_capacity || 0);
        const full = max > 0 && enrolled >= max;
        return (
          <Badge variant={full ? 'danger' : 'success'}>
            {enrolled}/{max}
          </Badge>
        );
      },
    },
    {
      key: 'faculty',
      header: 'Instructor',
      render: (_, row) => {
        const f = row.faculty?.user;
        if (!f) return 'TBA';
        return `${f.first_name || ''} ${f.last_name || ''}`.trim() || 'TBA';
      },
    },
    {
      key: 'action',
      header: '',
      render: (_, row) => {
        const full = Number(row.enrolled_count || 0) >= Number(row.max_capacity || 1);
        return (
          <Button
            size="sm"
            disabled={full || enrolling === row.section_id}
            isLoading={enrolling === row.section_id}
            onClick={() => handleEnroll(row)}
          >
            {full ? 'Full' : 'Enroll'}
          </Button>
        );
      },
    },
  ];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Catalog</h1>
            <p className="text-gray-600 mt-1">Browse open sections and enroll for the semester.</p>
          </div>
          <div className="w-72">
            <Select
              label="Semester"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              options={semesterOptions}
              placeholder="All semesters"
            />
          </div>
        </div>

        {error && <Alert type="error" title="Error" message={error} />}
        {success && <Alert type="success" title="Enrolled!" message={success} />}

        <Card title={`Available Sections${semesterFilter ? '' : ' — All Semesters'}`}>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <Table columns={columns} data={filtered} emptyMessage="No open sections found for this semester." />
          )}
        </Card>
      </div>
    </StudentLayout>
  );
};

export default CourseCatalog;
