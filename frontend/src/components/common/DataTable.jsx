import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * DataTable
 * Enterprise architectural data grid with sortable columns, hairline borders,
 * and responsive overflow isolation.
 */
export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  sortBy = '',
  sortOrder = 'desc',
  onSort,
  onRowClick,
  emptyMessage = 'No records found',
}) => {
  const handleSort = (field) => {
    if (!onSort) return;
    if (sortBy === field) {
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(field, 'desc');
    }
  };

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      <div data-lenis-prevent="true" style={{ width: '100%', overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--color-bg-sunken)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {columns.map((col) => {
                const isSorted = sortBy === col.field;
                return (
                  <th
                    key={col.field || col.header}
                    scope="col"
                    onClick={() => col.sortable && handleSort(col.field)}
                    style={{
                      padding: '12px 16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: isSorted ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      width: col.width || 'auto',
                    }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span style={{ color: isSorted ? 'var(--color-accent-gold)' : 'var(--color-text-muted)' }}>
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp size={13} />
                            ) : (
                              <ArrowDown size={13} />
                            )
                          ) : (
                            <ArrowUpDown size={13} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} style={{ padding: '16px' }}>
                      <div
                        style={{
                          height: '16px',
                          backgroundColor: 'var(--color-bg-sunken)',
                          borderRadius: 'var(--radius-xs)',
                          width: cIdx === 0 ? '60%' : '80%',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              // Empty State Row
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '48px 16px',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '14px',
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, index) => (
                <tr
                  key={row._id || row.id || index}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.field || col.header}
                      style={{
                        padding: '14px 16px',
                        fontSize: '14px',
                        color: 'var(--color-text-primary)',
                        verticalAlign: 'middle',
                      }}
                    >
                      {col.render ? col.render(row) : row[col.field]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
