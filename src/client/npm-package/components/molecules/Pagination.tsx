import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../atoms/Button';
import { Spinner } from '../atoms/Spinner';

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
  if (total <= 0) return [];

  // Collect the page numbers that must be shown
  const visible = new Set<number>();
  visible.add(1);
  visible.add(total);
  for (let p = Math.max(1, current - 2); p <= Math.min(total, current + 2); p++) {
    visible.add(p);
  }

  const sorted = Array.from(visible).sort((a, b) => a - b);

  // Insert ellipsis markers where there are gaps larger than 1
  const result: Array<number | 'ellipsis'> = [];
  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
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
  console.log('Pagination debug', {
    mode,
    currentPage,
    totalPages,
    totalPagesType: typeof totalPages,
    items,
  });

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