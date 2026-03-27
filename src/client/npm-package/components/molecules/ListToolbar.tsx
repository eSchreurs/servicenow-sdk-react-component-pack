import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SearchBar } from './SearchBar';

export interface ListToolbarProps {
  showSearch: boolean;
  searchValue: string;
  onSearchChange: (term: string) => void;  // Called with debounced value (300ms, owned by SearchBar)
  style?: React.CSSProperties;
  className?: string;
}

export function ListToolbar({
  showSearch,
  searchValue,
  onSearchChange,
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
      <SearchBar value={searchValue} onChange={onSearchChange} />
    </div>
  );
}
