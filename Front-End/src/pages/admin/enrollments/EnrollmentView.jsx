import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Spinner, Badge } from '../../../components/ui';
import EnrollmentStatusBadge from './components/EnrollmentStatusBadge';
import enrollmentService from '../../../services/enrollmentService';

const EnrollmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentService.getById(id)
      .then(res => setEnrollment(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (e) => {
    if (window.confirm(`Change status to ${e.target.value}?`)) {
      await enrollmentService.updateStatus(id, e.target.value);
      const res = await enrollmentService.getById(id);
      setEnrollment(res.data);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Drop this enrollment?')) {
      await enrollmentService.delete(id);
      navigate('/admin/enrollments');
    }
  };

  if (loading) return <div className="p-6"><Spinner /></div>;
  if (!enrollment) return <div className="p-6">Enrollment not found</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/enrollments')}>← Back</Button>
          <h1 className="text-2xl font-bold">Enrollment Details</h1>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate(`/admin/enrollments/edit/${id}`)}>
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Drop
          </Button>
        </div>
      </div>

      {/* Student Info */}
      <Card className="p-6">
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {enrollment.student?.user?.first_name} {enrollment.student?.user?.last_name}
            </h2>
            <p className="text-gray-600">ID: {enrollment.student?.student_number}</p>
            <p className="text-gray-600">Major: {enrollment.student?.major?.major_name}</p>
            <p className="text-gray-600">GPA: {enrollment.student?.gpa || 'N/A'}</p>
          </div>
          <EnrollmentStatusBadge status={enrollment.status} />
        </div>
      </Card>

      {/* Course Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Course Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Course</p>
            <p className="font-medium">{enrollment.section?.course?.course_code} - {enrollment.section?.course?.course_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Section</p>
            <p>{enrollment.section?.section_number}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Instructor</p>
            <p>{enrollment.section?.faculty?.user?.first_name} {enrollment.section?.faculty?.user?.last_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Schedule</p>
            <p>{enrollment.section?.schedule || 'TBA'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Semester</p>
            <p>{enrollment.section?.semester?.semester_name} {enrollment.section?.semester?.semester_year}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Enrolled</p>
            <p>{new Date(enrollment.enrollment_date).toLocaleDateString()}</p>
          </div>
        </div>
      </Card>

      {/* Status Update */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Update Status</h3>
        <select
          value={enrollment.status}
          onChange={handleStatusChange}
          className="border rounded px-3 py-2"
        >
          <option value="enrolled">Enrolled</option>
          <option value="dropped">Dropped</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="completed">Completed</option>
        </select>
      </Card>
    </div>
  );
};

export default EnrollmentView;