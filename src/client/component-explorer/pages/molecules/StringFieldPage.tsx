import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { Field } from '../../../npm-package/components/atoms/Field';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

export function StringFieldPage(): React.ReactElement {
  const theme = useTheme();
  const [liveValue, setLiveValue] = useState('');

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingMd,
    maxWidth: '400px',
  };

  return (
    <PageLayout
      title="Field — string type"
      description="Field molecule rendering a single-line text input for string values ≤ 255 characters. Pass type='string' and the component resolves to TextInput wrapped in FieldWrapper."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">States</Text>
              <Field
                type="string"
                name="sd-normal"
                label="Short description"
                value="Login button is broken"
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="string"
                name="sd-mandatory"
                label="Short description"
                value=""
                mandatory={true}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="string"
                name="sd-error"
                label="Short description"
                value=""
                mandatory={true}
                readOnly={false}
                hasError={true}
                onChange={() => undefined}
              />
              <Field
                type="string"
                name="sd-readonly"
                label="Short description"
                value="Login button is broken"
                mandatory={false}
                readOnly={true}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="string"
                name="sd-readonly-empty"
                label="Short description (empty)"
                value=""
                mandatory={false}
                readOnly={true}
                hasError={false}
                onChange={() => undefined}
              />

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive</Text>
              <Field
                type="string"
                name="sd-live"
                label="Short description"
                value={liveValue}
                mandatory={false}
                readOnly={false}
                hasError={false}
                maxLength={160}
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
                { name: 'type', type: "string ('string')", required: true, description: "Set to 'string' to render a single-line text input." },
                { name: 'name', type: 'string', required: true, description: 'Field name — used as the input id and passed to onChange as the first argument.' },
                { name: 'label', type: 'string', required: true, description: 'Label text rendered above the input.' },
                { name: 'value', type: 'string', required: true, description: 'Actual stored value.' },
                { name: 'mandatory', type: 'boolean', required: true, description: 'When true, renders a red asterisk next to the label.' },
                { name: 'readOnly', type: 'boolean', required: true, description: 'When true, renders the value as plain text with no interactive input.' },
                { name: 'hasError', type: 'boolean', required: true, description: 'When true, applies a red error outline to the field.' },
                { name: 'onChange', type: '(field: string, value: string, displayValue: string) => void', required: true, description: 'Called on every keystroke with the field name and updated value.' },
                { name: 'maxLength', type: 'number', description: 'Maximum character length enforced on the input. Should come from field metadata.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides applied to the outer wrapper.' },
                { name: 'className', type: 'string', description: 'CSS class name override applied to the outer wrapper.' },
              ]}
            />
          ),
        },
        {
          title: 'Usage',
          children: (
            <CodeSnippet
              code={`import { Field } from 'servicenow-sdk-react-component-pack';

const [value, setValue] = useState('');

<Field
  type="string"
  name="short_description"
  label="Short description"
  value={value}
  mandatory={true}
  readOnly={false}
  hasError={value === ''}
  maxLength={160}
  onChange={(_field, v) => setValue(v)}
/>

// Read-only
<Field
  type="string"
  name="short_description"
  label="Short description"
  value={record.short_description}
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
