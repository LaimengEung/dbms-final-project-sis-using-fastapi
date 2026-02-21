import React from 'react';
import Badge from '../ui/Badge';

const statusConfig = {
  enrolled: { color: 'success', label: 'Enrolled' },
  dropped: { color: 'error', label: 'Dropped' },
  withdrawn: { color: 'warning', label: 'Withdrawn' },
  completed: { color: 'info', label: 'Completed' },
  pending: { color: 'warning', label: 'Pending Approval' },
  approved: { color: 'success', label: 'Approved' },
  rejected: { color: 'error', label: 'Rejected' }
};

const EnrollmentStatusBadge = ({ status, type = 'enrollment' }) => {
  const config = statusConfig[status] || { color: 'default', label: status };
  
  return (
    <Badge color={config.color} variant="filled">
      {config.label}
    </Badge>
  );
};

export default EnrollmentStatusBadge;