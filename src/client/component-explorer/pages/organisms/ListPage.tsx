import React, { useState, useCallback } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { List } from '../../../npm-package/components/organisms/List';
import { Text } from '../../../npm-package/components/atoms/Text';
import { Badge } from '../../../npm-package/components/atoms/Badge';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';
import type { ListRow, ColumnDefinition } from '../../../npm-package/types/index';

// ---------------------------------------------------------------------------
// Demo data — a plain personal to-do list, nothing domain-specific
// ---------------------------------------------------------------------------

const ALL_ROWS: ListRow[] = [
  {
    sysId: '1',
    fields: {
      task:   { value: 'Buy groceries',         displayValue: 'Buy groceries' },
      status: { value: 'pending',               displayValue: 'Pending' },
    },
  },
  {
    sysId: '2',
    fields: {
      task:   { value: 'Call the dentist',      displayValue: 'Call the dentist' },
      status: { value: 'done',                  displayValue: 'Done' },
    },
  },
  {
    sysId: '3',
    fields: {
      task:   { value: 'Pay electricity bill',  displayValue: 'Pay electricity bill' },
      status: { value: 'pending',               displayValue: 'Pending' },
    },
  },
  {
    sysId: '4',
    fields: {
      task:   { value: 'Schedule oil change',   displayValue: 'Schedule oil change' },
      status: { value: 'pending',               displayValue: 'Pending' },
    },
  },
  {
    sysId: '5',
    fields: {
      task:   { value: 'Finish tax return',     displayValue: 'Finish tax return' },
      status: { value: 'done',                  displayValue: 'Done' },
    },
  },
  {
    sysId: '6',
    fields: {
      task:   { value: 'Water plants',          displayValue: 'Water plants' },
      status: { value: 'done',                  displayValue: 'Done' },
    },
  },
  {
    sysId: '7',
    fields: {
      task:   { value: 'Book flights',          displayValue: 'Book flights' },
      status: { value: 'pending',               displayValue: 'Pending' },
    },
  },
  {
    sysId: '8',
    fields: {
      task:   { value: 'Return library books',  displayValue: 'Return library books' },
      status: { value: 'pending',               displayValue: 'Pending' },
    },
  },
];

const COLUMNS: ColumnDefinition[] = [
  { field: 'task',   label: 'Task',   sortable: true },
  { field: 'status', label: 'Status', width: '130px', sortable: true },
];

const COLUMNS_WITH_BADGE: ColumnDefinition[] = [
  { field: 'task', label: 'Task' },
  {
    field: 'status',
    label: 'Status',
    width: '130px',
    renderCell: (_row, value) => (
      <Badge variant={value.value === 'done' ? 'success' : 'default'}>
        {value.displayValue}
      </Badge>
    ),
  },
];

// ---------------------------------------------------------------------------
// Interactive demo — sorting, filtering, and pagination done client-side
// ---------------------------------------------------------------------------

const PAGE_SIZE = 4;

function InteractiveDemo(): React.ReactElement {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = ALL_ROWS.filter((row) =>
    !searchTerm ||
    row.fields.task.displayValue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = sortField && sortDirection
    ? [...filtered].sort((a, b) => {
        const av = a.fields[sortField]?.value ?? '';
        const bv = b.fields[sortField]?.value ?? '';
        return sortDirection === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    : filtered;

  const totalCount = sorted.length;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(totalCount / PAGE_SIZE)));
  const pageRows = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSortChange(field: string, direction: 'asc' | 'desc' | null): void {
    setSortField(direction === null ? null : field);
    setSortDirection(direction);
    setPage(1);
  }

  function handleSearchChange(term: string): void {
    setSearchTerm(term);
    setPage(1);
  }

  const statusStyle: React.CSSProperties = {
    marginTop: theme.spacingSm,
    fontSize: theme.fontSizeSmall,
    color: theme.colorTextMuted,
    fontFamily: theme.fontFamily,
  };

  return (
    <div>
      <List
        rows={pageRows}
        columns={COLUMNS}
        totalCount={totalCount}
        sortField={sortField}
        sortDirection={sortDirection}
        selectable
        showSearch
        onRowEdit={(id) => window.console.log('Edit:', id)}
        onRowSelect={setSelected}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
        pagination={{
          mode: 'pages',
          pageSize: PAGE_SIZE,
          currentPage,
          onPageChange: (page) => {
            setPage(page);
            setSelected([]);
          }
        }}
      />
      <div style={statusStyle}>
        {selected.length > 0
          ? `${selected.length} item${selected.length > 1 ? 's' : ''} selected`
          : 'No items selected.'}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function ListPage(): React.ReactElement {
  const theme = useTheme();

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingLg,
  };

  return (
    <PageLayout
      title="List"
      description="General-purpose list component. Works with any data — to-do items, search results, shopping lists, API responses. Fully controlled: you supply the rows and handle sorting, filtering, and pagination in your own code."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="caption" style={{ color: theme.colorTextMuted }}>
                Click column headers to sort, use the search box to filter, and select
                rows with the checkboxes.
              </Text>
              <InteractiveDemo />
            </div>
          ),
        },
        {
          title: 'Custom cell rendering',
          children: (
            <div style={colStyle}>
              <Text variant="caption" style={{ color: theme.colorTextMuted }}>
                Supply a <code>renderCell</code> function on any column to replace the
                default text with any React element.
              </Text>
              <List
                rows={ALL_ROWS.slice(0, 5)}
                columns={COLUMNS_WITH_BADGE}
                onRowEdit={(id) => window.console.log('Edit:', id)}
              />
            </div>
          ),
        },
        {
          title: 'Loading state',
          children: <List rows={[]} columns={COLUMNS} loading />,
        },
        {
          title: 'Error state',
          children: (
            <List
              rows={[]}
              columns={COLUMNS}
              error={new Error('Could not load items. Check your connection and try again.')}
            />
          ),
        },
        {
          title: 'Empty state',
          children: (
            <List
              rows={[]}
              columns={COLUMNS}
              emptyMessage="No items match your filter."
            />
          ),
        },
        {
          title: 'Props — List',
          children: (
            <PropTable
              props={[
                { name: 'rows', type: 'ListRow[]', required: true, description: 'Rows to render. List displays exactly these — no internal sorting, filtering, or pagination.' },
                { name: 'columns', type: 'ColumnDefinition[]', required: true, description: 'Column configuration: labels, widths, sortability, and optional custom renderers.' },
                { name: 'totalCount', type: 'number', description: 'Total number of items across all pages. Required for pages-mode Pagination to compute the page count correctly.' },
                { name: 'sortField', type: 'string | null', defaultValue: 'null', description: 'Currently sorted column. Controlled by the caller — List uses this only to display the correct sort icon.' },
                { name: 'sortDirection', type: "'asc' | 'desc' | null", defaultValue: 'null', description: 'Current sort direction. Controlled by the caller.' },
                { name: 'selectable', type: 'boolean', defaultValue: 'false', description: 'Shows a checkbox column and enables row selection.' },
                { name: 'onRowEdit', type: '(sysId: string, table?: string) => void', description: 'Called when the edit icon on a row is clicked. When omitted, no edit icon is rendered.' },
                { name: 'onRowSelect', type: '(selectedSysIds: string[]) => void', description: 'Called after every selection change with the full array of currently selected ids.' },
                { name: 'onSortChange', type: "(field: string, direction: 'asc' | 'desc' | null) => void", description: 'Called when a sortable column header is clicked. List cycles asc → desc → null. The caller re-supplies sorted rows.' },
                { name: 'onSearchChange', type: '(term: string) => void', description: 'Called with the search term after a 300 ms debounce. List does not filter rows — the caller responds.' },
                { name: 'pagination', type: 'object', description: 'Pagination config. Omit for an unpaginated list.' },
                { name: 'pagination.mode', type: "'pages' | 'load-more'", required: true, description: '"pages" shows numbered prev/next buttons. "load-more" shows a single append button.' },
                { name: 'pagination.pageSize', type: 'number', required: true, description: 'Items per page. Combined with totalCount to compute the total page count.' },
                { name: 'pagination.currentPage', type: 'number', description: '(pages) Active page number.' },
                { name: 'pagination.onPageChange', type: '(page: number) => void', description: '(pages) Called when a page button is clicked.' },
                { name: 'pagination.hasMore', type: 'boolean', description: '(load-more) When false, the Load more button is hidden.' },
                { name: 'pagination.onLoadMore', type: '() => void', description: '(load-more) Called when the Load more button is clicked.' },
                { name: 'pagination.isLoadingMore', type: 'boolean', description: '(load-more) Shows a Spinner in the button while fetching.' },
                { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'Shows a full-list Spinner. Header, rows, toolbar, and pagination are hidden.' },
                { name: 'error', type: 'Error', description: 'Shows a full-list error message. Rows are hidden.' },
                { name: 'emptyMessage', type: 'string', defaultValue: "'No records found.'", description: 'Message shown when rows is empty and loading/error are both falsy.' },
                { name: 'showSearch', type: 'boolean', defaultValue: 'false', description: 'Shows the search input above the column headers.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides for the root container.' },
                { name: 'className', type: 'string', description: 'CSS class override for the root container.' },
              ]}
            />
          ),
        },
        {
          title: 'Props — ColumnDefinition',
          children: (
            <PropTable
              props={[
                { name: 'field', type: 'string', required: true, description: 'Key into ListRow.fields. Must match the key used when building the row.' },
                { name: 'label', type: 'string', description: 'Column heading text. Falls back to the raw field name.' },
                { name: 'width', type: 'string', defaultValue: "'1fr'", description: 'CSS column width for grid-template-columns. E.g. "120px", "2fr".' },
                { name: 'sortable', type: 'boolean', defaultValue: 'false', description: 'Makes the column header clickable. onSortChange is called with the field and new direction.' },
                { name: 'renderCell', type: '(row: ListRow, value: RecordFieldValue) => React.ReactNode', description: 'Custom cell content. Replaces the default displayValue text. Cell sizing and borders are still provided by ListRow.' },
              ]}
            />
          ),
        },
        {
          title: 'Props — ListRow',
          children: (
            <PropTable
              props={[
                { name: 'sysId', type: 'string', required: true, description: 'Unique row identifier. Used as the React key and passed to callbacks. Any unique string works.' },
                { name: 'table', type: 'string', description: 'Optional source label — useful when merging rows from multiple data sources.' },
                { name: 'fields', type: 'Record<string, RecordFieldValue>', required: true, description: 'Cell values keyed by field name. Each entry has value (used for sorting/logic) and displayValue (shown in the cell).' },
              ]}
            />
          ),
        },
        {
          title: 'Basic usage',
          children: (
            <CodeSnippet
              code={`import { List } from 'servicenow-sdk-react-component-pack';
import type { ListRow, ColumnDefinition } from 'servicenow-sdk-react-component-pack';

const columns: ColumnDefinition[] = [
  { field: 'task',   label: 'Task' },
  { field: 'status', label: 'Status', width: '120px' },
];

const rows: ListRow[] = [
  {
    sysId: '1',
    fields: {
      task:   { value: 'Buy groceries', displayValue: 'Buy groceries' },
      status: { value: 'pending',       displayValue: 'Pending' },
    },
  },
  {
    sysId: '2',
    fields: {
      task:   { value: 'Call dentist',  displayValue: 'Call dentist' },
      status: { value: 'done',          displayValue: 'Done' },
    },
  },
];

<List columns={columns} rows={rows} />`}
            />
          ),
        },
        {
          title: 'Client-side filtering',
          children: (
            <CodeSnippet
              code={`// List fires onSearchChange but never filters rows itself.
// Apply the search term to your own data and pass filtered rows back.

import { useState } from 'react';
import { List } from 'servicenow-sdk-react-component-pack';

function TodoList({ items }: { items: Item[] }) {
  const [search, setSearch] = useState('');

  const filtered = items.filter((item) =>
    !search || item.task.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <List
      columns={columns}
      rows={toRows(filtered)}
      showSearch
      onSearchChange={setSearch}
    />
  );
}`}
            />
          ),
        },
        {
          title: 'Custom cell renderer',
          children: (
            <CodeSnippet
              code={`import { Badge } from 'servicenow-sdk-react-component-pack';
import type { ColumnDefinition } from 'servicenow-sdk-react-component-pack';

const columns: ColumnDefinition[] = [
  { field: 'task', label: 'Task' },
  {
    field: 'status',
    label: 'Status',
    width: '120px',
    renderCell: (_row, value) => (
      <Badge variant={value.value === 'done' ? 'success' : 'default'}>
        {value.displayValue}
      </Badge>
    ),
  },
];`}
            />
          ),
        },
        {
          title: 'Selectable rows',
          children: (
            <CodeSnippet
              code={`import { useState } from 'react';
import { List, Button } from 'servicenow-sdk-react-component-pack';

function TodoList() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div>
      {selected.length > 0 && (
        <Button variant="danger" onClick={() => deleteItems(selected)}>
          Delete {selected.length} item{selected.length !== 1 ? 's' : ''}
        </Button>
      )}
      <List
        columns={columns}
        rows={rows}
        selectable
        onRowSelect={setSelected}
        onRowEdit={(id) => openEditor(id)}
      />
    </div>
  );
}`}
            />
          ),
        },
        {
          title: 'Note — RecordList for ServiceNow tables',
          children: (
            <CodeSnippet
              code={`// List is data-agnostic: it renders whatever rows you pass in.
// It has no knowledge of ServiceNow tables, fields, or the REST API.
//
// For querying a ServiceNow table directly, use RecordList (coming in a future phase).
// RecordList wraps List with automatic data fetching, field-type mapping, and
// column metadata — you only supply a table name, filter, and column config.
//
// Use List when you:
//   - Control your own data (local state, custom API, etc.)
//   - Need to merge rows from multiple sources
//   - Fetch data from a non-Table-API endpoint`}
            />
          ),
        },
      ]}
    />
  );
}
