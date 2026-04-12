import React, { useState } from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';
import { Dropdown } from '../../npm-package/components/actions/Dropdown';
import { Text } from '../../npm-package/components/primitives/Text';
import { PropTable } from '../components/PropTable';
import { CodeSnippet } from '../components/CodeSnippet';
import { PageLayout } from '../components/PageLayout';

const PRIORITY_OPTIONS = [
  { value: '1', label: '1 - Critical' },
  { value: '2', label: '2 - High' },
  { value: '3', label: '3 - Moderate' },
  { value: '4', label: '4 - Low' },
  { value: '5', label: '5 - Planning' },
];

export function DropdownPage(): React.ReactElement {
  const theme = useTheme();
  const [liveValue, setLiveValue] = useState('');

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

  const selectedLabel = PRIORITY_OPTIONS.find((o) => o.value === liveValue)?.label ?? '(none)';

  return (
    <PageLayout
      title="Dropdown"
      description="Select input. A dumb controlled atom — no validation, no error states, no read-only handling. Use Field for form behaviour."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={rowStyle}>
              <Text variant="label">States</Text>
              <div style={stateRowStyle}>
                <span style={labelStyle}>with value</span>
                <Dropdown
                  id="dd-value"
                  value="3"
                  options={PRIORITY_OPTIONS}
                  onChange={() => undefined}
                />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>placeholder</span>
                <Dropdown
                  id="dd-placeholder"
                  value=""
                  options={PRIORITY_OPTIONS}
                  onChange={() => undefined}
                  placeholder="-- Select priority --"
                />
              </div>

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive</Text>
              <Dropdown
                id="dd-live"
                value={liveValue}
                options={PRIORITY_OPTIONS}
                onChange={setLiveValue}
                placeholder="-- Select priority --"
              />
              <Text variant="caption">Selected: {selectedLabel}</Text>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'id', type: 'string', required: true, description: 'HTML id applied to the select element.' },
                { name: 'value', type: 'string', required: true, description: 'Controlled value — must match one of the option values, or empty string for no selection.' },
                { name: 'options', type: 'Array<{ value: string; label: string }>', required: true, description: 'Array of value/label pairs.' },
                { name: 'onChange', type: '(value: string) => void', required: true, description: 'Called with the stored value of the selected option.' },
                { name: 'placeholder', type: 'string', description: 'When provided, renders a blank first option with this text.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides.' },
                { name: 'className', type: 'string', description: 'CSS class name override.' },
              ]}
            />
          ),
        },
        {
          title: 'Usage',
          children: (
            <CodeSnippet
              code={`import { Dropdown } from 'servicenow-sdk-react-component-pack';

const options = [
  { value: '1', label: '1 - Critical' },
  { value: '2', label: '2 - High' },
  { value: '3', label: '3 - Moderate' },
];

const [priority, setPriority] = useState('');

<Dropdown
  id="priority"
  value={priority}
  options={options}
  onChange={setPriority}
  placeholder="-- Select priority --"
/>`}
            />
          ),
        },
      ]}
    />
  );
}
