import React, { useReducer } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Spinner } from '../atoms/Spinner';
import { EmptyState } from '../atoms/EmptyState';
import { ListToolbar } from '../molecules/ListToolbar';
import { ListHeader } from '../molecules/ListHeader';
import { ListRow } from '../molecules/ListRow';
import { Pagination } from '../molecules/Pagination';
import type { ListRow as ListRowData, ColumnDefinition } from '../../types/index';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ListProps {
  // Data — required
  rows: ListRowData[];
  columns: ColumnDefinition[];

  // Pagination support
  totalCount?: number;

  // Sort state — controlled by the caller, who re-supplies sorted rows in response
  sortField?: string | null;
  sortDirection?: 'asc' | 'desc' | null;

  // Behaviour
  selectable?: boolean;
  onRowEdit?: (sysId: string, table?: string) => void;
  onRowSelect?: (selectedSysIds: string[]) => void;
  onSortChange?: (field: string, direction: 'asc' | 'desc' | null) => void;
  onSearchChange?: (term: string) => void;

  pagination?: {
    mode: 'pages' | 'load-more';
    pageSize: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    hasMore?: boolean;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
  };

  loading?: boolean;
  error?: Error;

  emptyMessage?: string;
  showSearch?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

// ---------------------------------------------------------------------------
// Selection reducer
// ---------------------------------------------------------------------------

type SelectionState = { selectedSysIds: Set<string> };

type SelectionAction =
  | { type: 'SELECT_ROW'; sysId: string }
  | { type: 'DESELECT_ROW'; sysId: string }
  | { type: 'SELECT_ALL'; sysIds: string[] }
  | { type: 'DESELECT_ALL' };

function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case 'SELECT_ROW': {
      const next = new Set(state.selectedSysIds);
      next.add(action.sysId);
      return { selectedSysIds: next };
    }
    case 'DESELECT_ROW': {
      const next = new Set(state.selectedSysIds);
      next.delete(action.sysId);
      return { selectedSysIds: next };
    }
    case 'SELECT_ALL':
      return { selectedSysIds: new Set(action.sysIds) };
    case 'DESELECT_ALL':
      return { selectedSysIds: new Set() };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function List({
  rows,
  columns,
  totalCount,
  sortField = null,
  sortDirection = null,
  selectable = false,
  onRowEdit,
  onRowSelect,
  onSortChange,
  onSearchChange,
  pagination,
  loading = false,
  error,
  emptyMessage = 'No records found.',
  showSearch = false,
  style,
  className,
}: ListProps): React.ReactElement {
  const theme = useTheme();

  const [selection, dispatch] = useReducer(selectionReducer, { selectedSysIds: new Set<string>() });

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  function handleSortChange(field: string): void {
    if (!onSortChange) return;
    let nextDirection: 'asc' | 'desc' | null;
    if (sortField !== field) {
      nextDirection = 'asc';
    } else if (sortDirection === 'asc') {
      nextDirection = 'desc';
    } else if (sortDirection === 'desc') {
      nextDirection = null;
    } else {
      nextDirection = 'asc';
    }
    onSortChange(field, nextDirection);
  }

  function handleSelectRow(sysId: string, currentlySelected: boolean): void {
    dispatch(currentlySelected ? { type: 'DESELECT_ROW', sysId } : { type: 'SELECT_ROW', sysId });
    const next = new Set(selection.selectedSysIds);
    currentlySelected ? next.delete(sysId) : next.add(sysId);
    onRowSelect?.(Array.from(next));
  }

  function handleSelectAll(): void {
    const allSysIds = rows.map((r) => r.sysId);
    const everySelected = allSysIds.every((id) => selection.selectedSysIds.has(id));
    if (everySelected) {
      dispatch({ type: 'DESELECT_ALL' });
      onRowSelect?.([]);
    } else {
      dispatch({ type: 'SELECT_ALL', sysIds: allSysIds });
      onRowSelect?.(allSysIds);
    }
  }

  // ---------------------------------------------------------------------------
  // Derived selection flags
  // ---------------------------------------------------------------------------

  const selectedCount = rows.filter((r) => selection.selectedSysIds.has(r.sysId)).length;
  const allSelected = rows.length > 0 && selectedCount === rows.length;
  const someSelected = selectedCount > 0 && !allSelected;

  // ---------------------------------------------------------------------------
  // Pagination derived values
  // ---------------------------------------------------------------------------

  const pageSize = pagination?.pageSize ?? 20;
  const currentPage = pagination?.currentPage ?? 1;
  const totalPages = totalCount != null ? Math.ceil(totalCount / pageSize) : 1;

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  const fullStateStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacingXl,
  };

  const errorStyle: React.CSSProperties = {
    ...fullStateStyle,
    color: theme.colorDanger,
    fontSize: theme.fontSizeBase,
    backgroundColor: theme.colorDangerBackground,
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: theme.fontFamily,
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    backgroundColor: theme.colorBackground,
  };

  // ---------------------------------------------------------------------------
  // Render — loading state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div style={{ ...containerStyle, ...style }} className={className}>
        <div style={fullStateStyle}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render — error state
  // ---------------------------------------------------------------------------

  if (error) {
    return (
      <div style={{ ...containerStyle, ...style }} className={className}>
        <div style={errorStyle} role="alert">
          {error.message || 'An error occurred while loading data.'}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render — empty state
  // ---------------------------------------------------------------------------

  if (rows.length === 0) {
    return (
      <div style={{ ...containerStyle, ...style }} className={className}>
        {showSearch && (
          <ListToolbar
            showSearch
            onSearchChange={onSearchChange ?? (() => undefined)}
          />
        )}
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render — normal state
  // Pagination is placed OUTSIDE the overflow:hidden container so it cannot
  // be clipped by the border-radius overflow masking on the table portion.
  // ---------------------------------------------------------------------------

  const tableContainerStyle: React.CSSProperties = {
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: pagination
      ? `${theme.borderRadius} ${theme.borderRadius} 0 0`
      : theme.borderRadius,
    overflow: 'hidden',
    backgroundColor: theme.colorBackground,
  };

  const paginationContainerStyle: React.CSSProperties = {
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderTop: 'none',
    borderRadius: `0 0 ${theme.borderRadius} ${theme.borderRadius}`,
    backgroundColor: theme.colorBackground,
  };

  return (
    <div style={{ fontFamily: theme.fontFamily, ...style }} className={className}>
      <div style={tableContainerStyle}>
        {showSearch && (
          <ListToolbar
            showSearch
            onSearchChange={onSearchChange ?? (() => undefined)}
          />
        )}

        <div role="table" aria-rowcount={rows.length}>
          <ListHeader
            columns={columns}
            selectable={selectable}
            allSelected={allSelected}
            someSelected={someSelected}
            onSelectAll={handleSelectAll}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />

          {rows.map((row) => (
            <ListRow
              key={row.sysId}
              row={row}
              columns={columns}
              selectable={selectable}
              selected={selection.selectedSysIds.has(row.sysId)}
              onSelect={(sysId) => handleSelectRow(sysId, selection.selectedSysIds.has(sysId))}
              onEdit={onRowEdit ? () => onRowEdit(row.sysId, row.table) : undefined}
            />
          ))}
        </div>
      </div>

      {pagination && (
        <Pagination
          mode={pagination.mode}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={pagination.onPageChange}
          hasMore={pagination.hasMore}
          isLoadingMore={pagination.isLoadingMore}
          onLoadMore={pagination.onLoadMore}
          style={paginationContainerStyle}
        />
      )}
    </div>
  );
}