import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { SelectInput, SelectOption } from '../../../npm-package/components/atoms/SelectInput';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: '1', label: '1 - Critical' },
  { value: '2', label: '2 - High' },
  { value: '3', label: '3 - Moderate' },
  { value: '4', label: '4 - Low' },
  { value: '5', label: '5 - Planning' },
];

export function SelectInputPage(): React.ReactElement {
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
      title="SelectInput"
      description="Dropdown choice input. Controlled component. Options are passed as an array of value/label pairs. Error borders are managed by FieldWrapper when used inside Field."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={rowStyle}>
              <Text variant="label">States</Text>
              <div style={stateRowStyle}>
                <span style={labelStyle}>with value</span>
                <SelectInput
                  id="si-value"
                  value="3"
                  options={PRIORITY_OPTIONS}
                  onChange={() => undefined}
                />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>placeholder</span>
                <SelectInput
                  id="si-placeholder"
                  value=""
                  options={PRIORITY_OPTIONS}
                  onChange={() => undefined}
                  placeholder="-- Select priority --"
                />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>readOnly</span>
                <SelectInput
                  id="si-readonly"
                  value="2"
                  options={PRIORITY_OPTIONS}
                  onChange={() => undefined}
                  readOnly
                />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>readOnly empty</span>
                <SelectInput
                  id="si-readonly-empty"
                  value=""
                  options={PRIORITY_OPTIONS}
                  onChange={() => undefined}
                  readOnly
                />
              </div>

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive</Text>
              <SelectInput
                id="si-live"
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
                { name: 'options', type: 'SelectOption[]', required: true, description: 'Array of { value, label } pairs. value is the stored value; label is the display text.' },
                { name: 'onChange', type: '(value: string) => void', required: true, description: 'Called with the stored value of the selected option.' },
                { name: 'readOnly', type: 'boolean', defaultValue: 'false', description: 'When true, the select is disabled (HTML select has no readOnly attribute). Use Field for read-only rendering as a span.' },
                { name: 'mandatory', type: 'boolean', description: 'Sets the native required attribute.' },
                { name: 'placeholder', type: 'string', description: 'When provided, rendered as the first blank option in the dropdown.' },
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
              code={`import { SelectInput, SelectOption } from 'servicenow-sdk-react-component-pack';

const options: SelectOption[] = [
  { value: '1', label: '1 - Critical' },
  { value: '2', label: '2 - High' },
  { value: '3', label: '3 - Moderate' },
];

const [priority, setPriority] = useState('');

<SelectInput
  id="priority"
  value={priority}
  options={options}
  onChange={setPriority}
  placeholder="-- Select priority --"
/>

// Read-only
<SelectInput
  id="priority-view"
  value={record.priority}
  options={options}
  onChange={() => undefined}
  readOnly
/>`}
            />
          ),
        },
      ]}
    />
  );
}
