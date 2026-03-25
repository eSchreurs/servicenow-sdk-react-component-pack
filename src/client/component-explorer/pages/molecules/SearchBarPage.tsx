import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { SearchBar } from '../../../npm-package/components/molecules/SearchBar';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

const DEMO_ITEMS = [
  'Assigned to',
  'Assignment group',
  'Short description',
  'Description',
  'Priority',
  'Category',
  'Subcategory',
  'Impact',
  'Urgency',
  'State',
];

export function SearchBarPage(): React.ReactElement {
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState('');

  const filteredItems = DEMO_ITEMS.filter((item) =>
    item.toLowerCase().includes(searchValue.toLowerCase())
  );

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingMd,
    maxWidth: '400px',
  };

  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingXs,
    marginTop: theme.spacingXs,
  };

  const listItemStyle: React.CSSProperties = {
    padding: `${theme.spacingXs} ${theme.spacingSm}`,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
    color: theme.colorText,
    backgroundColor: theme.colorBackground,
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadiusSm,
  };

  const emptyStyle: React.CSSProperties = {
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeSmall,
    color: theme.colorTextMuted,
    padding: `${theme.spacingXs} ${theme.spacingSm}`,
  };

  return (
    <PageLayout
      title="SearchBar"
      description="General-purpose search input. Shows a search icon on the left and a clear icon on the right when the input has a value. Debounces the onChange callback (default 300ms). Does not call any service directly — the parent handles filtering."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">Empty state</Text>
              <SearchBar
                value=""
                onChange={() => undefined}
                placeholder="Search components..."
              />

              <Text variant="label">With value</Text>
              <SearchBar
                value="short"
                onChange={() => undefined}
                placeholder="Search components..."
              />

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>
                Interactive — filter a list
              </Text>
              <Text variant="caption" style={{ color: theme.colorTextMuted }}>
                Type to filter the list below. onChange is debounced at 300ms.
              </Text>
              <SearchBar
                value={searchValue}
                onChange={setSearchValue}
                placeholder="Search fields..."
              />
              <div style={listStyle}>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div key={item} style={listItemStyle}>{item}</div>
                  ))
                ) : (
                  <div style={emptyStyle}>No results for "{searchValue}"</div>
                )}
              </div>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'value', type: 'string', required: true, description: 'Controlled search input value.' },
                { name: 'onChange', type: '(value: string) => void', required: true, description: 'Called with the current input value after the debounce delay. Also called immediately when the clear button is clicked.' },
                { name: 'placeholder', type: 'string', defaultValue: "'Search...'", description: 'Placeholder text shown when the input is empty.' },
                { name: 'debounceMs', type: 'number', defaultValue: '300', description: 'Debounce delay in milliseconds before onChange is called after typing.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides applied to the container div.' },
                { name: 'className', type: 'string', description: 'CSS class name override applied to the container div.' },
              ]}
            />
          ),
        },
        {
          title: 'Usage',
          children: (
            <CodeSnippet
              code={`import { useState } from 'react';
import { SearchBar } from 'servicenow-sdk-react-component-pack';

const GROUPS = [
  { sysId: '1', name: 'Network Operations' },
  { sysId: '2', name: 'Service Desk' },
  { sysId: '3', name: 'Database Admins' },
];

function GroupPicker() {
  const [query, setQuery] = useState('');

  const filtered = GROUPS.filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Search groups..."
      />
      {filtered.map((group) => (
        <div key={group.sysId}>{group.name}</div>
      ))}
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
