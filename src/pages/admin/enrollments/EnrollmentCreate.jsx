import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui';
import EnrollmentForm from './components/EnrollmentForm';
import enrollmentService from '../../../services/enrollmentService';

const EnrollmentCreate = () => {
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    enrollmentService.getSemesters().then(res => setSemesters(res.data || []));
  }, []);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await enrollmentService.create(data);
      navigate('/admin/enrollments', { state: { message: 'Enrollment created!' } });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">New Enrollment</h1>
      <Card className="p-6">
        <EnrollmentForm 
          onSubmit={handleSubmit}
          isLoading={loading}
          semesters={semesters}
        />
      </Card>
    </div>
  );
};

export default EnrollmentCreate;