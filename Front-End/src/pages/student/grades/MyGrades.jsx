import React, { useEffect, useMemo, useState } from 'react';
import StudentLayout from '../../../components/layout/StudentLayout';
import { Alert, Badge, Card, Spinner, Table } from '../../../components/ui';
import studentService from '../../../services/studentService';

const gradeVariant = (letter) => {
  switch (String(letter).toUpperCase()) {
    case 'A': return 'success';
    case 'B': return 'primary';
    case 'C': return 'info';
    case 'D': return 'warning';
    case 'F': return 'danger';
    default: return 'default';
  }
};

const MyGrades = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const profileRes = await studentService.getAll({ limit: 1 });
        const student = Array.isArray(profileRes?.data) ? profileRes.data[0] : null;
        if (!student?.student_id) { setEnrollments([]); return; }
        const res = await studentService.getEnrollments(student.student_id);
        setEnrollments(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load grades.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const graded = useMemo(() => enrollments.filter((e) => e.grade), [enrollments]);

  const gpa = useMemo(() => {
    const POINTS = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 };
    let totalPoints = 0, totalCredits = 0;
    for (const e of graded) {
      const pts = POINTS[String(e.grade || '').toUpperCase()];
      const cr = Number(e.credits || 0);
      if (pts !== undefined && cr > 0) {
        totalPoints += pts * cr;
        totalCredits += cr;
      }
    }
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—';
  }, [graded]);

  const columns = [
    { key: 'course_code', header: 'Code' },
    { key: 'course_name', header: 'Course' },
    { key: 'semester', header: 'Semester' },
    { key: 'credits', header: 'Credits' },
    {
      key: 'grade',
      header: 'Grade',
      render: (val) =>
        val ? (
          <Badge variant={gradeVariant(val)} size="large">{val}</Badge>
        ) : (
          <span className="text-gray-400 text-xs italic">In Progress</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => (
        <span className={`text-xs font-medium ${String(val).toLowerCase() === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>
          {val}
        </span>
      ),
    },
  ];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
          <p className="text-gray-600 mt-1">Academic performance across all your coursework.</p>
        </div>

        {error && <Alert type="error" title="Error" message={error} />}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <div className="text-sm text-gray-500">Current GPA</div>
            <div className="text-4xl font-bold text-blue-600 mt-1">{gpa}</div>
            <div className="text-xs text-gray-400 mt-1">Based on graded courses</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500">Graded Courses</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{graded.length}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500">Total Courses</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{enrollments.length}</div>
          </Card>
        </div>

        <Card title="Transcript" subtitle="All courses and grades">
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <Table columns={columns} data={enrollments} emptyMessage="No grade records found." />
          )}
        </Card>
      </div>
    </StudentLayout>
  );
};

export default MyGrades;
