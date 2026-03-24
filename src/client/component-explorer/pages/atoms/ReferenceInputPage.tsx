import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { ReferenceInput, ReferenceResult } from '../../../npm-package/components/atoms/ReferenceInput';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

// Mock data to simulate a real search response
const MOCK_RESULTS: ReferenceResult[] = [
  { sysId: 'abc001', displayValue: 'Abel Tuter', columns: [{ field: 'name', value: 'Abel Tuter' }, { field: 'email', value: 'abel.tuter@example.com' }] },
  { sysId: 'abc002', displayValue: 'Abigail Harris', columns: [{ field: 'name', value: 'Abigail Harris' }, { field: 'email', value: 'a.harris@example.com' }] },
  { sysId: 'abc003', displayValue: 'Abraham Lincoln', columns: [{ field: 'name', value: 'Abraham Lincoln' }, { field: 'email', value: 'alincoln@example.com' }] },
];

// Interactive demo component with simulated search delay
function InteractiveDemo(): React.ReactElement {
  const theme = useTheme();
  const [value, setValue] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [searchResults, setSearchResults] = useState<ReferenceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimerId, setSearchTimerId] = useState<number | null>(null);

  function handleSearchTermChange(term: string) {
    if (searchTimerId !== null) {
      clearTimeout(searchTimerId);
    }
    if (term.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const id = window.setTimeout(() => {
      const filtered = MOCK_RESULTS.filter((r) =>
        r.displayValue.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 400);
    setSearchTimerId(id);
  }

  function handleChange(sysId: string, dv: string) {
    setValue(sysId);
    setDisplayValue(dv);
    setSearchResults([]);
  }

  function handleClear() {
    setValue('');
    setDisplayValue('');
    setSearchResults([]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacingSm }}>
      <ReferenceInput
        id="ri-interactive"
        value={value}
        displayValue={displayValue}
        onChange={handleChange}
        onSearchTermChange={handleSearchTermChange}
        onClear={handleClear}
        onInfoClick={() => alert(`Info clicked for sys_id: ${value}`)}
        searchResults={searchResults}
        isSearching={isSearching}
        placeholder="Type a name (e.g. 'ab')…"
      />
      <Text variant="caption">
        {value ? `Selected: "${displayValue}" (sys_id: ${value})` : 'No selection'}
      </Text>
    </div>
  );
}

export function ReferenceInputPage(): React.ReactElement {
  const theme = useTheme();

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingMd,
  };

  const stateRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    alignItems: 'center',
    gap: theme.spacingMd,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: theme.fontSizeSmall,
    color: theme.colorTextMuted,
  };

  return (
    <PageLayout
      title="ReferenceInput"
      description="Typeahead search input for ServiceNow reference fields. Manages dropdown, selected-value display, pen/info icons, and flip-up positioning. All service calls are handled by the parent — this atom only renders and fires callbacks."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={rowStyle}>
              <Text variant="label">Static states</Text>
              <div style={stateRowStyle}>
                <span style={labelStyle}>empty</span>
                <ReferenceInput
                  id="ri-empty"
                  value=""
                  displayValue=""
                  onChange={() => undefined}
                  onSearchTermChange={() => undefined}
                  onClear={() => undefined}
                  searchResults={[]}
                  isSearching={false}
                  placeholder="Type to search…"
                />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>selected</span>
                <ReferenceInput
                  id="ri-selected"
                  value="abc123"
                  displayValue="Abel Tuter"
                  onChange={() => undefined}
                  onSearchTermChange={() => undefined}
                  onClear={() => undefined}
                  onInfoClick={() => undefined}
                  searchResults={[]}
                  isSearching={false}
                />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>hasError</span>
                <ReferenceInput
                  id="ri-error"
                  value=""
                  displayValue=""
                  onChange={() => undefined}
                  onSearchTermChange={() => undefined}
                  onClear={() => undefined}
                  searchResults={[]}
                  isSearching={false}
                  hasError
                  placeholder="Type to search…"
                />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>readOnly</span>
                <ReferenceInput
                  id="ri-readonly"
                  value="abc123"
                  displayValue="Abel Tuter"
                  onChange={() => undefined}
                  onSearchTermChange={() => undefined}
                  onClear={() => undefined}
                  onInfoClick={() => undefined}
                  searchResults={[]}
                  isSearching={false}
                  readOnly
                />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>readOnly empty</span>
                <ReferenceInput
                  id="ri-readonly-empty"
                  value=""
                  displayValue=""
                  onChange={() => undefined}
                  onSearchTermChange={() => undefined}
                  onClear={() => undefined}
                  searchResults={[]}
                  isSearching={false}
                  readOnly
                />
              </div>

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive (mock data)</Text>
              <Text variant="caption" style={{ color: theme.colorTextMuted }}>
                Type at least 2 characters. Mock results simulate a 400ms search delay. Try typing "ab".
              </Text>
              <InteractiveDemo />
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'id', type: 'string', required: true, description: 'HTML id applied to the internal text input.' },
                { name: 'value', type: 'string', required: true, description: 'Actual stored value (sys_id). Empty string means no selection.' },
                { name: 'displayValue', type: 'string', required: true, description: 'Human-readable display value shown when a record is selected.' },
                { name: 'onChange', type: '(value: string, displayValue: string) => void', required: true, description: 'Called when the user selects a result from the dropdown.' },
                { name: 'onSearchTermChange', type: '(term: string) => void', required: true, description: 'Called on every keystroke — the parent should debounce and trigger a search.' },
                { name: 'onClear', type: '() => void', required: true, description: 'Called when the pen icon is clicked to clear the selection.' },
                { name: 'onInfoClick', type: '() => void', description: 'Called when the info icon is clicked. Info icon is only shown when a value is present.' },
                { name: 'searchResults', type: 'ReferenceResult[]', required: true, description: 'Array of results returned by the parent search handler.' },
                { name: 'isSearching', type: 'boolean', required: true, description: 'When true, shows a loading indicator in the dropdown.' },
                { name: 'searchError', type: 'string', description: 'Error message displayed in the dropdown when a search fails.' },
                { name: 'readOnly', type: 'boolean', defaultValue: 'false', description: 'When true, renders display value as plain text with no editing capability.' },
                { name: 'mandatory', type: 'boolean', description: 'Sets the native required attribute on the internal input.' },
                { name: 'hasError', type: 'boolean', defaultValue: 'false', description: 'Applies a red border to indicate a validation error.' },
                { name: 'placeholder', type: 'string', defaultValue: "'Type to search...'", description: 'Placeholder text shown when no value is selected.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides applied to the root container.' },
                { name: 'className', type: 'string', description: 'CSS class name override applied to the root container.' },
              ]}
            />
          ),
        },
        {
          title: 'Usage',
          children: (
            <CodeSnippet
              code={`import { ReferenceInput, ReferenceResult } from 'servicenow-sdk-react-component-pack';
import { SearchService } from 'servicenow-sdk-react-component-pack';

const [value, setValue] = useState('');
const [displayValue, setDisplayValue] = useState('');
const [results, setResults] = useState<ReferenceResult[]>([]);
const [searching, setSearching] = useState(false);
const debounceRef = useRef<number | null>(null);

function handleSearchTermChange(term: string) {
  if (debounceRef.current) clearTimeout(debounceRef.current);
  if (term.length < 2) { setResults([]); return; }
  setSearching(true);
  debounceRef.current = window.setTimeout(async () => {
    const found = await SearchService.searchRecords('sys_user', term);
    setResults(found);
    setSearching(false);
  }, 300);
}

<ReferenceInput
  id="assigned-to"
  value={value}
  displayValue={displayValue}
  onChange={(sysId, dv) => { setValue(sysId); setDisplayValue(dv); }}
  onSearchTermChange={handleSearchTermChange}
  onClear={() => { setValue(''); setDisplayValue(''); setResults([]); }}
  onInfoClick={() => openInfoPopover(value)}
  searchResults={results}
  isSearching={searching}
  placeholder="Type to search users…"
/>`}
            />
          ),
        },
      ]}
    />
  );
}
