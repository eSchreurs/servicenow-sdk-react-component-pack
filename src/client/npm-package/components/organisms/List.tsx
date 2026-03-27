import React, { useReducer, useState, useEffect, useCallback, useRef } from 'react';
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

  // Selection state — useReducer per spec (complex multi-action state)
  const [selection, dispatch] = useReducer(selectionReducer, { selectedSysIds: new Set<string>() });

  // Sort state — tracked internally as a single object; callbacks notify the parent
  const [sort, setSort] = useState<{ field: string | null; direction: 'asc' | 'desc' | null }>({
    field: null,
    direction: null,
  });

  // Search value — internal display state; debounced callback notifies parent via ListToolbar
  const [searchValue, setSearchValue] = useState('');

  // Keep a stable ref to onRowSelect to avoid stale closures in the effect below
  const onRowSelectRef = useRef(onRowSelect);
  useEffect(() => { onRowSelectRef.current = onRowSelect; });

  // Notify parent whenever selection changes
  const isFirstSelectionRender = useRef(true);
  useEffect(() => {
    if (isFirstSelectionRender.current) {
      isFirstSelectionRender.current = false;
      return;
    }
    onRowSelectRef.current?.(Array.from(selection.selectedSysIds));
  }, [selection.selectedSysIds]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSortChange = useCallback((field: string) => {
    let nextDirection: 'asc' | 'desc' | null;
    if (sort.field !== field) {
      nextDirection = 'asc';
    } else if (sort.direction === 'asc') {
      nextDirection = 'desc';
    } else if (sort.direction === 'desc') {
      nextDirection = null;
    } else {
      nextDirection = 'asc';
    }
    const nextField = nextDirection === null ? null : field;
    setSort({ field: nextField, direction: nextDirection });
    onSortChange?.(field, nextDirection);
  }, [sort, onSortChange]);

  // Keep a stable ref to selection so handleSelectAll doesn't need it as a dep
  const selectionRef = useRef(selection.selectedSysIds);
  useEffect(() => { selectionRef.current = selection.selectedSysIds; });

  const handleSelectRow = useCallback((sysId: string, currentlySelected: boolean) => {
    dispatch(currentlySelected
      ? { type: 'DESELECT_ROW', sysId }
      : { type: 'SELECT_ROW', sysId }
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    const allSysIds = rows.map((r) => r.sysId);
    const everySelected = allSysIds.every((id) => selectionRef.current.has(id));
    dispatch(everySelected
      ? { type: 'DESELECT_ALL' }
      : { type: 'SELECT_ALL', sysIds: allSysIds }
    );
  }, [rows]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchValue(term);
    onSearchChange?.(term);
  }, [onSearchChange]);

  // ---------------------------------------------------------------------------
  // Derived selection + sort flags
  // ---------------------------------------------------------------------------

  const selectedCount = rows.filter((r) => selection.selectedSysIds.has(r.sysId)).length;
  const allSelected = rows.length > 0 && selectedCount === rows.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const { field: sortField, direction: sortDirection } = sort;

  // ---------------------------------------------------------------------------
  // Pagination derived values
  // ---------------------------------------------------------------------------

  const pageSize = pagination?.pageSize ?? 20;
  const currentPage = pagination?.currentPage ?? 1;
  const totalPages = totalCount != null ? Math.ceil(totalCount / pageSize) : 1;

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------

  const containerStyle: React.CSSProperties = {
    fontFamily: theme.fontFamily,
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    backgroundColor: theme.colorBackground,
    ...style,
  };

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

  // ---------------------------------------------------------------------------
  // Render — loading state
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div style={containerStyle} className={className}>
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
      <div style={containerStyle} className={className}>
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
      <div style={containerStyle} className={className}>
        {showSearch && (
          <ListToolbar
            showSearch={showSearch}
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
          />
        )}
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render — normal state
  // ---------------------------------------------------------------------------

  return (
    <div style={containerStyle} className={className}>
      <ListToolbar
        showSearch={showSearch}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
      />

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

      {pagination && (
        <Pagination
          mode={pagination.mode}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={pagination.onPageChange}
          hasMore={pagination.hasMore}
          isLoadingMore={pagination.isLoadingMore}
          onLoadMore={pagination.onLoadMore}
        />
      )}
    </div>
  );
}
