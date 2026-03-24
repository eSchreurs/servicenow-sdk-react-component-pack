import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { StringField } from '../../../npm-package/components/molecules/StringField';
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
      title="StringField"
      description="Field molecule for string values ≤ 255 characters. Composes FieldWrapper (label, mandatory asterisk, error border) with TextInput. Both value and displayValue are the same string — onChange is called with the same string for both."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">States</Text>
              <StringField
                name="sd-normal"
                label="Short description"
                value="Login button is broken"
                displayValue="Login button is broken"
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <StringField
                name="sd-mandatory"
                label="Short description"
                value=""
                displayValue=""
                mandatory={true}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <StringField
                name="sd-error"
                label="Short description"
                value=""
                displayValue=""
                mandatory={true}
                readOnly={false}
                hasError={true}
                onChange={() => undefined}
              />
              <StringField
                name="sd-readonly"
                label="Short description"
                value="Login button is broken"
                displayValue="Login button is broken"
                mandatory={false}
                readOnly={true}
                hasError={false}
                onChange={() => undefined}
              />
              <StringField
                name="sd-readonly-empty"
                label="Short description (empty)"
                value=""
                displayValue=""
                mandatory={false}
                readOnly={true}
                hasError={false}
                onChange={() => undefined}
              />

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive</Text>
              <StringField
                name="sd-live"
                label="Short description"
                value={liveValue}
                displayValue={liveValue}
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
                { name: 'name', type: 'string', required: true, description: 'Field name — used as the input id and passed to onChange as the first argument.' },
                { name: 'label', type: 'string', required: true, description: 'Label text rendered above the input.' },
                { name: 'value', type: 'string', required: true, description: 'Actual stored value. For string fields this equals displayValue.' },
                { name: 'displayValue', type: 'string', required: true, description: 'Display value shown to the user. Equals value for string fields.' },
                { name: 'mandatory', type: 'boolean', required: true, description: 'When true, renders a red asterisk next to the label.' },
                { name: 'readOnly', type: 'boolean', required: true, description: 'When true, renders the value as plain text with no interactive input.' },
                { name: 'hasError', type: 'boolean', required: true, description: 'When true, applies a red error outline to the field.' },
                { name: 'onChange', type: '(field: string, value: string, displayValue: string) => void', required: true, description: 'Called on every keystroke with the field name and updated value (both value and displayValue are the same string).' },
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
              code={`import { StringField } from 'servicenow-sdk-react-component-pack';

const [value, setValue] = useState('');

<StringField
  name="short_description"
  label="Short description"
  value={value}
  displayValue={value}
  mandatory={true}
  readOnly={false}
  hasError={value === ''}
  maxLength={160}
  onChange={(_field, v) => setValue(v)}
/>

// Read-only
<StringField
  name="short_description"
  label="Short description"
  value={record.short_description}
  displayValue={record.short_description}
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
