import React, { useEffect, useMemo, useState } from 'react';
import FacultyLayout from '../../../components/layout/FacultyLayout';
import { Alert, Button, Card, Input, Select, Spinner, Table } from '../../../components/ui';
import enrollmentService from '../../../services/enrollmentService';
import gradeService from '../../../services/gradeService';

const numericToGrade = (score) => {
  const n = Number(score);
  if (Number.isNaN(n) || score === '') return { letter: '', points: null };
  if (n >= 93) return { letter: 'A',  points: 4.0 };
  if (n >= 90) return { letter: 'A-', points: 3.7 };
  if (n >= 87) return { letter: 'B+', points: 3.3 };
  if (n >= 83) return { letter: 'B',  points: 3.0 };
  if (n >= 80) return { letter: 'B-', points: 2.7 };
  if (n >= 77) return { letter: 'C+', points: 2.3 };
  if (n >= 73) return { letter: 'C',  points: 2.0 };
  if (n >= 70) return { letter: 'C-', points: 1.7 };
  if (n >= 67) return { letter: 'D+', points: 1.3 };
  if (n >= 63) return { letter: 'D',  points: 1.0 };
  if (n >= 60) return { letter: 'D-', points: 0.7 };
  return              { letter: 'F',  points: 0.0 };
};

const letterBadgeClass = (letter) => {
  if (!letter) return 'bg-gray-100 text-gray-400';
  const l = letter.toUpperCase();
  if (l.startsWith('A')) return 'bg-green-100 text-green-700';
  if (l.startsWith('B')) return 'bg-blue-100 text-blue-700';
  if (l.startsWith('C')) return 'bg-yellow-100 text-yellow-700';
  if (l.startsWith('D')) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
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
      const { letter, points } = numeric !== ''
        ? numericToGrade(numeric)
        : { letter: existing?.letter_grade ?? '', points: existing?.grade_points ?? null };
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
        grade_points: points,
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
        numeric_grade: row.numeric_grade === '' ? null : Number(row.numeric_grade),
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
            setDraftValue(row.enrollment_id, { numeric_grade: e.target.value });
          }}
          className="w-24"
        />
      ),
    },
    {
      key: 'letter_grade',
      header: 'Letter',
      render: (_, row) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold w-12 justify-center ${
            letterBadgeClass(row.letter_grade)
          }`}
        >
          {row.letter_grade || '—'}
        </span>
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

