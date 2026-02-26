import React, { useEffect, useMemo, useState } from 'react';
import StudentLayout from '../../../components/layout/StudentLayout';
import { Alert, Badge, Card, Spinner, Table } from '../../../components/ui';
import studentService from '../../../services/studentService';
import EmptyState from '../../../components/shared/EmptyState';

const DashboardStudent = () => {
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [error, setError] = useState('');
  const [enrollmentError, setEnrollmentError] = useState('');

  const selectedStudent = useMemo(() => (students.length ? students[0] : null), [students]);
  const selectedStudentId = selectedStudent ? String(selectedStudent.student_id) : '';

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await studentService.getAll({ limit: 1 });
        const list = Array.isArray(response?.data) ? response.data : [];
        setStudents(list);
      } catch (err) {
        console.error('Failed to load student profile:', err);
        setError(err?.response?.data?.message || 'Failed to load your student profile.');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  useEffect(() => {
    const loadEnrollments = async () => {
      if (!selectedStudentId) {
        setEnrollments([]);
        setEnrollmentError('');
        return;
      }
      try {
        setLoadingEnrollments(true);
        setEnrollmentError('');
        const response = await studentService.getEnrollments(selectedStudentId);
        setEnrollments(Array.isArray(response?.data) ? response.data : []);
      } catch (err) {
        console.error('Failed to load enrollments:', err);
        setEnrollments([]);
        setEnrollmentError(err?.response?.data?.message || 'Failed to load enrollments.');
      } finally {
        setLoadingEnrollments(false);
      }
    };

    loadEnrollments();
  }, [selectedStudentId]);

  const stats = useMemo(() => {
    const totalCourses = enrollments.length;
    const completed = enrollments.filter((e) => String(e.status).toLowerCase() === 'completed').length;
    const active = enrollments.filter((e) => String(e.status).toLowerCase() === 'enrolled').length;
    const totalCredits = enrollments.reduce((sum, e) => sum + Number(e.credits || 0), 0);
    return { totalCourses, completed, active, totalCredits };
  }, [enrollments]);

  const enrollmentColumns = [
    { key: 'course_name', header: 'Course' },
    { key: 'semester', header: 'Semester' },
    { key: 'credits', header: 'Credits' },
    {
      key: 'grade',
      header: 'Grade',
      render: (value) => value || 'In Progress',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <Badge color={String(value).toLowerCase() === 'completed' ? 'green' : 'blue'}>{value}</Badge>,
    },
  ];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your courses, credits, and current enrollment status.</p>
        </div>

        {error && <Alert type="error" title="Dashboard Error" message={error} />}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <Card>
              {selectedStudent ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-900">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </div>
                  <div className="text-sm text-gray-600">{selectedStudent.email}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Student #{selectedStudent.student_number} | Major: {selectedStudent.major_name || 'Undeclared'}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="No student profile found"
                  description="Your account is active, but no student profile is linked yet. Contact the admin."
                  className="py-6"
                />
              )}
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <Card>
                <div className="text-sm text-gray-500">Total Courses</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{stats.totalCourses}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-500">Active Enrollments</div>
                <div className="text-3xl font-bold text-blue-600 mt-1">{stats.active}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-500">Completed</div>
                <div className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-500">Total Credits</div>
                <div className="text-3xl font-bold text-purple-600 mt-1">{stats.totalCredits}</div>
              </Card>
            </div>

            <Card title="My Enrollments" subtitle="Courses and grade progress">
              {enrollmentError && (
                <div className="mb-4">
                  <Alert type="error" title="Enrollment Error" message={enrollmentError} />
                </div>
              )}
              {loadingEnrollments ? (
                <div className="py-12 flex justify-center">
                  <Spinner />
                </div>
              ) : enrollments.length === 0 ? (
                <EmptyState
                  title="No enrollments yet"
                  description="You have not enrolled in any section yet."
                  className="py-8"
                />
              ) : (
                <Table columns={enrollmentColumns} data={enrollments} />
              )}
            </Card>
          </>
        )}
      </div>
    </StudentLayout>
  );
};

export default DashboardStudent;
