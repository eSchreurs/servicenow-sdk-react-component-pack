import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { Field } from '../../../npm-package/components/molecules/Field';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

export function CheckboxFieldPage(): React.ReactElement {
  const theme = useTheme();
  const [liveValue, setLiveValue] = useState('false');

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingMd,
    maxWidth: '360px',
  };

  return (
    <PageLayout
      title="Field — boolean type"
      description="Field molecule for boolean fields. Pass type='boolean'. Value and displayValue are the strings 'true' or 'false'. In read-only mode renders as a disabled non-interactive checkbox."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">States</Text>
              <Field
                type="boolean"
                name="cb-unchecked"
                label="Active"
                value="false"
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="boolean"
                name="cb-checked"
                label="Active"
                value="true"
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="boolean"
                name="cb-error"
                label="Active"
                value="false"
                mandatory={true}
                readOnly={false}
                hasError={true}
                onChange={() => undefined}
              />
              <Field
                type="boolean"
                name="cb-readonly-checked"
                label="Active (read-only)"
                value="true"
                mandatory={false}
                readOnly={true}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="boolean"
                name="cb-readonly-unchecked"
                label="Active (read-only)"
                value="false"
                mandatory={false}
                readOnly={true}
                hasError={false}
                onChange={() => undefined}
              />

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive</Text>
              <Field
                type="boolean"
                name="cb-live"
                label="Active"
                value={liveValue}
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={(_field, v) => setLiveValue(v)}
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
                { name: 'type', type: "string ('boolean')", required: true, description: "Set to 'boolean' to render a checkbox." },
                { name: 'name', type: 'string', required: true, description: 'Field name — used as the checkbox id and passed to onChange.' },
                { name: 'label', type: 'string', required: true, description: 'Label text rendered above the checkbox.' },
                { name: 'value', type: "string ('true' | 'false')", required: true, description: "Stored boolean as a string. Must be 'true' or 'false'." },
                { name: 'mandatory', type: 'boolean', required: true, description: 'When true, renders a red asterisk next to the label.' },
                { name: 'readOnly', type: 'boolean', required: true, description: 'When true, renders a disabled non-interactive checkbox.' },
                { name: 'hasError', type: 'boolean', required: true, description: "When true, FieldWrapper applies a red error outline." },
                { name: 'onChange', type: '(field: string, value: string, displayValue: string) => void', required: true, description: "Called with 'true' or 'false' for both value and displayValue." },
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
              code={`import { Field } from 'servicenow-sdk-react-component-pack';

// value and displayValue are 'true' / 'false' strings
const [active, setActive] = useState('false');

<Field
  type="boolean"
  name="active"
  label="Active"
  value={active}
  mandatory={false}
  readOnly={false}
  hasError={false}
  onChange={(_field, v) => setActive(v)}
/>

// Read-only
<Field
  type="boolean"
  name="active"
  label="Active"
  value={record.active}
  mandatory={false}
  readOnly={true}
  hasError={false}
  onChange={() => undefined}
/>`}
            />
          ),
        },
      ]}
    />
  );
}
