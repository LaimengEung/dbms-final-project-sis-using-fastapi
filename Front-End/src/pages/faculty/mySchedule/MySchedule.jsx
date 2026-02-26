import React, { useEffect, useMemo, useState } from 'react';
import FacultyLayout from '../../../components/layout/FacultyLayout';
import { Alert, Card, Spinner, Table } from '../../../components/ui';
import enrollmentService from '../../../services/enrollmentService';

const MySchedule = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await enrollmentService.getAll({ limit: 300 });
        setEnrollments(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setError(err?.message || 'Failed to load schedule.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const scheduleRows = useMemo(() => {
    const map = new Map();
    for (const e of enrollments) {
      const sec = e?.section;
      if (!sec?.section_id || map.has(sec.section_id)) continue;
      map.set(sec.section_id, {
        section_id: sec.section_id,
        course_code: sec.course?.course_code || '-',
        course_name: sec.course?.course_name || '-',
        section: sec.section_number || '-',
        semester: sec.semester ? `${sec.semester.semester_name} ${sec.semester.semester_year}` : '-',
        schedule: sec.schedule || 'TBA',
        capacity: `${sec.enrolled_count || 0}/${sec.max_capacity || 0}`,
      });
    }
    return Array.from(map.values());
  }, [enrollments]);

  const columns = [
    { key: 'course_code', header: 'Course Code' },
    { key: 'course_name', header: 'Course' },
    { key: 'section', header: 'Section' },
    { key: 'semester', header: 'Semester' },
    { key: 'schedule', header: 'Schedule' },
    { key: 'capacity', header: 'Capacity' },
  ];

  return (
    <FacultyLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="mt-1 text-sm text-gray-600">Your assigned teaching sections by semester.</p>
        </div>

        {error && <Alert type="error" title="Schedule Error" message={error} />}

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <Card>
            <Table columns={columns} data={scheduleRows} emptyMessage="No schedule assigned yet." />
          </Card>
        )}
      </div>
    </FacultyLayout>
  );
};

export default MySchedule;

