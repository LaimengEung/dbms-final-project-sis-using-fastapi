import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FacultyLayout from '../../../components/layout/FacultyLayout';
import { Alert, Button, Card, Spinner, Table } from '../../../components/ui';
import enrollmentService from '../../../services/enrollmentService';

const DashboardFaculty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await enrollmentService.getAll({ limit: 200 });
        setEnrollments(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setError(err?.message || 'Failed to load faculty dashboard data.');
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
      if (!map.has(sec.section_id)) {
        map.set(sec.section_id, {
          section_id: sec.section_id,
          course_code: sec.course?.course_code || '-',
          course_name: sec.course?.course_name || '-',
          section_number: sec.section_number || '-',
          schedule: sec.schedule || 'TBA',
          semester: sec.semester ? `${sec.semester.semester_name} ${sec.semester.semester_year}` : '-',
          enrolled_count: Number(sec.enrolled_count || 0),
          max_capacity: Number(sec.max_capacity || 0),
        });
      }
    }
    return Array.from(map.values());
  }, [enrollments]);

  const stats = useMemo(() => {
    const totalSections = sections.length;
    const totalStudents = sections.reduce((sum, s) => sum + Number(s.enrolled_count || 0), 0);
    const utilization = sections.length
      ? Math.round(
          (sections.reduce((sum, s) => sum + (Number(s.max_capacity || 0) ? Number(s.enrolled_count || 0) / Number(s.max_capacity || 1) : 0), 0) /
            sections.length) *
            100
        )
      : 0;
    return { totalSections, totalStudents, utilization };
  }, [sections]);

  const sectionColumns = [
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
  ];

  return (
    <FacultyLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Overview of your assigned sections and enrollment activity.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/faculty/mySchedule')}>
              View Schedule
            </Button>
            <Button onClick={() => navigate('/faculty/gradeManagement')}>Manage Grades</Button>
          </div>
        </div>

        {error && <Alert type="error" title="Dashboard Error" message={error} />}

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <p className="text-sm text-gray-500">Assigned Sections</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalSections}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-500">Total Enrolled Students</p>
                <p className="mt-1 text-3xl font-bold text-blue-600">{stats.totalStudents}</p>
              </Card>
              <Card>
                <p className="text-sm text-gray-500">Average Capacity Use</p>
                <p className="mt-1 text-3xl font-bold text-emerald-600">{stats.utilization}%</p>
              </Card>
            </div>

            <Card title="Assigned Sections" subtitle="Sections currently linked to your faculty account">
              <Table columns={sectionColumns} data={sections} emptyMessage="No sections assigned yet." />
            </Card>
          </>
        )}
      </div>
    </FacultyLayout>
  );
};

export default DashboardFaculty;

