import React, { useEffect, useState } from 'react';
import FacultyLayout from '../../../components/layout/FacultyLayout';
import { Alert, Card, Spinner } from '../../../components/ui';
import RequestTable from './components/RequestTable';
import preRegistrationService from '../../../services/preRegistrationService';

const StudentRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || '{}');
    } catch {
      return {};
    }
  })();

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await preRegistrationService.getAll();
      const raw = res?.data || [];
      const mapped = raw.map((r) => ({
        id: r.pre_reg_id,
        requestId: `PR-${String(r.pre_reg_id).padStart(5, '0')}`,
        studentName: `Student #${r.student_id}`,
        studentId: `STU-${r.student_id}`,
        avatarUrl: null,
        type: `Pre-registration (Section ${r.section_id})`,
        dateSubmitted: r.requested_date ? new Date(r.requested_date).toLocaleDateString() : '-',
        status: String(r.status || 'pending'),
        raw: r,
      }));
      setRequests(mapped);
    } catch (err) {
      setError(err?.message || 'Failed to load student requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (req, status) => {
    try {
      setError('');
      setMessage('');
      await preRegistrationService.update(req.raw.pre_reg_id, {
        student_id: req.raw.student_id,
        section_id: req.raw.section_id,
        semester_id: req.raw.semester_id,
        status,
        approved_by: currentUser.user_id || null,
        approved_date: new Date().toISOString().slice(0, 10),
        notes: req.raw.notes || null,
      });
      setMessage(`Request ${req.requestId} marked as ${status}.`);
      await load();
    } catch (err) {
      setError(err?.message || `Failed to update request ${req.requestId}.`);
    }
  };

  return (
    <FacultyLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Requests</h1>
          <p className="mt-1 text-sm text-gray-600">Review and decide on pre-registration requests.</p>
        </div>

        {error && <Alert type="error" title="Requests Error" message={error} />}
        {message && <Alert type="success" title="Success" message={message} />}

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <Card className="p-0 overflow-hidden">
            <RequestTable
              requests={requests}
              onApprove={(req) => updateStatus(req, 'approved')}
              onReject={(req) => updateStatus(req, 'rejected')}
              onView={(req) => setMessage(`Request ${req.requestId}: ${req.type}`)}
            />
          </Card>
        )}
      </div>
    </FacultyLayout>
  );
};

export default StudentRequests;

