import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SearchBar } from './SearchBar';

export interface ListToolbarProps {
  showSearch: boolean;
  onSearchChange: (term: string) => void;
  selectedCount: number;
  selectable: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function ListToolbar({
  showSearch,
  onSearchChange,
  selectedCount,
  selectable,
  style,
  className,
}: ListToolbarProps): React.ReactElement | null {
  const theme = useTheme();

  if (!showSearch) return null;

  const containerStyle: React.CSSProperties = {
    padding: `${theme.spacingSm} 0`,
    ...style,
  };

  return (
    <div style={containerStyle} className={className}>
      {showSearch && <SearchBar onChange={onSearchChange} value=""/>}
      {selectable && selectedCount > 0 && (
        <span>{selectedCount} item{selectedCount !== 1 ? 's' : ''} selected</span>
      )}
    </div>
  );
}