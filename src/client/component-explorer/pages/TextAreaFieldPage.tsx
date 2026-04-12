import React, { useState } from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';
import { Field } from '../../npm-package/components/forms/fields/Field';
import { Text } from '../../npm-package/components/primitives/Text';
import { PropTable } from '../components/PropTable';
import { CodeSnippet } from '../components/CodeSnippet';
import { PageLayout } from '../components/PageLayout';

const SAMPLE_TEXT = 'Users are unable to log in via the customer portal. The issue started at approximately 09:00 UTC. Multiple users have reported the same error.';

export function TextAreaFieldPage(): React.ReactElement {
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
      title="Field — text type"
      description="Field molecule rendering a multi-line textarea for text values. Use type='text' (or 'html', 'translated_text'). Also applies when type='string' and maxLength > 255."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">States</Text>
              <Field
                type="text"
                name="desc-normal"
                label="Description"
                value={SAMPLE_TEXT}
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="text"
                name="desc-mandatory"
                label="Description"
                value=""
                mandatory={true}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="text"
                name="desc-error"
                label="Description"
                value=""
                mandatory={true}
                readOnly={false}
                hasError={true}
                onChange={() => undefined}
              />
              <Field
                type="text"
                name="desc-readonly"
                label="Description"
                value={SAMPLE_TEXT}
                mandatory={false}
                readOnly={true}
                hasError={false}
                onChange={() => undefined}
              />

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive</Text>
              <Field
                type="text"
                name="desc-live"
                label="Description"
                value={liveValue}
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={(_field, v) => setLiveValue(v)}
              />
              <Text variant="caption">Length: {liveValue.length} characters</Text>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'type', type: "string ('text' | 'html' | 'translated_text' | 'string')", required: true, description: "Set to 'text' (or 'html', 'translated_text') to render a textarea. Also applies when type='string' and maxLength > 255." },
                { name: 'name', type: 'string', required: true, description: 'Field name — used as the textarea id and passed to onChange.' },
                { name: 'label', type: 'string', required: true, description: 'Label text rendered above the textarea.' },
                { name: 'value', type: 'string', required: true, description: 'Actual stored value.' },
                { name: 'mandatory', type: 'boolean', required: true, description: 'When true, renders a red asterisk next to the label.' },
                { name: 'readOnly', type: 'boolean', required: true, description: 'When true, renders the value as pre-wrapped plain text.' },
                { name: 'hasError', type: 'boolean', required: true, description: 'When true, applies a red error outline to the field.' },
                { name: 'onChange', type: '(field: string, value: string, displayValue: string) => void', required: true, description: 'Called on every keystroke with the field name and updated value.' },
                { name: 'maxLength', type: 'number', description: 'Maximum character length enforced on the textarea.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides applied to the outer wrapper.' },
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

const [description, setDescription] = useState('');

<Field
  type="text"
  name="description"
  label="Description"
  value={description}
  mandatory={false}
  readOnly={false}
  hasError={false}
  onChange={(_field, v) => setDescription(v)}
/>

// Long string field (maxLength > 255) also renders a textarea
<Field
  type="string"
  name="description"
  label="Description"
  value={description}
  mandatory={false}
  readOnly={false}
  hasError={false}
  maxLength={1000}
  onChange={(_field, v) => setDescription(v)}
/>`}
            />
          ),
        },
      ]}
    />
  );
}
