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
// Demo data — a plain task list, nothing ServiceNow-specific
// ---------------------------------------------------------------------------

const ALL_ROWS: ListRow[] = [
  {
    sysId: 't1',
    fields: {
      title:    { value: 'Design new onboarding flow',  displayValue: 'Design new onboarding flow' },
      status:   { value: 'done',                        displayValue: 'Done' },
      priority: { value: 'high',                        displayValue: 'High' },
      owner:    { value: 'alice',                       displayValue: 'Alice Nguyen' },
    },
  },
  {
    sysId: 't2',
    fields: {
      title:    { value: 'Set up CI/CD pipeline',       displayValue: 'Set up CI/CD pipeline' },
      status:   { value: 'in_progress',                 displayValue: 'In progress' },
      priority: { value: 'high',                        displayValue: 'High' },
      owner:    { value: 'bob',                         displayValue: 'Bob Marsh' },
    },
  },
  {
    sysId: 't3',
    fields: {
      title:    { value: 'Write unit tests for auth module', displayValue: 'Write unit tests for auth module' },
      status:   { value: 'todo',                         displayValue: 'To do' },
      priority: { value: 'medium',                       displayValue: 'Medium' },
      owner:    { value: 'alice',                        displayValue: 'Alice Nguyen' },
    },
  },
  {
    sysId: 't4',
    fields: {
      title:    { value: 'Update API documentation',    displayValue: 'Update API documentation' },
      status:   { value: 'todo',                        displayValue: 'To do' },
      priority: { value: 'low',                         displayValue: 'Low' },
      owner:    { value: 'carol',                       displayValue: 'Carol Kim' },
    },
  },
  {
    sysId: 't5',
    fields: {
      title:    { value: 'Performance audit — dashboard page', displayValue: 'Performance audit — dashboard page' },
      status:   { value: 'in_progress',                 displayValue: 'In progress' },
      priority: { value: 'medium',                      displayValue: 'Medium' },
      owner:    { value: 'bob',                         displayValue: 'Bob Marsh' },
    },
  },
  {
    sysId: 't6',
    fields: {
      title:    { value: 'Accessibility review',        displayValue: 'Accessibility review' },
      status:   { value: 'todo',                        displayValue: 'To do' },
      priority: { value: 'medium',                      displayValue: 'Medium' },
      owner:    { value: 'carol',                       displayValue: 'Carol Kim' },
    },
  },
  {
    sysId: 't7',
    fields: {
      title:    { value: 'Migrate database to v2 schema', displayValue: 'Migrate database to v2 schema' },
      status:   { value: 'done',                        displayValue: 'Done' },
      priority: { value: 'high',                        displayValue: 'High' },
      owner:    { value: 'alice',                       displayValue: 'Alice Nguyen' },
    },
  },
];

const COLUMNS: ColumnDefinition[] = [
  { field: 'title',    label: 'Task',     sortable: true },
  { field: 'status',   label: 'Status',   width: '130px', sortable: true },
  { field: 'priority', label: 'Priority', width: '110px', sortable: true },
  { field: 'owner',    label: 'Owner',    width: '160px' },
];

const COLUMNS_WITH_BADGE: ColumnDefinition[] = [
  { field: 'title', label: 'Task' },
  {
    field: 'status',
    label: 'Status',
    width: '140px',
    renderCell: (_row, value) => {
      const variant =
        value.value === 'done'        ? 'success' :
        value.value === 'in_progress' ? 'primary'    : 'default';
      return <Badge variant={variant}>{value.displayValue}</Badge>;
    },
  },
  {
    field: 'priority',
    label: 'Priority',
    width: '110px',
    renderCell: (_row, value) => {
      const variant =
        value.value === 'high'   ? 'danger'  :
        value.value === 'medium' ? 'warning' : 'default';
      return <Badge variant={variant}>{value.displayValue}</Badge>;
    },
  },
  { field: 'owner', label: 'Owner', width: '160px' },
];

// ---------------------------------------------------------------------------
// Interactive demo — all filtering, sorting, and pagination done client-side
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
    Object.values(row.fields).some((f) =>
      f.displayValue.toLowerCase().includes(searchTerm.toLowerCase())
    )
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

  const handleSortChange = useCallback((field: string, direction: 'asc' | 'desc' | null) => {
    setSortField(direction === null ? null : field);
    setSortDirection(direction);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

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
        selectable
        showSearch
        onRowEdit={(sysId) => window.console.log('Edit clicked for row:', sysId)}
        onRowSelect={setSelected}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
        pagination={{
          mode: 'pages',
          pageSize: PAGE_SIZE,
          currentPage,
          onPageChange: setPage,
        }}
      />
      <div style={statusStyle}>
        {selected.length > 0
          ? `${selected.length} task${selected.length > 1 ? 's' : ''} selected`
          : 'No tasks selected.'}
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
      description="General-purpose list organism. Fully controlled — it owns no async state and performs no fetching. You supply the rows, columns, and handlers; List handles rendering, selection, and pagination UI. Any data source works."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="caption" style={{ color: theme.colorTextMuted }}>
                Click column headers to sort. Use the search box to filter rows client-side.
                Select rows with checkboxes. Click the edit icon to log the row id to the console.
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
                <code>renderCell</code> replaces the default text content of a cell.
                The wrapper cell element (sizing, padding, borders) is still provided by ListRow.
              </Text>
              <List
                rows={ALL_ROWS.slice(0, 5)}
                columns={COLUMNS_WITH_BADGE}
                onRowEdit={(sysId) => window.console.log('Edit:', sysId)}
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
              error={new Error('Could not load tasks. Check your connection and try again.')}
            />
          ),
        },
        {
          title: 'Empty state',
          children: (
            <List
              rows={[]}
              columns={COLUMNS}
              emptyMessage="No tasks match your filter."
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
                { name: 'selectable', type: 'boolean', defaultValue: 'false', description: 'Shows a checkbox column and enables row selection.' },
                { name: 'onRowEdit', type: '(sysId: string, table?: string) => void', description: 'Called when the edit icon on a row is clicked. When omitted, no edit icon is rendered.' },
                { name: 'onRowSelect', type: '(selectedSysIds: string[]) => void', description: 'Called after every selection change with the full array of currently selected ids.' },
                { name: 'onSortChange', type: "(field: string, direction: 'asc' | 'desc' | null) => void", description: 'Called when a sortable column header is clicked. List cycles asc → desc → null. The caller re-supplies sorted rows.' },
                { name: 'onSearchChange', type: '(term: string) => void', description: 'Called with the search term after a 300ms debounce. List does not filter rows — the caller responds.' },
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
                { name: 'sysId', type: 'string', required: true, description: 'Unique identifier for this row. Used as the React key and passed to callbacks. Any unique string works — does not have to be a ServiceNow sys_id.' },
                { name: 'table', type: 'string', description: 'Optional source label. Useful when merging rows from multiple data sources so edit callbacks can route correctly.' },
                { name: 'fields', type: 'Record<string, RecordFieldValue>', required: true, description: 'Cell values keyed by field name. Each entry has value (used for sorting/operations) and displayValue (shown in the cell).' },
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
  { field: 'name',   label: 'Name' },
  { field: 'status', label: 'Status', width: '120px' },
  { field: 'owner',  label: 'Owner',  width: '150px' },
];

// Each field needs a value (used in sort/operations) and a displayValue (shown in the cell).
// For simple text data they are usually the same.
const rows: ListRow[] = [
  {
    sysId: '1',
    fields: {
      name:   { value: 'Fix login bug',   displayValue: 'Fix login bug' },
      status: { value: 'in_progress',     displayValue: 'In progress' },
      owner:  { value: 'alice',           displayValue: 'Alice Nguyen' },
    },
  },
  {
    sysId: '2',
    fields: {
      name:   { value: 'Write docs',      displayValue: 'Write docs' },
      status: { value: 'todo',            displayValue: 'To do' },
      owner:  { value: 'bob',             displayValue: 'Bob Marsh' },
    },
  },
];

<List columns={columns} rows={rows} />`}
            />
          ),
        },
        {
          title: 'Mapping a plain array to rows',
          children: (
            <CodeSnippet
              code={`// If your data is already in a plain JS array, map it to ListRow format.
// value and displayValue can differ when the stored value is an id
// or a machine-friendly key and you want to display something human-readable.

interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: 'low' | 'medium' | 'high';
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low', medium: 'Medium', high: 'High',
};

function toRows(tasks: Task[]): ListRow[] {
  return tasks.map((t) => ({
    sysId: t.id,
    fields: {
      title:    { value: t.title,     displayValue: t.title },
      status:   { value: t.done ? 'done' : 'todo',
                  displayValue: t.done ? 'Done' : 'To do' },
      priority: { value: t.priority,  displayValue: PRIORITY_LABELS[t.priority] },
    },
  }));
}`}
            />
          ),
        },
        {
          title: 'Client-side sort and search',
          children: (
            <CodeSnippet
              code={`// List never sorts or filters rows itself — it just fires callbacks.
// Wire them up to call your own sort/filter logic and re-supply rows.

import { useState } from 'react';
import { List } from 'servicenow-sdk-react-component-pack';

function TaskList({ tasks }: { tasks: Task[] }) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir]     = useState<'asc' | 'desc' | null>(null);
  const [search, setSearch]       = useState('');

  const filtered = tasks.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = sortField && sortDir
    ? [...filtered].sort((a, b) => {
        const av = String(a[sortField as keyof Task] ?? '');
        const bv = String(b[sortField as keyof Task] ?? '');
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    : filtered;

  return (
    <List
      columns={columns}
      rows={toRows(sorted)}
      showSearch
      onSortChange={(field, direction) => {
        setSortField(direction === null ? null : field);
        setSortDir(direction);
      }}
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
  { field: 'title', label: 'Task' },
  {
    field: 'priority',
    label: 'Priority',
    width: '120px',
    renderCell: (_row, value) => {
      const variant =
        value.value === 'high'   ? 'danger'  :
        value.value === 'medium' ? 'warning' : 'default';
      // value.value  — the stored key, safe to use in logic
      // value.displayValue — the human-readable label, used only for display
      return <Badge label={value.displayValue} variant={variant} />;
    },
  },
];`}
            />
          ),
        },
        {
          title: 'Selectable list with bulk action',
          children: (
            <CodeSnippet
              code={`import { useState } from 'react';
import { List, Button } from 'servicenow-sdk-react-component-pack';

function TaskList() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div>
      {selected.length > 0 && (
        <Button variant="danger" onClick={() => deleteAll(selected)}>
          Delete {selected.length} task{selected.length > 1 ? 's' : ''}
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
          title: 'Note — ServiceNow data',
          children: (
            <CodeSnippet
              code={`// For fetching data directly from a ServiceNow table, use RecordList instead.
// RecordList is a thin wrapper around List that handles metadata, fetching,
// pagination, sort, and search automatically.
//
// Use List directly when you need to:
//   - Supply your own pre-fetched data
//   - Merge rows from multiple sources into a single list
//   - Use a custom REST endpoint instead of the Table API

import { RecordList } from 'servicenow-sdk-react-component-pack';

<RecordList
  table="incident"
  filter="active=true"
  columns={[
    { field: 'number',            label: 'Number',   width: '120px' },
    { field: 'short_description', label: 'Description' },
    { field: 'priority',          label: 'Priority', width: '100px', sortable: true },
  ]}
  pagination={{ mode: 'pages', pageSize: 20 }}
/>`}
            />
          ),
        },
      ]}
    />
  );
}
