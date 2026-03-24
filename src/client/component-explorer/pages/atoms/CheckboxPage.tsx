import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { Checkbox } from '../../../npm-package/components/atoms/Checkbox';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

export function CheckboxPage(): React.ReactElement {
  const theme = useTheme();
  const [liveValue, setLiveValue] = useState(false);

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingSm,
  };

  const stateRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '140px auto',
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
      title="Checkbox"
      description="Boolean toggle input. Controlled component. In read-only mode renders as a disabled, non-interactive checkbox."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={rowStyle}>
              <Text variant="label">States</Text>
              <div style={stateRowStyle}>
                <span style={labelStyle}>unchecked</span>
                <Checkbox id="cb-unchecked" value={false} onChange={() => undefined} />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>checked</span>
                <Checkbox id="cb-checked" value={true} onChange={() => undefined} />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>readOnly unchecked</span>
                <Checkbox id="cb-ro-unchecked" value={false} onChange={() => undefined} readOnly />
              </div>
              <div style={stateRowStyle}>
                <span style={labelStyle}>readOnly checked</span>
                <Checkbox id="cb-ro-checked" value={true} onChange={() => undefined} readOnly />
              </div>

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacingMd }}>
                <Checkbox id="cb-live" value={liveValue} onChange={setLiveValue} />
                <Text variant="body">Value: {liveValue ? 'true' : 'false'}</Text>
              </div>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'id', type: 'string', required: true, description: 'HTML id applied to the checkbox input.' },
                { name: 'value', type: 'boolean', required: true, description: 'Controlled checked state.' },
                { name: 'onChange', type: '(value: boolean) => void', required: true, description: 'Called with the new boolean value when the checkbox is toggled.' },
                { name: 'readOnly', type: 'boolean', defaultValue: 'false', description: 'When true, renders a disabled non-interactive checkbox.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides applied to the wrapper element.' },
                { name: 'className', type: 'string', description: 'CSS class name override applied to the wrapper element.' },
              ]}
            />
          ),
        },
        {
          title: 'Usage',
          children: (
            <CodeSnippet
              code={`import { Checkbox } from 'servicenow-sdk-react-component-pack';

const [active, setActive] = useState(false);

<Checkbox
  id="active"
  value={active}
  onChange={setActive}
/>

// Read-only (e.g. from a form in view mode)
<Checkbox
  id="active-view"
  value={record.active}
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
