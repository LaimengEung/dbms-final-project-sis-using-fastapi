import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Spinner, Button } from '../../../components/ui';
import EnrollmentForm from './components/EnrollmentForm';
import enrollmentService from '../../../services/enrollmentService';

const EnrollmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enrollment, setEnrollment] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      enrollmentService.getById(id),
      enrollmentService.getSemesters()
    ]).then(([enrollmentRes, semestersRes]) => {
      setEnrollment(enrollmentRes.data);
      setSemesters(semestersRes.data || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (data) => {
    setSubmitting(true);
    try {
      await enrollmentService.update(id, data);
      navigate('/admin/enrollments', { state: { message: 'Enrollment updated!' } });
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6"><Spinner /></div>;
  if (!enrollment) return <div className="p-6">Enrollment not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Enrollment</h1>
      <Card className="p-6">
        <EnrollmentForm 
          initialData={enrollment}
          onSubmit={handleSubmit}
          isLoading={submitting}
          semesters={semesters}
          isEdit={true}
        />
      </Card>
    </div>
  );
};

export default EnrollmentEdit;