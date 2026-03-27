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
// Demo data
// ---------------------------------------------------------------------------

const ALL_ROWS: ListRow[] = [
  {
    sysId: 'inc001',
    table: 'incident',
    fields: {
      number:            { value: 'INC0001001', displayValue: 'INC0001001' },
      short_description: { value: 'Cannot access email',         displayValue: 'Cannot access email' },
      priority:          { value: '1',                           displayValue: '1 - Critical' },
      state:             { value: '1',                           displayValue: 'New' },
      assigned_to:       { value: 'john.doe',                    displayValue: 'John Doe' },
    },
  },
  {
    sysId: 'inc002',
    table: 'incident',
    fields: {
      number:            { value: 'INC0001002', displayValue: 'INC0001002' },
      short_description: { value: 'VPN disconnects every 30 minutes', displayValue: 'VPN disconnects every 30 minutes' },
      priority:          { value: '2',          displayValue: '2 - High' },
      state:             { value: '2',          displayValue: 'In Progress' },
      assigned_to:       { value: 'jane.smith', displayValue: 'Jane Smith' },
    },
  },
  {
    sysId: 'inc003',
    table: 'incident',
    fields: {
      number:            { value: 'INC0001003', displayValue: 'INC0001003' },
      short_description: { value: 'Printer on floor 3 is offline', displayValue: 'Printer on floor 3 is offline' },
      priority:          { value: '3',          displayValue: '3 - Moderate' },
      state:             { value: '2',          displayValue: 'In Progress' },
      assigned_to:       { value: 'bob.jones',  displayValue: 'Bob Jones' },
    },
  },
  {
    sysId: 'inc004',
    table: 'incident',
    fields: {
      number:            { value: 'INC0001004', displayValue: 'INC0001004' },
      short_description: { value: 'Software license expired',    displayValue: 'Software license expired' },
      priority:          { value: '4',          displayValue: '4 - Low' },
      state:             { value: '3',          displayValue: 'On Hold' },
      assigned_to:       { value: '',           displayValue: '' },
    },
  },
  {
    sysId: 'inc005',
    table: 'incident',
    fields: {
      number:            { value: 'INC0001005', displayValue: 'INC0001005' },
      short_description: { value: 'Workstation very slow after Windows update', displayValue: 'Workstation very slow after Windows update' },
      priority:          { value: '2',          displayValue: '2 - High' },
      state:             { value: '1',          displayValue: 'New' },
      assigned_to:       { value: 'john.doe',   displayValue: 'John Doe' },
    },
  },
  {
    sysId: 'inc006',
    table: 'incident',
    fields: {
      number:            { value: 'INC0001006', displayValue: 'INC0001006' },
      short_description: { value: 'Need access to HR portal',    displayValue: 'Need access to HR portal' },
      priority:          { value: '4',          displayValue: '4 - Low' },
      state:             { value: '6',          displayValue: 'Resolved' },
      assigned_to:       { value: 'jane.smith', displayValue: 'Jane Smith' },
    },
  },
];

const COLUMNS: ColumnDefinition[] = [
  { field: 'number',            label: 'Number',      width: '120px', sortable: true },
  { field: 'short_description', label: 'Description',               sortable: false },
  { field: 'priority',          label: 'Priority',    width: '130px', sortable: true },
  { field: 'state',             label: 'State',       width: '120px' },
  { field: 'assigned_to',       label: 'Assigned to', width: '140px' },
];

const COLUMNS_WITH_BADGE: ColumnDefinition[] = [
  { field: 'number',            label: 'Number',      width: '120px' },
  { field: 'short_description', label: 'Description' },
  {
    field: 'priority',
    label: 'Priority',
    width: '140px',
    renderCell: (_row, value) => {
      const variant =
        value.value === '1' ? 'danger' :
        value.value === '2' ? 'warning' :
        value.value === '3' ? 'info' :
        'default';
      return <Badge label={value.displayValue} variant={variant} />;
    },
  },
  {
    field: 'state',
    label: 'State',
    width: '120px',
    renderCell: (_row, value) => {
      const variant = value.value === '6' ? 'success' : value.value === '3' ? 'warning' : 'default';
      return <Badge label={value.displayValue} variant={variant} />;
    },
  },
];

// ---------------------------------------------------------------------------
// Interactive demo component — controls sort, search, selection, pagination
// ---------------------------------------------------------------------------

const PAGE_SIZE = 3;

function InteractiveDemo(): React.ReactElement {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  // Filter by search term across all visible column fields
  const filtered = ALL_ROWS.filter((row) =>
    !searchTerm ||
    Object.values(row.fields).some((f) =>
      f.displayValue.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort
  const sorted = sortField && sortDirection
    ? [...filtered].sort((a, b) => {
        const av = a.fields[sortField]?.value ?? '';
        const bv = b.fields[sortField]?.value ?? '';
        return sortDirection === 'asc'
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      })
    : filtered;

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePageshown = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePageshown - 1) * PAGE_SIZE, safePageshown * PAGE_SIZE);

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
        onRowEdit={(sysId, table) => window.console.log('Edit', sysId, table)}
        onRowSelect={setSelected}
        onSortChange={handleSortChange}
        onSearchChange={handleSearchChange}
        pagination={{
          mode: 'pages',
          pageSize: PAGE_SIZE,
          currentPage: safePageshown,
          onPageChange: setPage,
        }}
      />
      <div style={statusStyle}>
        {selected.length > 0
          ? `${selected.length} row${selected.length > 1 ? 's' : ''} selected: ${selected.join(', ')}`
          : 'No rows selected.'}
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
      description="The base list organism. Fully controlled — it owns no async state and performs no fetching. All data, loading state, error state, and pagination control flow in as props. Any data source works: ServiceNow table queries, multi-table merges, or custom REST endpoints."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">Interactive — sort, search, select, paginate</Text>
              <Text variant="caption" style={{ color: theme.colorTextMuted }}>
                Click column headers to sort. Use the search box to filter. Select rows with checkboxes.
                Clicking the edit icon logs to the console.
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
                Use <code>renderCell</code> on any column to replace the default text with a custom element.
                The wrapper cell (sizing, padding, borders) is still provided by ListRow.
              </Text>
              <List
                rows={ALL_ROWS.slice(0, 4)}
                columns={COLUMNS_WITH_BADGE}
                onRowEdit={(sysId) => window.console.log('Edit', sysId)}
              />
            </div>
          ),
        },
        {
          title: 'Loading state',
          children: (
            <List
              rows={[]}
              columns={COLUMNS}
              loading
            />
          ),
        },
        {
          title: 'Error state',
          children: (
            <List
              rows={[]}
              columns={COLUMNS}
              error={new Error('Failed to load records. Please try again.')}
            />
          ),
        },
        {
          title: 'Empty state',
          children: (
            <List
              rows={[]}
              columns={COLUMNS}
              emptyMessage="No incidents match your filter."
            />
          ),
        },
        {
          title: 'Props — List',
          children: (
            <PropTable
              props={[
                { name: 'rows', type: 'ListRow[]', required: true, description: 'Array of row data objects. List renders exactly these rows — no internal sorting, filtering, or slicing.' },
                { name: 'columns', type: 'ColumnDefinition[]', required: true, description: 'Column configuration. Controls labels, widths, sortability, and optional custom cell renderers.' },
                { name: 'totalCount', type: 'number', description: 'Total number of records across all pages. Required for the pages-mode Pagination to compute the page count.' },
                { name: 'selectable', type: 'boolean', defaultValue: 'false', description: 'Renders a checkbox column and enables row selection.' },
                { name: 'onRowEdit', type: '(sysId: string, table?: string) => void', description: 'Called when the edit icon on a row is clicked. When omitted, the edit icon is not rendered.' },
                { name: 'onRowSelect', type: '(selectedSysIds: string[]) => void', description: 'Called after every selection change with the full array of currently selected sysIds.' },
                { name: 'onSortChange', type: "(field: string, direction: 'asc' | 'desc' | null) => void", description: 'Called when a sortable column heading is clicked. List cycles through asc → desc → null on repeated clicks. The caller re-supplies sorted rows.' },
                { name: 'onSearchChange', type: '(term: string) => void', description: 'Called with the search term after 300ms debounce. List does not filter rows — the caller responds.' },
                { name: 'pagination', type: 'object', description: 'Pagination config. Omit to render without pagination.' },
                { name: 'pagination.mode', type: "'pages' | 'load-more'", required: true, description: 'Pages mode renders numbered buttons. Load-more renders a single append button.' },
                { name: 'pagination.pageSize', type: 'number', required: true, description: 'Number of rows per page. Used with totalCount to compute total pages.' },
                { name: 'pagination.currentPage', type: 'number', description: '(pages mode) Currently displayed page number.' },
                { name: 'pagination.onPageChange', type: '(page: number) => void', description: '(pages mode) Called when a page button is clicked.' },
                { name: 'pagination.hasMore', type: 'boolean', description: '(load-more mode) When false, the Load more button is hidden.' },
                { name: 'pagination.onLoadMore', type: '() => void', description: '(load-more mode) Called when the Load more button is clicked.' },
                { name: 'pagination.isLoadingMore', type: 'boolean', description: '(load-more mode) Shows a Spinner in the Load more button while fetching.' },
                { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'Renders a full-list Spinner. Toolbar, header, rows, and pagination are hidden.' },
                { name: 'error', type: 'Error', description: 'Renders a full-list error message. Rows are hidden.' },
                { name: 'emptyMessage', type: 'string', defaultValue: "'No records found.'", description: 'Message shown by EmptyState when rows is empty and there is no error or loading state.' },
                { name: 'showSearch', type: 'boolean', defaultValue: 'false', description: 'Renders the search toolbar above the column headers.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides applied to the root container.' },
                { name: 'className', type: 'string', description: 'CSS class name override applied to the root container.' },
              ]}
            />
          ),
        },
        {
          title: 'Props — ColumnDefinition',
          children: (
            <PropTable
              props={[
                { name: 'field', type: 'string', required: true, description: 'Field name — used as the key into each ListRow.fields map.' },
                { name: 'label', type: 'string', description: 'Column heading label. Falls back to the raw field name.' },
                { name: 'width', type: 'string', defaultValue: "'1fr'", description: 'CSS column width passed to grid-template-columns. Examples: "120px", "200px", "2fr".' },
                { name: 'sortable', type: 'boolean', defaultValue: 'false', description: 'Clicking the column heading calls onSortChange. List does not reorder rows — the caller re-supplies sorted rows.' },
                { name: 'renderCell', type: '(row: ListRow, value: RecordFieldValue) => React.ReactNode', description: 'Custom cell renderer. Replaces the default displayValue text. The wrapper cell element (sizing, padding, borders) is still provided by ListRow.' },
              ]}
            />
          ),
        },
        {
          title: 'Props — ListRow',
          children: (
            <PropTable
              props={[
                { name: 'sysId', type: 'string', required: true, description: 'Unique row identifier. Used as the React key and passed to onRowEdit and onRowSelect callbacks. For non-ServiceNow data any unique string works.' },
                { name: 'table', type: 'string', description: 'Source table for this row. Declare when using multi-table merged data so onRowEdit can route to the correct record.' },
                { name: 'fields', type: 'Record<string, RecordFieldValue>', required: true, description: 'Field values keyed by field name. Each entry has value (stored) and displayValue (shown to the user).' },
              ]}
            />
          ),
        },
        {
          title: 'Basic usage',
          children: (
            <CodeSnippet
              code={`import { List, ListRow, ColumnDefinition } from 'servicenow-sdk-react-component-pack';

const columns: ColumnDefinition[] = [
  { field: 'number',            label: 'Number',      width: '120px', sortable: true },
  { field: 'short_description', label: 'Description' },
  { field: 'priority',          label: 'Priority',    width: '100px', sortable: true },
];

// ListRow.fields values come from RecordService.getRecords() or
// any other source that produces { value, displayValue } pairs.
const rows: ListRow[] = [
  {
    sysId: 'inc001',
    fields: {
      number:            { value: 'INC0001001', displayValue: 'INC0001001' },
      short_description: { value: 'Cannot access email', displayValue: 'Cannot access email' },
      priority:          { value: '1',          displayValue: '1 - Critical' },
    },
  },
  // ...
];

<List columns={columns} rows={rows} />`}
            />
          ),
        },
        {
          title: 'With sort, search, and pagination (pages mode)',
          children: (
            <CodeSnippet
              code={`import { useState, useEffect } from 'react';
import { List, ListRow, ColumnDefinition } from 'servicenow-sdk-react-component-pack';
import * as RecordService from './services/RecordService';

const COLUMNS: ColumnDefinition[] = [
  { field: 'number',            label: 'Number',      width: '120px', sortable: true },
  { field: 'short_description', label: 'Description'                               },
  { field: 'priority',          label: 'Priority',    width: '100px', sortable: true },
];

const PAGE_SIZE = 20;

function IncidentList() {
  const [rows, setRows]         = useState<ListRow[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [sortField, setSortField]         = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [searchTerm, setSearchTerm]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<Error | undefined>();

  useEffect(() => {
    setLoading(true);
    setError(undefined);

    const filter = searchTerm
      ? \`short_descriptionCONTAINS\${searchTerm}^ORnumberCONTAINS\${searchTerm}\`
      : undefined;

    RecordService.getRecords('incident', ['number', 'short_description', 'priority'], {
      filter,
      orderBy: sortField ?? undefined,
      orderDirection: sortDirection ?? undefined,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    })
      .then(({ rows: fetched, totalCount }) => {
        setRows(fetched.map((r) => ({ sysId: r.sys_id.value, fields: r })));
        setTotal(totalCount);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [page, sortField, sortDirection, searchTerm]);

  return (
    <List
      rows={rows}
      columns={COLUMNS}
      totalCount={total}
      loading={loading}
      error={error}
      showSearch
      onSortChange={(field, direction) => {
        setSortField(direction === null ? null : field);
        setSortDirection(direction);
        setPage(1);
      }}
      onSearchChange={(term) => {
        setSearchTerm(term);
        setPage(1);
      }}
      pagination={{
        mode: 'pages',
        pageSize: PAGE_SIZE,
        currentPage: page,
        onPageChange: setPage,
      }}
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
  { field: 'number', label: 'Number', width: '120px' },
  { field: 'short_description', label: 'Description' },
  {
    field: 'priority',
    label: 'Priority',
    width: '140px',
    renderCell: (_row, value) => {
      const variant =
        value.value === '1' ? 'danger'   :
        value.value === '2' ? 'warning'  :
        value.value === '3' ? 'info'     : 'default';
      return <Badge label={value.displayValue} variant={variant} />;
    },
  },
];

// Display value is used for rendering only.
// The raw value is used only for data operations — never pass it to an API as a display value.`}
            />
          ),
        },
        {
          title: 'Multi-table merged list',
          children: (
            <CodeSnippet
              code={`// Use List (not RecordList) when combining records from multiple tables.
// Each row carries its own table so onRowEdit can open the correct record.
import { useState, useEffect } from 'react';
import { List, ListRow } from 'servicenow-sdk-react-component-pack';
import * as RecordService from './services/RecordService';

const COLUMNS = [
  { field: 'number',            label: 'Number',   width: '120px' },
  { field: 'short_description', label: 'Task'                     },
  { field: 'due_date',          label: 'Due',      width: '110px', sortable: true },
];

const FIELDS = ['number', 'short_description', 'due_date'];

function MyWorkList() {
  const [rows, setRows]     = useState<ListRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const me = 'javascript:gs.getUserID()';
    Promise.all([
      RecordService.getRecords('incident',    FIELDS, { filter: \`assigned_to=\${me}^active=true\` }),
      RecordService.getRecords('change_task', FIELDS, { filter: \`assigned_to=\${me}^active=true\` }),
      RecordService.getRecords('sc_task',     FIELDS, { filter: \`assigned_to=\${me}^active=true\` }),
    ]).then(([inc, chg, cat]) => {
      const merged: ListRow[] = [
        ...inc.rows.map((r) => ({ sysId: r.sys_id.value, table: 'incident',    fields: r })),
        ...chg.rows.map((r) => ({ sysId: r.sys_id.value, table: 'change_task', fields: r })),
        ...cat.rows.map((r) => ({ sysId: r.sys_id.value, table: 'sc_task',     fields: r })),
      ].sort((a, b) =>
        (a.fields.due_date?.value ?? '').localeCompare(b.fields.due_date?.value ?? '')
      );
      setRows(merged);
      setLoading(false);
    });
  }, []);

  return (
    <List
      rows={rows}
      columns={COLUMNS}
      loading={loading}
      onRowEdit={(sysId, table) => openModal(sysId, table)}
    />
  );
}`}
            />
          ),
        },
        {
          title: 'Selectable list with bulk action',
          children: (
            <CodeSnippet
              code={`import { useState } from 'react';
import { List, Button } from 'servicenow-sdk-react-component-pack';

function SelectableList() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div>
      {selected.length > 0 && (
        <Button variant="danger" onClick={() => handleBulkDelete(selected)}>
          Delete {selected.length} record{selected.length > 1 ? 's' : ''}
        </Button>
      )}
      <List
        rows={rows}
        columns={columns}
        selectable
        onRowSelect={setSelected}
        onRowEdit={(sysId) => openDrawer(sysId)}
        totalCount={total}
        pagination={{ mode: 'pages', pageSize: 20, currentPage: page, onPageChange: setPage }}
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
