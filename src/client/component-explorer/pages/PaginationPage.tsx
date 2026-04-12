import React, { useState } from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';
import { Pagination } from '../../npm-package/components/lists/Pagination';
import { Text } from '../../npm-package/components/primitives/Text';
import { PropTable } from '../components/PropTable';
import { CodeSnippet } from '../components/CodeSnippet';
import { PageLayout } from '../components/PageLayout';

export function PaginationPage(): React.ReactElement {
  const theme = useTheme();

  const [page, setPage] = useState(1);
  const [loadMoreCount, setLoadMoreCount] = useState(3);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const totalPages = 12;
  const maxLoadMore = 8;

  function handleLoadMore(): void {
    setIsLoadingMore(true);
    setTimeout(() => {
      setLoadMoreCount((n) => Math.min(n + 3, maxLoadMore));
      setIsLoadingMore(false);
    }, 1200);
  }

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingLg,
  };

  const demoBoxStyle: React.CSSProperties = {
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    backgroundColor: theme.colorBackground,
    padding: `${theme.spacingMd} 0`,
  };

  const captionStyle: React.CSSProperties = {
    color: theme.colorTextMuted,
    fontSize: theme.fontSizeSmall,
    fontFamily: theme.fontFamily,
    marginBottom: theme.spacingSm,
    display: 'block',
  };

  return (
    <PageLayout
      title="Pagination"
      description="Navigation control for paged data. Supports two modes: pages (numbered buttons with prev/next) and load-more (a single button that appends rows). Used internally by List but usable standalone for any paged dataset."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">Pages mode — interactive</Text>
              <span style={captionStyle}>Page {page} of {totalPages}. Click a page button.</span>
              <div style={demoBoxStyle}>
                <Pagination
                  mode="pages"
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>

              <Text variant="label">Pages mode — edge cases</Text>
              <span style={captionStyle}>First page (Previous disabled)</span>
              <div style={demoBoxStyle}>
                <Pagination mode="pages" currentPage={1} totalPages={5} onPageChange={() => undefined} />
              </div>
              <span style={captionStyle}>Last page (Next disabled)</span>
              <div style={demoBoxStyle}>
                <Pagination mode="pages" currentPage={5} totalPages={5} onPageChange={() => undefined} />
              </div>
              <span style={captionStyle}>Single page (both disabled)</span>
              <div style={demoBoxStyle}>
                <Pagination mode="pages" currentPage={1} totalPages={1} onPageChange={() => undefined} />
              </div>

              <Text variant="label">Load-more mode — interactive</Text>
              <span style={captionStyle}>
                Showing {loadMoreCount} of {maxLoadMore} items. Click "Load more" to fetch more.
              </span>
              <div style={demoBoxStyle}>
                <Pagination
                  mode="load-more"
                  hasMore={loadMoreCount < maxLoadMore}
                  isLoadingMore={isLoadingMore}
                  onLoadMore={handleLoadMore}
                />
              </div>
              {loadMoreCount >= maxLoadMore && (
                <span style={{ ...captionStyle, color: theme.colorSuccess }}>
                  All items loaded. Button is hidden when hasMore is false.
                </span>
              )}
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'mode', type: "'pages' | 'load-more'", required: true, description: 'Pagination style. "pages" renders numbered buttons; "load-more" renders a single append button.' },
                { name: 'currentPage', type: 'number', defaultValue: '1', description: '(pages mode) Currently active page number.' },
                { name: 'totalPages', type: 'number', defaultValue: '1', description: '(pages mode) Total number of pages. Used to disable the Next button and compute the page window.' },
                { name: 'onPageChange', type: '(page: number) => void', description: '(pages mode) Called with the target page number when a button is clicked.' },
                { name: 'hasMore', type: 'boolean', defaultValue: 'false', description: '(load-more mode) When false, the Load more button is not rendered.' },
                { name: 'isLoadingMore', type: 'boolean', defaultValue: 'false', description: '(load-more mode) Shows a Spinner in place of the button label and disables the button.' },
                { name: 'onLoadMore', type: '() => void', description: '(load-more mode) Called when the Load more button is clicked.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides applied to the container.' },
                { name: 'className', type: 'string', description: 'CSS class name override applied to the container.' },
              ]}
            />
          ),
        },
        {
          title: 'Page window algorithm',
          children: (
            <CodeSnippet
              code={`// The page number window always shows:
//   - Page 1 (always)
//   - Current page ± 2
//   - Last page (always)
//   - "…" where there are gaps between visible page numbers

// Examples (current page marked with *):
//   Total 12, current  1:  [*1]  2  3   …  12
//   Total 12, current  5:   1  …  3  4 [*5]  6  7  …  12
//   Total 12, current 12:   1  …  10  11 [*12]`}
            />
          ),
        },
        {
          title: 'Usage — pages mode',
          children: (
            <CodeSnippet
              code={`import { useState } from 'react';
import { Pagination } from 'servicenow-sdk-react-component-pack';

const PAGE_SIZE = 20;

function MyList() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPage(page, PAGE_SIZE).then(({ rows, total }) => {
      setRows(rows);
      setTotal(total);
    });
  }, [page]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* ...render rows... */}
      <Pagination
        mode="pages"
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}`}
            />
          ),
        },
        {
          title: 'Usage — load-more mode',
          children: (
            <CodeSnippet
              code={`import { useState } from 'react';
import { Pagination } from 'servicenow-sdk-react-component-pack';

function ActivityFeed() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  async function handleLoadMore() {
    setIsLoadingMore(true);
    const next = await fetchMore({ offset: rows.length, limit: 10 });
    setRows((prev) => [...prev, ...next.rows]);
    setTotal(next.total);
    setIsLoadingMore(false);
  }

  return (
    <div>
      {/* ...render rows... */}
      <Pagination
        mode="load-more"
        hasMore={total === null || rows.length < total}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}`}
            />
          ),
        },
      ]}
    />
  );
}
