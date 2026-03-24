import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { TextAreaField } from '../../../npm-package/components/molecules/TextAreaField';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

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
      title="TextAreaField"
      description="Field molecule for multi-line text values — used for string fields with maxLength > 255, or fields of type text/html/translated_text. Composes FieldWrapper with TextArea."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">States</Text>
              <TextAreaField
                name="desc-normal"
                label="Description"
                value={SAMPLE_TEXT}
                displayValue={SAMPLE_TEXT}
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <TextAreaField
                name="desc-mandatory"
                label="Description"
                value=""
                displayValue=""
                mandatory={true}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <TextAreaField
                name="desc-error"
                label="Description"
                value=""
                displayValue=""
                mandatory={true}
                readOnly={false}
                hasError={true}
                onChange={() => undefined}
              />
              <TextAreaField
                name="desc-readonly"
                label="Description"
                value={SAMPLE_TEXT}
                displayValue={SAMPLE_TEXT}
                mandatory={false}
                readOnly={true}
                hasError={false}
                onChange={() => undefined}
              />

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive</Text>
              <TextAreaField
                name="desc-live"
                label="Description"
                value={liveValue}
                displayValue={liveValue}
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
                { name: 'name', type: 'string', required: true, description: 'Field name — used as the textarea id and passed to onChange.' },
                { name: 'label', type: 'string', required: true, description: 'Label text rendered above the textarea.' },
                { name: 'value', type: 'string', required: true, description: 'Actual stored value.' },
                { name: 'displayValue', type: 'string', required: true, description: 'Display value. Equals value for text fields.' },
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
              code={`import { TextAreaField } from 'servicenow-sdk-react-component-pack';

const [description, setDescription] = useState('');

<TextAreaField
  name="description"
  label="Description"
  value={description}
  displayValue={description}
  mandatory={false}
  readOnly={false}
  hasError={false}
  onChange={(_field, v) => setDescription(v)}
/>`}
            />
          ),
        },
      ]}
    />
  );
}
