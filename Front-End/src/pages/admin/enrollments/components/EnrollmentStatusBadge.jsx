import React from 'react';
import { Badge } from '../../../../components/ui';

const EnrollmentStatusBadge = ({ status }) => {
  const variants = {
    enrolled: 'success',
    dropped: 'danger',
    withdrawn: 'warning',
    completed: 'info'
  };

  const labels = {
    enrolled: 'Enrolled',
    dropped: 'Dropped',
    withdrawn: 'Withdrawn',
    completed: 'Completed'
  };

  return (
    <Badge variant={variants[status] || 'default'}>
      {labels[status] || status}
    </Badge>
  );
};

export default EnrollmentStatusBadge;
