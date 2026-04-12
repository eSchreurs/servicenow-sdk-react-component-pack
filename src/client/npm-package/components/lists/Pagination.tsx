import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../actions/Button';
import { Spinner } from '../primitives/Spinner';

export interface PaginationProps {
  mode: 'pages' | 'load-more';

  // mode: 'pages'
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;

  // mode: 'load-more'
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;

  style?: React.CSSProperties;
  className?: string;
}

// Computes the ordered list of page numbers and ellipsis markers to render.
// Always shows: page 1, page totalPages, currentPage ± 2.
// Gaps are filled with 'ellipsis'.
function buildPageItems(
  current: number,
  total: number,
): Array<number | 'ellipsis'> {
  if (!Number.isFinite(total) || total < 1) return [];

  const visible: number[] = [];

  const addPage = (page: number): void => {
    if (!visible.includes(page)) {
      visible.push(page);
    }
  };

  addPage(1);
  addPage(total);

  for (let p = Math.max(1, current - 2); p <= Math.min(total, current + 2); p++) {
    addPage(p);
  }

  visible.sort((a, b) => a - b);

  const result: Array<number | 'ellipsis'> = [];

  for (let i = 0; i < visible.length; i++) {
    result.push(visible[i]);

    if (i < visible.length - 1 && visible[i + 1] - visible[i] > 1) {
      result.push('ellipsis');
    }
  }

  return result;
}

export function Pagination({
  mode,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  style,
  className,
}: PaginationProps): React.ReactElement | null {
  const theme = useTheme();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacingXs,
    padding: `${theme.spacingSm} 0`,
    ...style,
  };

  if (mode === 'load-more') {
    if (!hasMore && !isLoadingMore) return null;

    return (
      <div style={containerStyle} className={className}>
        <Button
          variant="secondary"
          size="sm"
          disabled={isLoadingMore}
          onClick={isLoadingMore ? undefined : onLoadMore}
        >
          {isLoadingMore ? <Spinner size="sm" /> : 'Load more'}
        </Button>
      </div>
    );
  }

  // Pages mode
  const items = buildPageItems(currentPage, totalPages);

  const pageButtons: React.ReactElement[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item === 'ellipsis') {
      pageButtons.push(
        <Button key={`ellipsis-${String(i)}`} variant="page" size="sm" disabled>
          {'…'}
        </Button>,
      );
    } else {
      const pageNum = String(item);
      const isActive = item === currentPage;
      pageButtons.push(
        <Button
          key={`page-${pageNum}`}
          variant="page"
          size="sm"
          active={isActive}
          onClick={isActive ? undefined : () => onPageChange?.(item)}
          aria-label={`Page ${pageNum}`}
          aria-current={isActive ? 'page' : undefined}
        >
          {pageNum}
        </Button>,
      );
    }
  }

  return (
    <div style={containerStyle} className={className} role="navigation" aria-label="Pagination">
      <Button
        variant="page"
        size="sm"
        disabled={currentPage <= 1}
        onClick={currentPage > 1 ? () => onPageChange?.(currentPage - 1) : undefined}
        aria-label="Previous page"
      >
        {'‹'}
      </Button>

      {pageButtons}

      <Button
        variant="page"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={currentPage < totalPages ? () => onPageChange?.(currentPage + 1) : undefined}
        aria-label="Next page"
      >
        {'›'}
      </Button>
    </div>
  );
}
