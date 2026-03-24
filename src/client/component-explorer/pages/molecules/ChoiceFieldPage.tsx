import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { Field } from '../../../npm-package/components/atoms/Field';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';
import { ChoiceEntry } from '../../../npm-package/types/index';

const PRIORITY_CHOICES: ChoiceEntry[] = [
  { value: '1', label: '1 - Critical' },
  { value: '2', label: '2 - High' },
  { value: '3', label: '3 - Moderate' },
  { value: '4', label: '4 - Low' },
  { value: '5', label: '5 - Planning' },
];

const CATEGORY_CHOICES: ChoiceEntry[] = [
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'network', label: 'Network' },
];

const SUBCATEGORY_CHOICES: ChoiceEntry[] = [
  { value: 'monitor', label: 'Monitor', dependentValue: 'hardware' },
  { value: 'keyboard', label: 'Keyboard', dependentValue: 'hardware' },
  { value: 'os', label: 'Operating system', dependentValue: 'software' },
  { value: 'browser', label: 'Browser', dependentValue: 'software' },
  { value: 'vpn', label: 'VPN', dependentValue: 'network' },
  { value: 'wifi', label: 'Wi-Fi', dependentValue: 'network' },
];

export function ChoiceFieldPage(): React.ReactElement {
  const theme = useTheme();
  const [livePriority, setLivePriority] = useState('');
  const [liveCategory, setLiveCategory] = useState('');
  const [liveSubcategory, setLiveSubcategory] = useState('');

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingMd,
    maxWidth: '400px',
  };

  function handleCategoryChange(_field: string, v: string) {
    setLiveCategory(v);
    const valid = SUBCATEGORY_CHOICES.filter(
      (c) => !c.dependentValue || c.dependentValue === v
    );
    if (!valid.find((c) => c.value === liveSubcategory)) {
      setLiveSubcategory('');
    }
  }

  return (
    <PageLayout
      title="Field — choice (isChoiceField)"
      description="Field molecule for choice (select) fields. Pass isChoiceField={true} — this flag takes priority over type in the resolution logic, regardless of the underlying type. Supports dependent choices via dependentValue."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">States</Text>
              <Field
                type="string"
                isChoiceField={true}
                name="pri-normal"
                label="Priority"
                value="3"
                displayValue="3 - Moderate"
                mandatory={false}
                readOnly={false}
                hasError={false}
                choices={PRIORITY_CHOICES}
                onChange={() => undefined}
              />
              <Field
                type="string"
                isChoiceField={true}
                name="pri-mandatory"
                label="Priority"
                value=""
                mandatory={true}
                readOnly={false}
                hasError={false}
                choices={PRIORITY_CHOICES}
                onChange={() => undefined}
              />
              <Field
                type="string"
                isChoiceField={true}
                name="pri-error"
                label="Priority"
                value=""
                mandatory={true}
                readOnly={false}
                hasError={true}
                choices={PRIORITY_CHOICES}
                onChange={() => undefined}
              />
              <Field
                type="string"
                isChoiceField={true}
                name="pri-readonly"
                label="Priority (read-only)"
                value="1"
                displayValue="1 - Critical"
                mandatory={false}
                readOnly={true}
                hasError={false}
                choices={PRIORITY_CHOICES}
                onChange={() => undefined}
              />
              <Field
                type="string"
                isChoiceField={true}
                name="pri-readonly-empty"
                label="Priority (read-only, empty)"
                value=""
                mandatory={false}
                readOnly={true}
                hasError={false}
                choices={PRIORITY_CHOICES}
                onChange={() => undefined}
              />

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive — simple</Text>
              <Field
                type="string"
                isChoiceField={true}
                name="pri-live"
                label="Priority"
                value={livePriority}
                displayValue={PRIORITY_CHOICES.find((c) => c.value === livePriority)?.label ?? ''}
                mandatory={false}
                readOnly={false}
                hasError={false}
                choices={PRIORITY_CHOICES}
                onChange={(_field, v) => setLivePriority(v)}
              />
              <Text variant="caption">Value: "{livePriority}"</Text>

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive — dependent choices</Text>
              <Text variant="caption" style={{ color: theme.colorTextMuted }}>
                Subcategory choices filter to match the selected category's stored value.
              </Text>
              <Field
                type="string"
                isChoiceField={true}
                name="cat-live"
                label="Category"
                value={liveCategory}
                displayValue={CATEGORY_CHOICES.find((c) => c.value === liveCategory)?.label ?? ''}
                mandatory={false}
                readOnly={false}
                hasError={false}
                choices={CATEGORY_CHOICES}
                onChange={handleCategoryChange}
              />
              <Field
                type="string"
                isChoiceField={true}
                name="subcat-live"
                label="Subcategory"
                value={liveSubcategory}
                displayValue={SUBCATEGORY_CHOICES.find((c) => c.value === liveSubcategory)?.label ?? ''}
                mandatory={false}
                readOnly={false}
                hasError={false}
                choices={SUBCATEGORY_CHOICES}
                dependentOnField="category"
                dependentValue={liveCategory}
                onChange={(_field, v) => setLiveSubcategory(v)}
              />
              <Text variant="caption">
                Category: "{liveCategory}" | Subcategory: "{liveSubcategory}"
              </Text>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'isChoiceField', type: 'boolean', required: true, description: "Set to true to render a SelectInput regardless of type. This flag takes priority over type in the resolution logic." },
                { name: 'type', type: 'string', required: true, description: 'The underlying ServiceNow field type. Pass the real type from metadata — isChoiceField overrides the rendering decision.' },
                { name: 'name', type: 'string', required: true, description: 'Field name — used as the select id and passed to onChange.' },
                { name: 'label', type: 'string', required: true, description: 'Label text rendered above the select.' },
                { name: 'value', type: 'string', required: true, description: 'Currently selected stored value.' },
                { name: 'mandatory', type: 'boolean', required: true, description: 'When true, renders a red asterisk and suppresses the blank option when a value is already selected.' },
                { name: 'readOnly', type: 'boolean', required: true, description: 'When true, renders the selected option label as plain text.' },
                { name: 'hasError', type: 'boolean', required: true, description: 'When true, applies a red error outline.' },
                { name: 'choices', type: 'ChoiceEntry[]', required: true, description: 'All available choices for this field, including those for all dependent values. Filtering is done internally.' },
                { name: 'onChange', type: '(field: string, value: string, displayValue: string) => void', required: true, description: 'Called with the stored value and display label of the selected option.' },
                { name: 'dependentOnField', type: 'string', description: 'Name of the field this choice depends on. Informational only — filtering uses dependentValue.' },
                { name: 'dependentValue', type: 'string', description: 'Current stored value of the parent field. Choices whose dependentValue does not match are hidden.' },
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
import type { ChoiceEntry } from 'servicenow-sdk-react-component-pack';

// choices come from FieldData.choices returned by RhinoService
const priorityChoices: ChoiceEntry[] = [
  { value: '1', label: '1 - Critical' },
  { value: '2', label: '2 - High' },
  { value: '3', label: '3 - Moderate' },
];

const [priority, setPriority] = useState('');

<Field
  type="string"
  isChoiceField={true}
  name="priority"
  label="Priority"
  value={priority}
  displayValue={priorityChoices.find((c) => c.value === priority)?.label ?? ''}
  mandatory={true}
  readOnly={false}
  hasError={priority === ''}
  choices={priorityChoices}
  onChange={(_field, v) => setPriority(v)}
/>

// Dependent choices — subcategory filtered by category
<Field
  type="string"
  isChoiceField={true}
  name="subcategory"
  label="Subcategory"
  value={subcategory}
  displayValue={subcategoryLabel}
  mandatory={false}
  readOnly={false}
  hasError={false}
  choices={subcategoryChoices}
  dependentOnField="category"
  dependentValue={category}
  onChange={(_field, v) => setSubcategory(v)}
/>`}
            />
          ),
        },
      ]}
    />
  );
}
