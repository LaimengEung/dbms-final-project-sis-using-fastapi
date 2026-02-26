import React from 'react';
import Button from '../ui/Button';

const EmptyState = ({
  icon,
  title = 'No data found',
  description = 'Get started by creating your first item.',
  buttonText,
  onButtonClick,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {buttonText && onButtonClick && (
        <div className="mt-6">
          <Button onClick={onButtonClick}>
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;