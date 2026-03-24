import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { Field } from '../../../npm-package/components/molecules/Field';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

export function NumberFieldPage(): React.ReactElement {
  const theme = useTheme();
  const [liveValue, setLiveValue] = useState('');

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingMd,
    maxWidth: '300px',
  };

  return (
    <PageLayout
      title="Field — numeric types"
      description="Field molecule rendering a number input for integer, decimal, float, and currency types. Both value and displayValue are the numeric string — onChange is called with the same string for both."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">States</Text>
              <Field
                type="integer"
                name="num-normal"
                label="Impact"
                value="2"
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="integer"
                name="num-mandatory"
                label="Impact"
                value=""
                mandatory={true}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="integer"
                name="num-error"
                label="Impact"
                value=""
                mandatory={true}
                readOnly={false}
                hasError={true}
                onChange={() => undefined}
              />
              <Field
                type="integer"
                name="num-readonly"
                label="Impact"
                value="2"
                mandatory={false}
                readOnly={true}
                hasError={false}
                onChange={() => undefined}
              />

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive</Text>
              <Field
                type="integer"
                name="num-live"
                label="Impact"
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
                { name: 'type', type: "string ('integer' | 'decimal' | 'float' | 'currency')", required: true, description: "Any numeric type resolves to a number input." },
                { name: 'name', type: 'string', required: true, description: 'Field name — used as the input id and passed to onChange.' },
                { name: 'label', type: 'string', required: true, description: 'Label text rendered above the input.' },
                { name: 'value', type: 'string', required: true, description: 'Numeric value as a string (e.g. "3" or "1.5").' },
                { name: 'mandatory', type: 'boolean', required: true, description: 'When true, renders a red asterisk next to the label.' },
                { name: 'readOnly', type: 'boolean', required: true, description: 'When true, renders the value as plain text.' },
                { name: 'hasError', type: 'boolean', required: true, description: 'When true, applies a red error outline.' },
                { name: 'onChange', type: '(field: string, value: string, displayValue: string) => void', required: true, description: 'Called with the numeric string for both value and displayValue.' },
                { name: 'maxLength', type: 'number', description: 'Maximum character limit enforced on the input string.' },
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

const [impact, setImpact] = useState('');

<Field
  type="integer"
  name="impact"
  label="Impact"
  value={impact}
  mandatory={true}
  readOnly={false}
  hasError={impact === ''}
  onChange={(_field, v) => setImpact(v)}
/>`}
            />
          ),
        },
      ]}
    />
  );
}
