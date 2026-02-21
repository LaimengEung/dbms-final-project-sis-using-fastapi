import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Spinner, Pagination } from '../../../components/ui';
import EnrollmentTable from './components/EnrollmentTable';
import BulkEnrollmentModal from './components/BulkEnrollmentModal';
import enrollmentService from '../../../services/enrollmentService';

const EnrollmentList = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    semester_id: '',
    section_id: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [filters, pagination.page]);

  const fetchSemesters = async () => {
    try {
      const response = await enrollmentService.getSemesters();
      setSemesters(response.data || []);
    } catch (error) {
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      setEnrollments(response.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 0
      });
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSuccess = () => {
    setBulkModalOpen(false);
    fetchEnrollments();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollments</h1>
          <p className="text-gray-600">Manage student course registrations</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => setBulkModalOpen(true)}
          >
            Bulk Enroll
          </Button>
          <Button onClick={() => navigate('/admin/enrollments/create')}>
            New Enrollment
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <EnrollmentTable 
            enrollments={enrollments}
            onView={(id) => navigate(`/admin/enrollments/${id}`)}
            onEdit={(id) => navigate(`/admin/enrollments/edit/${id}`)}
          />
          
          {pagination.totalPages > 1 && (
            <div className="mt-4">
              <Pagination 
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              />
            </div>
          )}
        </>
      )}

      <BulkEnrollmentModal 
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
        onSuccess={handleBulkSuccess}
        semesters={semesters}
      />
    </div>
  );
};

export default EnrollmentList;  // ✅ DEFAULT EXPORT - CRITICAL!