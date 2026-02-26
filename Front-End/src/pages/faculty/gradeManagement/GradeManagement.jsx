import React, { useEffect, useMemo, useState } from 'react';
import FacultyLayout from '../../../components/layout/FacultyLayout';
import { Alert, Button, Card, Input, Select, Spinner, Table } from '../../../components/ui';
import enrollmentService from '../../../services/enrollmentService';
import gradeService from '../../../services/gradeService';

const letterFromNumeric = (score) => {
  const n = Number(score);
  if (Number.isNaN(n)) return '';
  if (n >= 90) return 'A';
  if (n >= 80) return 'B';
  if (n >= 70) return 'C';
  if (n >= 60) return 'D';
  return 'F';
};

const GradeManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [gradeMap, setGradeMap] = useState({});
  const [sectionFilter, setSectionFilter] = useState('');
  const [drafts, setDrafts] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [enrollmentRes, gradeRes] = await Promise.all([
          enrollmentService.getAll({ limit: 400 }),
          gradeService.getAll(),
        ]);
        const enrollmentData = Array.isArray(enrollmentRes?.data) ? enrollmentRes.data : [];
        const gradeData = Array.isArray(gradeRes?.data) ? gradeRes.data : [];
        const byEnrollment = {};
        for (const g of gradeData) byEnrollment[g.enrollment_id] = g;
        setEnrollments(enrollmentData);
        setGradeMap(byEnrollment);
      } catch (err) {
        setError(err?.message || 'Failed to load grade management data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sectionOptions = useMemo(() => {
    const map = new Map();
    for (const e of enrollments) {
      const s = e?.section;
      if (!s?.section_id || map.has(s.section_id)) continue;
      map.set(s.section_id, {
        value: String(s.section_id),
        label: `${s.course?.course_code || '-'} Sec ${s.section_number || '-'} (${s.semester?.semester_name || ''} ${s.semester?.semester_year || ''})`,
      });
    }
    return Array.from(map.values());
  }, [enrollments]);

  const rows = useMemo(() => {
    const filtered = sectionFilter
      ? enrollments.filter((e) => String(e?.section?.section_id) === String(sectionFilter))
      : enrollments;

    return filtered.map((e) => {
      const existing = gradeMap[e.enrollment_id];
      const draft = drafts[e.enrollment_id] || {};
      const numeric = draft.numeric_grade ?? existing?.numeric_grade ?? '';
      const letter = draft.letter_grade ?? existing?.letter_grade ?? (numeric !== '' ? letterFromNumeric(numeric) : '');
      return {
        enrollment_id: e.enrollment_id,
        student_name: `${e.student?.user?.first_name || ''} ${e.student?.user?.last_name || ''}`.trim(),
        student_number: e.student?.student_number || '-',
        course: `${e.section?.course?.course_code || '-'} - ${e.section?.course?.course_name || '-'}`,
        section: e.section?.section_number || '-',
        semester: e.section?.semester ? `${e.section.semester.semester_name} ${e.section.semester.semester_year}` : '-',
        grade_id: existing?.grade_id || null,
        semester_id: existing?.semester_id || e.section?.semester?.semester_id || null,
        numeric_grade: numeric,
        letter_grade: letter,
      };
    });
  }, [enrollments, gradeMap, drafts, sectionFilter]);

  const setDraftValue = (enrollmentId, patch) => {
    setDrafts((prev) => ({ ...prev, [enrollmentId]: { ...(prev[enrollmentId] || {}), ...patch } }));
  };

  const handleSave = async (row) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = {
        enrollment_id: Number(row.enrollment_id),
        letter_grade: row.letter_grade || letterFromNumeric(row.numeric_grade),
        numeric_grade: row.numeric_grade === '' ? null : Number(row.numeric_grade),
        grade_points: null,
        semester_id: row.semester_id || null,
      };

      let res;
      if (row.grade_id) {
        res = await gradeService.update(row.grade_id, payload);
      } else {
        res = await gradeService.create(payload);
      }

      const saved = res?.data || {};
      setGradeMap((prev) => ({ ...prev, [row.enrollment_id]: saved }));
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[row.enrollment_id];
        return next;
      });
      setMessage('Grade saved successfully.');
    } catch (err) {
      setError(err?.message || 'Failed to save grade.');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'student_name', header: 'Student' },
    { key: 'student_number', header: 'Student No.' },
    { key: 'course', header: 'Course' },
    { key: 'section', header: 'Section' },
    {
      key: 'numeric_grade',
      header: 'Numeric',
      render: (_, row) => (
        <Input
          type="number"
          min="0"
          max="100"
          value={row.numeric_grade}
          onChange={(e) => {
            const numeric = e.target.value;
            setDraftValue(row.enrollment_id, {
              numeric_grade: numeric,
              letter_grade: numeric === '' ? '' : letterFromNumeric(numeric),
            });
          }}
          className="w-24"
        />
      ),
    },
    {
      key: 'letter_grade',
      header: 'Letter',
      render: (_, row) => (
        <Select
          value={row.letter_grade || ''}
          onChange={(e) => setDraftValue(row.enrollment_id, { letter_grade: e.target.value })}
          options={[
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'C', label: 'C' },
            { value: 'D', label: 'D' },
            { value: 'F', label: 'F' },
          ]}
          className="w-24"
        />
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (_, row) => (
        <Button size="sm" onClick={() => handleSave(row)} disabled={saving}>
          Save
        </Button>
      ),
    },
  ];

  return (
    <FacultyLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grade Management</h1>
            <p className="mt-1 text-sm text-gray-600">Enter and update grades for students in your assigned sections.</p>
          </div>
          <div className="w-96">
            <Select
              label="Section Filter"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              options={sectionOptions}
              placeholder="All sections"
            />
          </div>
        </div>

        {error && <Alert type="error" title="Grade Error" message={error} />}
        {message && <Alert type="success" title="Success" message={message} />}

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <Card>
            <Table columns={columns} data={rows} emptyMessage="No enrollments found for grading." />
          </Card>
        )}
      </div>
    </FacultyLayout>
  );
};

export default GradeManagement;

