import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Checkbox } from '../actions/Checkbox';
import { Icon } from '../primitives/Icon';
import { Tooltip } from '../actions/Tooltip';
import type { ListRow as ListRowData, ColumnDefinition, FieldValue } from '../../types/index';
import { buildGridTemplate } from './ListHeader';

export interface ListRowProps {
  row: ListRowData;
  columns: ColumnDefinition[];
  selectable: boolean;
  selected: boolean;
  onSelect: (sysId: string) => void;
  onEdit?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function ListRow({
  row,
  columns,
  selectable,
  selected,
  onSelect,
  onEdit,
  style,
  className,
}: ListRowProps): React.ReactElement {
  const theme = useTheme();

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: buildGridTemplate(columns, selectable),
    borderBottom: `${theme.borderWidth} solid ${theme.colorBorder}`,
    backgroundColor: selected ? theme.colorPrimaryBackground : theme.colorBackground,
    transition: `background-color ${theme.transitionSpeed}`,
    ...style,
  };

  const cellStyle: React.CSSProperties = {
    padding: `${theme.spacingSm} ${theme.spacingSm}`,
    fontSize: theme.fontSizeBase,
    color: theme.colorText,
    fontFamily: theme.fontFamily,
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,  // allow grid item to shrink below content size
  };

  const checkboxCellStyle: React.CSSProperties = {
    ...cellStyle,
    justifyContent: 'center',
    padding: `${theme.spacingXs} 0`,
  };

  const editCellStyle: React.CSSProperties = {
    ...cellStyle,
    justifyContent: 'center',
    padding: `${theme.spacingXs} 0`,
  };

  const editButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: theme.spacingXs,
    display: 'inline-flex',
    alignItems: 'center',
    color: theme.colorTextMuted,
    borderRadius: theme.borderRadiusSm,
  };

  return (
    <div style={rowStyle} className={className} role="row">
      {selectable && (
        <div style={checkboxCellStyle} role="cell">
          <Checkbox
            id={`list-row-${row.sysId}`}
            value={selected}
            onChange={() => onSelect(row.sysId)}
          />
        </div>
      )}

      {columns.map((col) => {
        const fieldValue: FieldValue = row.fields[col.field] ?? { value: '', displayValue: '' };
        const displayText = fieldValue.displayValue;

        const cellContent = col.renderCell
          ? col.renderCell(row, fieldValue)
          : (displayText
            ? (
              <Tooltip content={displayText} style={{ width: '100%' }}>
                <span style={{
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  display: 'block',
                  width: '100%',
                }}>
                  {displayText}
                </span>
              </Tooltip>
            )
            : null
          );

        return (
          <div key={col.field} style={cellStyle} role="cell">
            {cellContent}
          </div>
        );
      })}

      {/* Edit icon — always renders to maintain column alignment with ListHeader */}
      <div style={editCellStyle} role="cell">
        {onEdit && (
          <button
            type="button"
            style={editButtonStyle}
            onClick={onEdit}
            aria-label="Edit record"
          >
            <Icon name="edit" size={16} color={theme.colorTextMuted} />
          </button>
        )}
      </div>
    </div>
  );
}
