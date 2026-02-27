import React, { useEffect, useMemo, useState } from 'react';
import StudentLayout from '../../../components/layout/StudentLayout';
import { Alert, Badge, Card, Select, Spinner, Table } from '../../../components/ui';
import semesterService from '../../../services/semesterService';
import api from '../../../services/api';

const CourseCatalog = () => {
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [semRes, secRes] = await Promise.all([
          semesterService.getAll({ limit: 100 }),
          api.get('/sections'),
        ]);

        const semList = Array.isArray(semRes?.data) ? semRes.data : [];
        setSemesters(semList);

        // Pre-select current semester
        const current = semList.find((s) => s.is_current);
        if (current) setSemesterFilter(String(current.semester_id));

        const secList = Array.isArray(secRes.data) ? secRes.data : secRes.data?.data || [];
        setSections(secList);
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Failed to load course catalog.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const semesterOptions = useMemo(
    () => semesters.map((s) => ({ value: String(s.semester_id), label: `${s.semester_name} ${s.semester_year}` })),
    [semesters]
  );

  const filtered = useMemo(
    () =>
      semesterFilter
        ? sections.filter((s) => String(s.semester_id) === semesterFilter)
        : sections,
    [sections, semesterFilter]
  );

  const columns = [
    { key: 'course_code', header: 'Code', render: (_, row) => row.course?.course_code || row.course_code || '-' },
    { key: 'course_name', header: 'Course', render: (_, row) => row.course?.course_name || row.course_name || '-' },
    { key: 'section_number', header: 'Section' },
    { key: 'schedule', header: 'Schedule', render: (val) => val || 'TBA' },
    { key: 'credits', header: 'Credits', render: (_, row) => row.course?.credits ?? row.credits ?? '-' },
    {
      key: 'capacity',
      header: 'Seats',
      render: (_, row) => {
        const enrolled = Number(row.enrolled_count || 0);
        const max = Number(row.max_capacity || 0);
        const full = max > 0 && enrolled >= max;
        return (
          <Badge variant={full ? 'danger' : 'success'}>
            {enrolled}/{max}
          </Badge>
        );
      },
    },
    {
      key: 'faculty',
      header: 'Instructor',
      render: (_, row) => {
        const f = row.faculty?.user;
        if (!f) return 'TBA';
        return `${f.first_name || ''} ${f.last_name || ''}`.trim() || 'TBA';
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => {
        const full = Number(row.enrolled_count || 0) >= Number(row.max_capacity || 1);
        const status = full ? 'Full' : (row.status || 'open');
        const color = status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${color}`}>
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Catalog</h1>
            <p className="text-gray-600 mt-1">Browse available sections for the current semester.</p>
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

        {error && <Alert type="error" title="Error" message={error} />}

        <Card title={`Available Sections${semesterFilter ? '' : ' — All Semesters'}`}>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <Table columns={columns} data={filtered} emptyMessage="No open sections found for this semester." />
          )}
        </Card>
      </div>
    </StudentLayout>
  );
};

export default CourseCatalog;
