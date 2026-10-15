'use client';

import * as React from 'react';
import { cn, formatCurrency, formatDate, formatDateTime, truncate } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';
import { Badge, StatusBadge, StageBadge, PriorityBadge } from './Badge';
import { Avatar } from './Avatar';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, rowIndex: number) => React.ReactNode;
  sortable?: boolean;
  sticky?: 'left' | 'right';
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  selection?: {
    selectedKeys: Set<string>;
    onChange: (keys: Set<string>) => void;
  };
  rowActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    variant?: 'default' | 'danger';
  }[];
  sortState?: { key: string; direction: 'asc' | 'desc' };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  className?: string;
}

function TableSkeleton({ columns }: { columns: Column<unknown>[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-sm font-medium text-text-muted"
                style={{ width: col.width, minWidth: col.minWidth, maxWidth: col.maxWidth }}
              >
                <div className="h-4 w-3/4 bg-surface-elevated animate-pulse rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-border">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  <div className="h-4 w-full bg-surface-elevated animate-pulse rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data found',
  emptyAction,
  onRowClick,
  selection,
  rowActions,
  sortState,
  onSort,
  pagination,
  className,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(sortState || null);
  const [hoveredRow, setHoveredRow] = React.useState<string | null>(null);

  const handleSort = (key: string) => {
    const column = columns.find((c) => c.key === key);
    if (!column?.sortable) return;

    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof T];
      const bVal = b[sortConfig.key as keyof T];
      if (aVal === bVal) return 0;
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      return aVal > bVal ? direction : -direction;
    });
  }, [data, sortConfig]);

  if (loading) return <TableSkeleton columns={columns} />;

  const isSelected = (row: T) => selection?.selectedKeys.has(keyExtractor(row));
  const toggleSelection = (row: T) => {
    const key = keyExtractor(row);
    const newKeys = new Set(selection!.selectedKeys);
    if (newKeys.has(key)) newKeys.delete(key);
    else newKeys.add(key);
    selection!.onChange(newKeys);
  };

  const handleRowClick = (row: T, e: React.MouseEvent) => {
    if (e.currentTarget.tagName === 'BUTTON' || e.currentTarget.tagName === 'A') return;
    onRowClick?.(row);
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse" role="grid">
        <thead>
          <tr className="border-b border-border bg-surface-elevated/50">
            {selection && (
              <th className="px-4 py-3 w-12" scope="col">
                <input
                  type="checkbox"
                  checked={data.length > 0 && data.every((row) => isSelected(row))}
                  onChange={() => {
                    const newKeys = new Set(selection.selectedKeys);
                    if (newKeys.size === data.length) newKeys.clear();
                    else sortedData.forEach((row) => newKeys.add(keyExtractor(row)));
                    selection.onChange(newKeys);
                  }}
                  aria-label="Select all rows"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-left text-sm font-medium text-text-muted',
                  col.sortable && 'cursor-pointer hover:text-text select-none',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right'
                )}
                style={{ width: col.width, minWidth: col.minWidth, maxWidth: col.maxWidth }}
                onClick={() => col.sortable && handleSort(col.key)}
                aria-sort={sortConfig?.key === col.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortConfig?.key === col.key && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
            ))}
            {rowActions && rowActions.length > 0 && (
              <th className="px-4 py-3 w-12 text-center" scope="col">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selection ? 1 : 0) + (rowActions ? 1 : 0)} className="px-4 py-12 text-center">
                <p className="text-text-muted mb-3">{emptyMessage}</p>
                {emptyAction}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => {
              const rowKey = keyExtractor(row);
              const isHovered = hoveredRow === rowKey;
              const isRowSelected = isSelected(row);

              return (
                <tr
                  key={rowKey}
                  className={cn(
                    'border-b border-border transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-surface-elevated/50',
                    isRowSelected && 'bg-accent-light/50',
                    isHovered && 'bg-surface-elevated/30'
                  )}
                  onMouseEnter={() => setHoveredRow(rowKey)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={(e) => handleRowClick(row, e)}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && onRowClick) {
                      e.preventDefault();
                      onRowClick(row);
                    }
                  }}
                >
                  {selection && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isRowSelected}
                        onChange={() => toggleSelection(row)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label="Select row"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-sm text-text',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right'
                      )}
                      style={{ width: col.width, minWidth: col.minWidth, maxWidth: col.maxWidth }}
                    >
                      {col.render ? col.render(row, rowIndex) : (row[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                  {rowActions && rowActions.length > 0 && (
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {rowActions.map((action, i) => (
                          <Button
                            key={i}
                            variant={action.variant || 'ghost'}
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            aria-label={action.label}
                          >
                            {action.icon}
                          </Button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-surface-elevated/50">
          <div className="text-sm text-text-muted">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-border-input rounded-md bg-surface focus-visible:ring-2 focus-visible:ring-border-focus"
              aria-label="Rows per page"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-text-muted px-2">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper render functions for common column types
export const TableRenderers = {
  status: (status: string) => <StatusBadge status={status as any} />,
  stage: (stage: string) => <StageBadge stage={stage as any} />,
  priority: (priority: string) => <PriorityBadge priority={priority as any} />,
  currency: (cents: number, currency = 'INR') => formatCurrency(cents, currency),
  date: (date: Date | string) => formatDate(date),
  dateTime: (date: Date | string) => formatDateTime(date),
  truncate: (text: string, length = 40) => truncate(text, length),
  avatar: (name: string, src?: string) => <Avatar name={name} src={src} size="sm" />,
  badge: (text: string, variant: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' = 'default') => (
    <Badge variant={variant}>{text}</Badge>
  ),
};