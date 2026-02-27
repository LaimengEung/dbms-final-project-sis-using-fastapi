import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, X } from 'lucide-react';
import FacultyLayout from '../../../components/layout/FacultyLayout';
import { Alert, Button, Card, Select, Spinner, Table } from '../../../components/ui';
import enrollmentService from '../../../services/enrollmentService';

const statusBadge = (status) => {
  const map = {
    enrolled:  'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    dropped:   'bg-red-100 text-red-700',
    withdrawn: 'bg-gray-100 text-gray-600',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>
      {status || '-'}
    </span>
  );
};

const MyCourses = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('');

  // Roster panel state
  const [rosterSection, setRosterSection] = useState(null); // { section_id, course_code, course_name, section_number, semester }

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

  // Build roster from already-loaded enrollments — no extra API call needed
  const rosterStudents = useMemo(() => {
    if (!rosterSection) return [];
    return enrollments
      .filter((e) => String(e?.section?.section_id) === String(rosterSection.section_id))
      .map((e) => ({
        enrollment_id: e.enrollment_id,
        student_number: e.student?.student_number || '-',
        name: `${e.student?.user?.first_name || ''} ${e.student?.user?.last_name || ''}`.trim() || '-',
        classification: e.student?.classification || '-',
        major: e.student?.major?.major_name || '-',
        status: e.status || '-',
      }));
  }, [rosterSection, enrollments]);

  const openRoster = (row) => {
    setRosterSection((prev) =>
      prev?.section_id === row.section_id ? null : row
    );
  };

  const rosterColumns = [
    { key: 'student_number', header: 'Student ID' },
    { key: 'name', header: 'Name' },
    { key: 'classification', header: 'Year', render: (v) => <span className="capitalize">{v}</span> },
    { key: 'major', header: 'Major' },
    { key: 'status', header: 'Status', render: (v) => statusBadge(v) },
  ];

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
      header: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={rosterSection?.section_id === row.section_id ? 'primary' : 'secondary'}
            onClick={() => openRoster(row)}
          >
            <Users size={14} className="mr-1 inline" />
            {rosterSection?.section_id === row.section_id ? 'Hide Roster' : 'View Students'}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate('/faculty/gradeManagement')}>
            Grade Panel
          </Button>
        </div>
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

        {/* ── Student Roster Panel ───────────────────────────────────────── */}
        {rosterSection && (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Student Roster — {rosterSection.course_code} Sec {rosterSection.section_number}
                </h2>
                <p className="text-sm text-gray-500">
                  {rosterSection.course_name} &middot; {rosterSection.semester}
                </p>
              </div>
              <button
                onClick={() => setRosterSection(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {rosterStudents.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">No students enrolled in this section.</p>
            ) : (
              <>
                <p className="mb-3 text-sm text-gray-500">{rosterStudents.length} student{rosterStudents.length !== 1 ? 's' : ''} enrolled</p>
                <Table columns={rosterColumns} data={rosterStudents} emptyMessage="No students found." />
              </>
            )}
          </Card>
        )}
      </div>
    </FacultyLayout>
  );
};

export default MyCourses;
