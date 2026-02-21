import React from 'react';
import { Table, Button } from '../../../../components/ui';
import EnrollmentStatusBadge from './EnrollmentStatusBadge';

const EnrollmentTable = ({ enrollments, onView, onEdit, onDelete, onStatusChange }) => {
  const columns = [
    {
      header: 'Student',
      accessor: 'student',
      cell: (row) => (
        <div>
          <div className="font-medium">
            {row.student?.user?.first_name} {row.student?.user?.last_name}
          </div>
          <div className="text-sm text-gray-500">{row.student?.student_number}</div>
        </div>
      )
    },
    {
      header: 'Course',
      accessor: 'course',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.section?.course?.course_code}</div>
          <div className="text-sm text-gray-500">{row.section?.course?.course_name}</div>
        </div>
      )
    },
    {
      header: 'Section',
      accessor: 'section',
      cell: (row) => `Sec ${row.section?.section_number}`
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <EnrollmentStatusBadge status={row.status} />
          <select
            value={row.status}
            onChange={(e) => onStatusChange(row.enrollment_id, e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="enrolled">Enrolled</option>
            <option value="dropped">Dropped</option>
            <option value="withdrawn">Withdrawn</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )
    },
    {
      header: 'Date',
      accessor: 'enrollment_date',
      cell: (row) => new Date(row.enrollment_date).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => onView(row.enrollment_id)}>
            View
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(row.enrollment_id)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(row.enrollment_id)}>
            Drop
          </Button>
        </div>
      )
    }
  ];

  return <Table data={enrollments} columns={columns} />;
};

export default EnrollmentTable;
