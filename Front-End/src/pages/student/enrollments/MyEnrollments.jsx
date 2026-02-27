import React, { useEffect, useMemo, useState } from 'react';
import StudentLayout from '../../../components/layout/StudentLayout';
import { Alert, Badge, Card, Select, Spinner, Table } from '../../../components/ui';
import studentService from '../../../services/studentService';

const statusVariant = (status) => {
  switch (String(status).toLowerCase()) {
    case 'enrolled': return 'primary';
    case 'completed': return 'success';
    case 'dropped': return 'danger';
    case 'waitlisted': return 'warning';
    default: return 'default';
  }
};

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        // Get the student profile first to find student_id
        const profileRes = await studentService.getAll({ limit: 1 });
        const student = Array.isArray(profileRes?.data) ? profileRes.data[0] : null;
        if (!student?.student_id) {
          setEnrollments([]);
          return;
        }
        const res = await studentService.getEnrollments(student.student_id);
        setEnrollments(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load enrollments.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusOptions = useMemo(() => {
    const unique = [...new Set(enrollments.map((e) => e.status).filter(Boolean))];
    return unique.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));
  }, [enrollments]);

  const filtered = useMemo(
    () => (statusFilter ? enrollments.filter((e) => e.status === statusFilter) : enrollments),
    [enrollments, statusFilter]
  );

  const stats = useMemo(() => ({
    total: enrollments.length,
    enrolled: enrollments.filter((e) => String(e.status).toLowerCase() === 'enrolled').length,
    completed: enrollments.filter((e) => String(e.status).toLowerCase() === 'completed').length,
    credits: enrollments.reduce((sum, e) => sum + Number(e.credits || 0), 0),
  }), [enrollments]);

  const columns = [
    { key: 'course_code', header: 'Code' },
    { key: 'course_name', header: 'Course' },
    { key: 'semester', header: 'Semester' },
    { key: 'credits', header: 'Credits' },
    {
      key: 'grade',
      header: 'Grade',
      render: (val) => val || <span className="text-gray-400 text-xs">In Progress</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <Badge variant={statusVariant(val)}>{val}</Badge>,
    },
    {
      key: 'enrollment_date',
      header: 'Enrolled On',
      render: (val) => val ? new Date(val).toLocaleDateString() : '-',
    },
  ];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Enrollments</h1>
          <p className="text-gray-600 mt-1">All courses you are currently or previously enrolled in.</p>
        </div>

        {error && <Alert type="error" title="Error" message={error} />}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card><div className="text-sm text-gray-500">Total</div><div className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</div></Card>
          <Card><div className="text-sm text-gray-500">Enrolled</div><div className="text-3xl font-bold text-blue-600 mt-1">{stats.enrolled}</div></Card>
          <Card><div className="text-sm text-gray-500">Completed</div><div className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</div></Card>
          <Card><div className="text-sm text-gray-500">Total Credits</div><div className="text-3xl font-bold text-purple-600 mt-1">{stats.credits}</div></Card>
        </div>

        <Card
          title="Enrollment History"
          actions={
            <div className="w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
                placeholder="All statuses"
              />
            </div>
          }
        >
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <Table columns={columns} data={filtered} emptyMessage="No enrollments found." />
          )}
        </Card>
      </div>
    </StudentLayout>
  );
};

export default MyEnrollments;
