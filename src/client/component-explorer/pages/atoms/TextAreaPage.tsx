import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { TextArea } from '../../../npm-package/components/atoms/TextArea';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

export function TextAreaPage(): React.ReactElement {
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
    alignItems: 'start',
    gap: theme.spacingMd,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: theme.fontSizeSmall,
    color: theme.colorTextMuted,
    paddingTop: theme.spacingSm,
  };

  return (
    <PageLayout
      title="TextArea"
      description="Multi-line text input. Controlled component with configurable row count. Error borders are managed by FieldWrapper when used inside Field."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={rowStyle}>
              <Text variant="label">States</Text>
              <div style={stateRowStyle}>
                <span style={labelStyle}>default</span>
                <TextArea
                  id="ta-default"
                  value="This is a multi-line text area with some example content."
                  onChange={() => undefined}
                  rows={3}
                />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>readOnly</span>
                <TextArea
                  id="ta-readonly"
                  value={'Read-only content.\nLine two of the value.'}
                  onChange={() => undefined}
                  readOnly
                />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>readOnly empty</span>
                <TextArea id="ta-readonly-empty" value="" onChange={() => undefined} readOnly />
              </div>

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive</Text>
              <TextArea
                id="ta-live"
                value={liveValue}
                onChange={setLiveValue}
                placeholder="Type here…"
                maxLength={500}
                rows={4}
              />
              <Text variant="caption">{liveValue.length} / 500 characters</Text>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'id', type: 'string', required: true, description: 'HTML id applied to the textarea element.' },
                { name: 'value', type: 'string', required: true, description: 'Controlled value.' },
                { name: 'onChange', type: '(value: string) => void', required: true, description: 'Called with the new value on every keystroke.' },
                { name: 'readOnly', type: 'boolean', defaultValue: 'false', description: 'When true, the native textarea is read-only (no interaction). Use Field for read-only rendering as a span.' },
                { name: 'mandatory', type: 'boolean', description: 'Sets the native required attribute.' },
                { name: 'maxLength', type: 'number', description: 'Maximum number of characters enforced via the native maxLength attribute.' },
                { name: 'placeholder', type: 'string', description: 'Placeholder text shown when value is empty.' },
                { name: 'rows', type: 'number', defaultValue: '4', description: 'Number of visible text rows.' },
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
              code={`import { TextArea } from 'servicenow-sdk-react-component-pack';

const [description, setDescription] = useState('');

<TextArea
  id="description"
  value={description}
  onChange={setDescription}
  placeholder="Enter a detailed description…"
  maxLength={4000}
  rows={6}
/>

// Read-only
<TextArea
  id="notes"
  value={record.notes}
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
