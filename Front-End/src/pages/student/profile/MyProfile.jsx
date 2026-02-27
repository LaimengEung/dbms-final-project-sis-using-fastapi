import React, { useEffect, useState } from 'react';
import StudentLayout from '../../../components/layout/StudentLayout';
import { Alert, Card, Spinner } from '../../../components/ui';
import studentService from '../../../services/studentService';

const CLASSIFICATION_LABEL = { 1: 'Freshman', 2: 'Sophomore', 3: 'Junior', 4: 'Senior' };

const MyProfile = () => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await studentService.getAll({ limit: 1 });
        const s = Array.isArray(res?.data) && res.data.length > 0 ? res.data[0] : null;
        setStudent(s);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const field = (label, value) => (
    <div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-sm text-gray-900">{value || '—'}</div>
    </div>
  );

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      </StudentLayout>
    );
  }

  if (!student) {
    return (
      <StudentLayout>
        <Alert type="warning" title="Profile Not Found" message="No student profile is linked to your account. Please contact the registrar." />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Your student information on record.</p>
        </div>

        {error && <Alert type="error" title="Error" message={error} />}

        {/* Personal Information (read-only) */}
        <Card title="Personal Information">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {field('First Name', student.first_name)}
            {field('Last Name', student.last_name)}
            {field('Email', student.email)}
          </div>
          <p className="mt-4 text-xs text-gray-400">To update your personal information, please contact the registrar's office.</p>
        </Card>

        {/* Academic Info (read-only) */}
        <Card title="Academic Information">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {field('Student Number', student.student_number)}
            {field('Classification', CLASSIFICATION_LABEL[student.classification] || student.classification)}
            {field('Major', student.major_name || 'Undeclared')}
            {field('GPA', typeof student.gpa === 'number' ? student.gpa.toFixed(2) : student.gpa)}
            {field('Academic Standing', student.academic_standing)}
            {field('Credits Earned', student.credits_earned)}
            {field('Admission Date', student.admission_date ? new Date(student.admission_date).toLocaleDateString() : '—')}
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default MyProfile;
