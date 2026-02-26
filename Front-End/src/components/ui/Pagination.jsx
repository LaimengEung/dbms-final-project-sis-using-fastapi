import React from 'react';

const Pagination = ({ 
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Previous
      </button>
      
      <span className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
