import React, { useEffect, useMemo, useState } from 'react';
import StudentLayout from '../../../components/layout/StudentLayout';
import { Alert, Badge, Button, Card, Select, Spinner, Table } from '../../../components/ui';
import preRegistrationService from '../../../services/preRegistrationService';
import semesterService from '../../../services/semesterService';
import studentService from '../../../services/studentService';
import api from '../../../services/api';

const statusVariant = (status) => {
  switch (String(status).toLowerCase()) {
    case 'approved': return 'success';
    case 'pending': return 'warning';
    case 'denied': return 'danger';
    default: return 'default';
  }
};

const PreRegistration = () => {
  const [preRegs, setPreRegs] = useState([]);
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [studentId, setStudentId] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [preRes, semRes, secRes, profileRes] = await Promise.all([
        preRegistrationService.getAll(),
        semesterService.getAll({ limit: 100 }),
        api.get('/sections'),
        studentService.getAll({ limit: 1 }),
      ]);
      setPreRegs(Array.isArray(preRes?.data) ? preRes.data : []);
      const semList = Array.isArray(semRes?.data) ? semRes.data : [];
      setSemesters(semList);
      const future = semList.find((s) => !s.is_current);
      if (future) setSelectedSemester(String(future.semester_id));
      setSections(Array.isArray(secRes.data) ? secRes.data : secRes.data?.data || []);
      const student = Array.isArray(profileRes?.data) ? profileRes.data[0] : null;
      if (student?.student_id) setStudentId(student.student_id);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const semesterOptions = useMemo(
    () => semesters.map((s) => ({ value: String(s.semester_id), label: `${s.semester_name} ${s.semester_year}` })),
    [semesters]
  );

  const sectionOptions = useMemo(
    () =>
      sections
        .filter((s) => !selectedSemester || String(s.semester_id) === selectedSemester)
        .map((s) => ({
          value: String(s.section_id),
          label: `${s.course?.course_code || s.course_code || '-'} – ${s.course?.course_name || s.course_name || '-'} (Sec ${s.section_number || '-'})`,
        })),
    [sections, selectedSemester]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSection || !selectedSemester || !studentId) {
      setError('Please select a semester and a section.');
      return;
    }
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await preRegistrationService.create({
        student_id: studentId,
        section_id: Number(selectedSection),
        semester_id: Number(selectedSemester),
        status: 'pending',
      });
      setSuccess('Pre-registration submitted successfully!');
      setSelectedSection('');
      await loadData();
    } catch (err) {
      const msg = err?.message || err?.detail || 'Submission failed.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    try {
      await preRegistrationService.delete(id);
      setSuccess('Pre-registration cancelled.');
      setPreRegs((prev) => prev.filter((p) => p.pre_reg_id !== id));
    } catch (err) {
      setError(err?.message || 'Failed to cancel.');
    }
  };

  const columns = [
    { key: 'course_code', header: 'Code', render: (_, row) => row.course?.course_code || row.course_code || '-' },
    { key: 'course_name', header: 'Course', render: (_, row) => row.course?.course_name || row.course_name || '-' },
    { key: 'section_number', header: 'Section', render: (_, row) => row.section?.section_number || row.section_number || '-' },
    { key: 'semester', header: 'Semester', render: (_, row) => row.semester ? `${row.semester.semester_name} ${row.semester.semester_year}` : (row.semester_name || '-') },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <Badge variant={statusVariant(val)}>{val}</Badge>,
    },
    {
      key: 'action',
      header: '',
      render: (_, row) =>
        String(row.status).toLowerCase() === 'pending' ? (
          <Button size="sm" variant="danger" onClick={() => handleDelete(row.pre_reg_id)}>
            Cancel
          </Button>
        ) : null,
    },
  ];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pre-Registration</h1>
          <p className="text-gray-600 mt-1">Request enrollment in upcoming semester courses.</p>
        </div>

        {error && <Alert type="error" title="Error" message={error} />}
        {success && <Alert type="success" title="Success" message={success} />}

        {/* Submit form */}
        <Card title="Submit Pre-Registration Request">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <Select
                label="Semester"
                value={selectedSemester}
                onChange={(e) => { setSelectedSemester(e.target.value); setSelectedSection(''); }}
                options={semesterOptions}
                placeholder="Select semester"
                required
              />
            </div>
            <div className="flex-1">
              <Select
                label="Section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                options={sectionOptions}
                placeholder="Select section"
                required
              />
            </div>
            <Button type="submit" isLoading={submitting} disabled={submitting}>
              Submit Request
            </Button>
          </form>
        </Card>

        {/* List */}
        <Card title="My Pre-Registrations">
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <Table columns={columns} data={preRegs} emptyMessage="No pre-registration requests found." />
          )}
        </Card>
      </div>
    </StudentLayout>
  );
};

export default PreRegistration;
