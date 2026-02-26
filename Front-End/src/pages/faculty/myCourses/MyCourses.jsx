import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../../../components/layout/FacultyLayout';
import { Alert, Button, Card, Select, Spinner, Table } from '../../../components/ui';
import enrollmentService from '../../../services/enrollmentService';

const MyCourses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await enrollmentService.getAll({ limit: 300 });
        setEnrollments(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setError(err?.message || 'Failed to load assigned courses.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sections = useMemo(() => {
    const map = new Map();
    for (const e of enrollments) {
      const sec = e?.section;
      if (!sec?.section_id) continue;
      const semesterLabel = sec.semester ? `${sec.semester.semester_name} ${sec.semester.semester_year}` : '-';
      if (!map.has(sec.section_id)) {
        map.set(sec.section_id, {
          section_id: sec.section_id,
          course_code: sec.course?.course_code || '-',
          course_name: sec.course?.course_name || '-',
          section_number: sec.section_number || '-',
          schedule: sec.schedule || 'TBA',
          semester: semesterLabel,
          enrolled_count: Number(sec.enrolled_count || 0),
          max_capacity: Number(sec.max_capacity || 0),
        });
      }
    }
    return Array.from(map.values());
  }, [enrollments]);

  const semesterOptions = useMemo(() => {
    const unique = [...new Set(sections.map((s) => s.semester).filter(Boolean))];
    return unique.map((label) => ({ value: label, label }));
  }, [sections]);

  const filtered = useMemo(
    () => (semesterFilter ? sections.filter((s) => s.semester === semesterFilter) : sections),
    [sections, semesterFilter]
  );

  const columns = [
    { key: 'course_code', header: 'Course Code' },
    { key: 'course_name', header: 'Course' },
    { key: 'section_number', header: 'Section' },
    { key: 'semester', header: 'Semester' },
    { key: 'schedule', header: 'Schedule' },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (_, row) => `${row.enrolled_count}/${row.max_capacity}`,
    },
    {
      key: 'action',
      header: 'Action',
      render: (_, row) => (
        <Button size="sm" variant="secondary" onClick={() => navigate('/faculty/gradeManagement')}>
          Open Grade Panel
        </Button>
      ),
    },
  ];

  return (
    <FacultyLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <p className="mt-1 text-sm text-gray-600">Assigned sections and enrollment load.</p>
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

        {error && <Alert type="error" title="Courses Error" message={error} />}

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <Card>
            <Table columns={columns} data={filtered} emptyMessage="No assigned sections found." />
          </Card>
        )}
      </div>
    </FacultyLayout>
  );
};

export default MyCourses;
