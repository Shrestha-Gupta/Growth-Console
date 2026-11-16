import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * PaginationControls
 * Architectural pagination bar with count telemetry and page steppers.
 */
export const PaginationControls = ({
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  limit = 10,
  onPageChange,
}) => {
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRecord = Math.min(currentPage * limit, totalRecords);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderTop: 'none',
        borderRadius: '0 0 var(--radius-md) var(--radius-md)',
        fontSize: '13px',
        color: 'var(--color-text-secondary)',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div>
        Showing{' '}
        <strong style={{ color: 'var(--color-text-primary)' }}>
          {startRecord} - {endRecord}
        </strong>{' '}
        of <strong style={{ color: 'var(--color-text-primary)' }}>{totalRecords}</strong> records
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={() => canGoPrev && onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          aria-label="Previous Page"
          style={{
            height: '32px',
            padding: '0 10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border-medium)',
            borderRadius: 'var(--radius-sm)',
            color: canGoPrev ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
            opacity: canGoPrev ? 1 : 0.5,
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all var(--transition-fast)',
          }}
        >
          <ChevronLeft size={14} />
          <span>Prev</span>
        </button>

        <span style={{ fontSize: '12px', padding: '0 6px', color: 'var(--color-text-muted)' }}>
          Page <strong style={{ color: 'var(--color-text-primary)' }}>{currentPage}</strong> of{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>{totalPages || 1}</strong>
        </span>

        <button
          type="button"
          onClick={() => canGoNext && onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          aria-label="Next Page"
          style={{
            height: '32px',
            padding: '0 10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-border-medium)',
            borderRadius: 'var(--radius-sm)',
            color: canGoNext ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            cursor: canGoNext ? 'pointer' : 'not-allowed',
            opacity: canGoNext ? 1 : 0.5,
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all var(--transition-fast)',
          }}
        >
          <span>Next</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
