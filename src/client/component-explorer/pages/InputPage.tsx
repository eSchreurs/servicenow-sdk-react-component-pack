import React, { useState } from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';
import { Input } from '../../npm-package/components/actions/Input';
import { Text } from '../../npm-package/components/primitives/Text';
import { PropTable } from '../components/PropTable';
import { CodeSnippet } from '../components/CodeSnippet';
import { PageLayout } from '../components/PageLayout';

export function InputPage(): React.ReactElement {
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
      title="Input"
      description="Single-line text input. A dumb controlled atom — no validation, no error states, no read-only handling. Use Field for form behaviour."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={rowStyle}>
              <Text variant="label">States</Text>
              <div style={stateRowStyle}>
                <span style={labelStyle}>default</span>
                <Input id="in-default" value="Hello, world!" onChange={() => undefined} />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>placeholder</span>
                <Input id="in-placeholder" value="" onChange={() => undefined} placeholder="Type something…" />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>type="number"</span>
                <Input id="in-number" value="42" onChange={() => undefined} type="number" />
              </div>

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive</Text>
              <Input
                id="in-live"
                value={liveValue}
                onChange={setLiveValue}
                placeholder="Type here…"
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
                { name: 'type', type: 'string', defaultValue: "'text'", description: "HTML input type (e.g. 'text', 'number', 'email', 'url')." },
                { name: 'placeholder', type: 'string', description: 'Placeholder text shown when value is empty.' },
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
              code={`import { Input } from 'servicenow-sdk-react-component-pack';

const [value, setValue] = useState('');

<Input
  id="short-description"
  value={value}
  onChange={setValue}
  placeholder="Enter text…"
/>

// Number input
<Input
  id="count"
  value={count}
  onChange={setCount}
  type="number"
/>`}
            />
          ),
        },
      ]}
    />
  );
}
