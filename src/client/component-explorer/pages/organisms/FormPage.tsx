import React from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { Form } from '../../../npm-package/components/organisms/Form';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

export function FormPage(): React.ReactElement {
  const theme = useTheme();

  return (
    <PageLayout
      title="Form"
      description="The primary organism in this library. Renders a fully data-driven, configurable form that reads from and writes to ServiceNow records. Driven entirely by props — the developer declares sections of columns with fields, and the Form handles metadata loading, type resolution, validation, and saving."
      sections={[
        {
          title: 'Live Demo',
          children: (
            <div>
              <Text variant="caption" style={{ color: theme.colorTextMuted, marginBottom: theme.spacingMd, display: 'block' }}>
                Requires a live ServiceNow instance with the companion app installed.
                The form below targets the <strong>incident</strong> table with a sample record.
                Replace <code>sysId</code> with a real incident sys_id on your instance.
              </Text>
              <div
                style={{
                  padding: theme.spacingLg,
                  border: `${theme.borderWidth} solid ${theme.colorBorder}`,
                  borderRadius: theme.borderRadius,
                  backgroundColor: theme.colorBackground,
                  maxWidth: '900px',
                }}
              >
                <Form
                  title="New Incident"
                  sections={[
                    {
                      title: 'Details',
                      columns: [
                        [
                          { table: 'incident', sysId: '', field: 'short_description', defaultValue: 'Demo incident' },
                          { table: 'incident', sysId: '', field: 'description' },
                          { table: 'incident', sysId: '', field: 'category' },
                        ],
                        [
                          { table: 'incident', sysId: '', field: 'priority' },
                          { table: 'incident', sysId: '', field: 'assignment_group' },
                          { table: 'incident', sysId: '', field: 'assigned_to' },
                        ],
                      ],
                    },
                  ]}
                  onSave={(results) => {
                    window.console.log('Form saved:', results);
                  }}
                  onError={(err) => {
                    window.console.error('Form error:', err);
                  }}
                />
              </div>
            </div>
          ),
        },
        {
          title: 'Props — Form',
          children: (
            <PropTable
              props={[
                {
                  name: 'sections',
                  type: 'FormSection[]',
                  required: true,
                  description: 'One or more sections. Each section has an optional title and its own column layout. Column count per section determines the CSS grid column count for that section.',
                },
                {
                  name: 'title',
                  type: 'string',
                  description: 'Optional form-level heading rendered above all sections with a bottom border.',
                },
                {
                  name: 'readOnly',
                  type: 'boolean',
                  defaultValue: 'false',
                  description: 'Forces all fields into read-only mode and hides the Save button, regardless of field-level settings.',
                },
                {
                  name: 'showSaveButton',
                  type: 'boolean',
                  defaultValue: 'true',
                  description: 'Whether to render the Save button. Always hidden when readOnly is true.',
                },
                {
                  name: 'showCancelButton',
                  type: 'boolean',
                  defaultValue: 'false',
                  description: 'Whether to render the Cancel button.',
                },
                {
                  name: 'extraButtons',
                  type: 'FormButton[]',
                  description: 'Additional buttons rendered alongside Save and Cancel in the action bar.',
                },
                {
                  name: 'onSave',
                  type: '(results: SaveResult[]) => void',
                  description: 'Called after all records are saved successfully. Each SaveResult contains table, sysId (newly created for new records), and isNew.',
                },
                {
                  name: 'onCancel',
                  type: '() => void',
                  description: 'Called when the user clicks the Cancel button.',
                },
                {
                  name: 'onError',
                  type: '(error: Error) => void',
                  description: 'Called on load failure or save failure.',
                },
                {
                  name: 'onFieldChange',
                  type: '(field: FieldDefinition, value: string, displayValue: string) => void',
                  description: 'Called after every field change, after internal state has been updated. Use this to react to field changes — for example, to update a reference field filter based on another field\'s value.',
                },
                {
                  name: 'style',
                  type: 'React.CSSProperties',
                  description: 'Inline style overrides applied to the root container.',
                },
                {
                  name: 'className',
                  type: 'string',
                  description: 'CSS class name override applied to the root container.',
                },
              ]}
            />
          ),
        },
        {
          title: 'Props — FormSection',
          children: (
            <PropTable
              props={[
                {
                  name: 'columns',
                  type: 'FieldDefinition[][]',
                  required: true,
                  description: 'Each inner array is a column. Fields render top-to-bottom within each column, left-to-right across columns. Column count determines the CSS grid column count for this section.',
                },
                {
                  name: 'title',
                  type: 'string',
                  description: 'Optional section heading rendered above this section\'s column grid with a bottom border.',
                },
              ]}
            />
          ),
        },
        {
          title: 'Props — FormButton',
          children: (
            <PropTable
              props={[
                { name: 'label', type: 'string', required: true, description: 'Button text.' },
                { name: 'onClick', type: '() => void', required: true, description: 'Click handler.' },
                { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", defaultValue: "'secondary'", description: 'Visual style of the button.' },
                { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disables the button.' },
                { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'Shows a spinner and disables the button.' },
              ]}
            />
          ),
        },
        {
          title: 'Props — FieldDefinition',
          children: (
            <PropTable
              props={[
                { name: 'table', type: 'string', required: true, description: 'ServiceNow table name (e.g. "incident").' },
                { name: 'sysId', type: 'string', required: true, description: 'Record sys_id. Pass an empty string "" for new records.' },
                { name: 'field', type: 'string', required: true, description: 'Field name (e.g. "short_description").' },
                { name: 'label', type: 'string', description: 'Label override. Falls back to metadata label, then the raw field name.' },
                { name: 'mandatory', type: 'boolean', description: 'Developer-level mandatory override. Can only add restrictions — cannot override a database-level mandatory=true to false.' },
                { name: 'readOnly', type: 'boolean', description: 'Developer-level readOnly override. Same restriction rule applies.' },
                { name: 'visible', type: 'boolean', defaultValue: 'true', description: 'When false, field is not rendered and excluded from validation and the save payload, but still tracked in state.' },
                { name: 'defaultValue', type: 'string', description: 'Pre-populates the field value for new records (sysId = "") only. Ignored if a value is already loaded.' },
                { name: 'reference.searchFields', type: 'string[]', description: 'Reference field: columns to search across. Defaults to name.' },
                { name: 'reference.previewFields', type: 'string[]', description: 'Reference field: fields shown in the info popover. If omitted, all non-sys_ fields are shown.' },
                { name: 'reference.filter', type: 'string', description: 'Reference field: encoded query ANDed with the field\'s referenceQual from metadata. Reactive — always uses the latest value when searching.' },
              ]}
            />
          ),
        },
        {
          title: 'Basic Usage',
          children: (
            <CodeSnippet
              code={`import { Form } from 'servicenow-sdk-react-component-pack';

<Form
  sections={[
    {
      columns: [
        [
          { table: 'incident', sysId: 'abc123', field: 'short_description' },
          { table: 'incident', sysId: 'abc123', field: 'description' },
        ],
        [
          { table: 'incident', sysId: 'abc123', field: 'priority' },
          { table: 'incident', sysId: 'abc123', field: 'assigned_to' },
        ],
      ],
    },
  ]}
  onSave={(results) => console.log('Saved:', results)}
/>`}
            />
          ),
        },
        {
          title: 'With Title and Sections',
          children: (
            <CodeSnippet
              code={`<Form
  title="Incident Report"
  sections={[
    {
      title: 'Overview',
      columns: [
        [
          { table: 'incident', sysId: 'abc123', field: 'short_description' },
          { table: 'incident', sysId: 'abc123', field: 'description' },
        ],
        [
          { table: 'incident', sysId: 'abc123', field: 'category' },
          { table: 'incident', sysId: 'abc123', field: 'priority' },
        ],
      ],
    },
    {
      title: 'Assignment',
      columns: [
        [
          { table: 'incident', sysId: 'abc123', field: 'assignment_group' },
          { table: 'incident', sysId: 'abc123', field: 'assigned_to' },
        ],
        [
          { table: 'incident', sysId: 'abc123', field: 'state' },
        ],
      ],
    },
  ]}
  onSave={(results) => console.log('Saved:', results)}
/>`}
            />
          ),
        },
        {
          title: 'New Record',
          children: (
            <CodeSnippet
              code={`// Pass sysId="" for new records. Use defaultValue to pre-populate fields.
<Form
  title="New Incident"
  sections={[
    {
      columns: [
        [
          {
            table: 'incident',
            sysId: '',
            field: 'short_description',
            defaultValue: 'New incident',
          },
          { table: 'incident', sysId: '', field: 'description' },
          { table: 'incident', sysId: '', field: 'category' },
        ],
        [
          { table: 'incident', sysId: '', field: 'priority', defaultValue: '2' },
          { table: 'incident', sysId: '', field: 'assignment_group' },
        ],
      ],
    },
  ]}
  onSave={(results) => {
    const newSysId = results[0].sysId;
    console.log('Created incident:', newSysId);
  }}
/>`}
            />
          ),
        },
        {
          title: 'Extra Buttons',
          children: (
            <CodeSnippet
              code={`<Form
  sections={[
    {
      columns: [
        [{ table: 'incident', sysId: 'abc123', field: 'short_description' }],
      ],
    },
  ]}
  showCancelButton
  extraButtons={[
    {
      label: 'Save & Close',
      variant: 'primary',
      onClick: () => handleSaveAndClose(),
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: () => handleDelete(),
    },
  ]}
  onSave={(results) => console.log('Saved:', results)}
  onCancel={() => router.back()}
/>`}
            />
          ),
        },
        {
          title: 'Reference Field Dependency (assignment_group → assigned_to)',
          children: (
            <CodeSnippet
              code={`import { useState } from 'react';
import { Form, FieldDefinition } from 'servicenow-sdk-react-component-pack';

function IncidentForm() {
  const [assignedToFilter, setAssignedToFilter] = useState('');

  const handleFieldChange = (field: FieldDefinition, value: string) => {
    if (field.field === 'assignment_group') {
      setAssignedToFilter(
        value ? \`group_members.user.sys_id=\${value}\` : ''
      );
    }
  };

  return (
    <Form
      sections={[
        {
          columns: [
            [
              { table: 'incident', sysId: 'abc123', field: 'assignment_group' },
              {
                table: 'incident',
                sysId: 'abc123',
                field: 'assigned_to',
                reference: { filter: assignedToFilter },
              },
            ],
          ],
        },
      ]}
      onFieldChange={handleFieldChange}
      onSave={(results) => console.log(results)}
    />
  );
}`}
            />
          ),
        },
        {
          title: 'Multi-Table Form',
          children: (
            <CodeSnippet
              code={`// Fields can come from any number of tables and records.
// The Form batches API calls — one metadata call per unique table,
// one record fetch per unique table+sysId combination.
<Form
  sections={[
    {
      title: 'Incident',
      columns: [
        [
          { table: 'incident', sysId: 'abc123', field: 'short_description' },
          { table: 'incident', sysId: 'abc123', field: 'category' },
        ],
      ],
    },
    {
      title: 'Caller',
      columns: [
        [
          { table: 'sys_user', sysId: 'usr456', field: 'first_name' },
          { table: 'sys_user', sysId: 'usr456', field: 'last_name' },
        ],
        [
          { table: 'sys_user', sysId: 'usr456', field: 'email', readOnly: true },
        ],
      ],
    },
  ]}
  onSave={(results) => console.log('Saved records:', results)}
/>`}
            />
          ),
        },
      ]}
    />
  );
}
