import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Checkbox } from '../actions/Checkbox';
import { Icon } from '../primitives/Icon';
import type { ColumnDefinition } from '../../types/index';

export interface ListHeaderProps {
  columns: ColumnDefinition[];
  selectable: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: () => void;
  sortField: string | null;
  sortDirection: 'asc' | 'desc' | null;
  onSortChange: (field: string) => void;
  style?: React.CSSProperties;
  className?: string;
}

// Builds the CSS grid-template-columns value shared by ListHeader and ListRow.
// Must match buildGridTemplate in ListRow.tsx exactly.
export function buildGridTemplate(columns: ColumnDefinition[], selectable: boolean): string {
  const parts: string[] = [];
  if (selectable) parts.push('40px');
  for (const col of columns) parts.push(col.width ?? '1fr');
  parts.push('40px');  // edit icon column
  return parts.join(' ');
}

export function ListHeader({
  columns,
  selectable,
  allSelected,
  someSelected,
  onSelectAll,
  sortField,
  sortDirection,
  onSortChange,
  style,
  className,
}: ListHeaderProps): React.ReactElement {
  const theme = useTheme();

  const headerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: buildGridTemplate(columns, selectable),
    borderBottom: `2px solid ${theme.colorBorder}`,
    backgroundColor: theme.colorBackgroundMuted,
    ...style,
  };

  const cellStyle: React.CSSProperties = {
    padding: `${theme.spacingSm} ${theme.spacingSm}`,
    fontSize: theme.fontSizeSmall,
    fontWeight: theme.fontWeightBold,
    color: theme.colorText,
    fontFamily: theme.fontFamily,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacingXs,
    userSelect: 'none' as const,
  };

  const sortableCellStyle: React.CSSProperties = {
    ...cellStyle,
    cursor: 'pointer',
  };

  const checkboxCellStyle: React.CSSProperties = {
    ...cellStyle,
    justifyContent: 'center',
    padding: `${theme.spacingXs} 0`,
  };

  return (
    <div style={headerStyle} className={className} role="row">
      {selectable && (
        <div style={checkboxCellStyle} role="columnheader">
          <Checkbox
            id="list-header-select-all"
            value={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={onSelectAll}
          />
        </div>
      )}

      {columns.map((col) => {
        const isActive = col.sortable === true && sortField === col.field;
        const isSortedAsc = isActive && sortDirection === 'asc';
        const isSortedDesc = isActive && sortDirection === 'desc';

        return (
          <div
            key={col.field}
            style={col.sortable ? sortableCellStyle : cellStyle}
            role="columnheader"
            onClick={col.sortable ? () => onSortChange(col.field) : undefined}
            aria-sort={isSortedAsc ? 'ascending' : isSortedDesc ? 'descending' : undefined}
          >
            <span>{col.label ?? col.field}</span>
            {col.sortable === true && (
              <Icon
                name={isSortedAsc ? 'sort-asc' : isSortedDesc ? 'sort-desc' : 'sort'}
                size={14}
                color={isActive && sortDirection !== null ? theme.colorPrimary : theme.colorTextMuted}
              />
            )}
          </div>
        );
      })}

      {/* Empty cell to align with the edit icon column in ListRow */}
      <div style={cellStyle} role="columnheader" aria-label="Actions" />
    </div>
  );
}
