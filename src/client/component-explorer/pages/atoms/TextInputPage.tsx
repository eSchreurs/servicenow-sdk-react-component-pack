import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { TextInput } from '../../../npm-package/components/atoms/TextInput';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

export function TextInputPage(): React.ReactElement {
  const theme = useTheme();
  const [liveValue, setLiveValue] = useState('');

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingMd,
  };

  const stateRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
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
      title="TextInput"
      description="Single-line text input. Controlled component — receives value and calls onChange. In read-only mode renders as plain text (not a disabled input)."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={rowStyle}>
              <Text variant="label">States</Text>
              <div style={stateRowStyle}>
                <span style={labelStyle}>default</span>
                <TextInput id="ti-default" value="Hello, world!" onChange={() => undefined} placeholder="Placeholder…" />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>placeholder</span>
                <TextInput id="ti-placeholder" value="" onChange={() => undefined} placeholder="Type something…" />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>hasError</span>
                <TextInput id="ti-error" value="Invalid value" onChange={() => undefined} hasError />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>readOnly</span>
                <TextInput id="ti-readonly" value="Read-only value" onChange={() => undefined} readOnly />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>readOnly empty</span>
                <TextInput id="ti-readonly-empty" value="" onChange={() => undefined} readOnly />
              </div>

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive</Text>
              <TextInput
                id="ti-live"
                value={liveValue}
                onChange={setLiveValue}
                placeholder="Type here…"
                maxLength={80}
              />
              <Text variant="caption">Value: "{liveValue}"</Text>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'id', type: 'string', required: true, description: 'HTML id applied to the input element.' },
                { name: 'value', type: 'string', required: true, description: 'Controlled value.' },
                { name: 'onChange', type: '(value: string) => void', required: true, description: 'Called with the new value on every keystroke.' },
                { name: 'readOnly', type: 'boolean', defaultValue: 'false', description: 'When true, renders a plain <span> instead of an interactive input.' },
                { name: 'mandatory', type: 'boolean', description: 'Sets the native required attribute.' },
                { name: 'maxLength', type: 'number', description: 'Maximum number of characters enforced via the native maxLength attribute.' },
                { name: 'placeholder', type: 'string', description: 'Placeholder text shown when value is empty.' },
                { name: 'inputType', type: 'string', defaultValue: "'text'", description: "HTML input type (e.g. 'text', 'email', 'url', 'number')." },
                { name: 'hasError', type: 'boolean', defaultValue: 'false', description: 'Applies a red border to indicate a validation error.' },
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
              code={`import { TextInput } from 'servicenow-sdk-react-component-pack';

// Controlled input
const [value, setValue] = useState('');

<TextInput
  id="short-description"
  value={value}
  onChange={setValue}
  placeholder="Enter short description…"
  maxLength={160}
/>

// Read-only
<TextInput
  id="number"
  value={record.number}
  onChange={() => undefined}
  readOnly
/>

// With validation error
<TextInput
  id="email"
  value={value}
  onChange={setValue}
  inputType="email"
  hasError={!isValid}
/>`}
            />
          ),
        },
      ]}
    />
  );
}
