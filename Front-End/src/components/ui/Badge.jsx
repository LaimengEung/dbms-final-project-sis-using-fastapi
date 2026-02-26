import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'medium',
  rounded = 'full',
  className = ''
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-indigo-100 text-indigo-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-1 text-xs',
    large: 'px-3 py-1.5 text-sm',
  };

  const roundedStyles = {
    sm: 'rounded',
    full: 'rounded-full',
  };

  return (
    <span className={`
      inline-flex items-center font-medium
      ${variants[variant]}
      ${sizes[size]}
      ${roundedStyles[rounded]}
      ${className}
    `}>
      {children}
    </span>
  );
};

export default Badge;