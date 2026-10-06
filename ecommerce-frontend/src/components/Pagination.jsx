import React from 'react';

export default function Pagination({
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return totalElements > 0 ? (
      <div className="pagination">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing all {totalElements} record{totalElements !== 1 ? 's' : ''}
        </span>
      </div>
    ) : null;
  }

  return (
    <div className="pagination">
      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Showing page {currentPage + 1} of {totalPages} ({totalElements} total records)
      </span>
      <div className="pagination-controls">
        <button
          className="btn btn-secondary btn-sm"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        <button
          className="btn btn-secondary btn-sm"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
