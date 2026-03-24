import React, { useState, useCallback } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { ReferenceField } from '../../../npm-package/components/molecules/ReferenceField';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

// ---------------------------------------------------------------------------
// Mock ReferenceField that intercepts service calls in the explorer environment.
// Since ReferenceField calls SearchService/RecordService internally,
// the interactive demo below uses a local wrapper that simulates search
// by overriding nothing — the real component is shown but search returns
// empty results (as if no ServiceNow instance is connected).
// Static states are shown with pre-set values.
// ---------------------------------------------------------------------------

function InteractiveNote(): React.ReactElement {
  const theme = useTheme();
  return (
    <div style={{
      padding: theme.spacingMd,
      backgroundColor: theme.colorBackgroundMuted,
      border: `${theme.borderWidth} solid ${theme.colorBorder}`,
      borderRadius: theme.borderRadius,
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSizeSmall,
      color: theme.colorTextMuted,
    }}>
      <strong style={{ color: theme.colorText }}>Note:</strong> The interactive demo connects to the live ServiceNow instance.
      Typeahead search requires a valid session on the instance. The component is shown with correct
      props — search, selection, and the info popover all function normally when running inside ServiceNow.
    </div>
  );
}

export function ReferenceFieldPage(): React.ReactElement {
  const theme = useTheme();
  const [liveValue, setLiveValue] = useState('');
  const [liveDisplayValue, setLiveDisplayValue] = useState('');

  const handleChange = useCallback((_field: string, v: string, dv: string) => {
    setLiveValue(v);
    setLiveDisplayValue(dv);
  }, []);

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingMd,
    maxWidth: '420px',
  };

  return (
    <PageLayout
      title="ReferenceField"
      description="Field molecule for reference-type fields. Orchestrates typeahead search via SearchService (debounced 300ms, stale-result protected), an info popover fetched from RecordService, and dependent filter support. Passes referenceQual as-is to SearchService for all qualifier types."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">Static states</Text>
              <ReferenceField
                name="rf-empty"
                label="Assigned to"
                value=""
                displayValue=""
                mandatory={false}
                readOnly={false}
                hasError={false}
                reference="sys_user"
                table="incident"
                sysId="demo"
                onChange={() => undefined}
              />
              <ReferenceField
                name="rf-selected"
                label="Assigned to"
                value="abc001"
                displayValue="Abel Tuter"
                mandatory={false}
                readOnly={false}
                hasError={false}
                reference="sys_user"
                table="incident"
                sysId="demo"
                onChange={() => undefined}
              />
              <ReferenceField
                name="rf-mandatory"
                label="Assigned to"
                value=""
                displayValue=""
                mandatory={true}
                readOnly={false}
                hasError={false}
                reference="sys_user"
                table="incident"
                sysId="demo"
                onChange={() => undefined}
              />
              <ReferenceField
                name="rf-error"
                label="Assigned to"
                value=""
                displayValue=""
                mandatory={true}
                readOnly={false}
                hasError={true}
                reference="sys_user"
                table="incident"
                sysId="demo"
                onChange={() => undefined}
              />
              <ReferenceField
                name="rf-readonly"
                label="Assigned to (read-only)"
                value="abc001"
                displayValue="Abel Tuter"
                mandatory={false}
                readOnly={true}
                hasError={false}
                reference="sys_user"
                table="incident"
                sysId="demo"
                onChange={() => undefined}
              />
              <ReferenceField
                name="rf-readonly-empty"
                label="Assigned to (read-only, empty)"
                value=""
                displayValue=""
                mandatory={false}
                readOnly={true}
                hasError={false}
                reference="sys_user"
                table="incident"
                sysId="demo"
                onChange={() => undefined}
              />

              <Text variant="label" style={{ marginTop: theme.spacingMd }}>Interactive (live instance)</Text>
              <InteractiveNote />
              <ReferenceField
                name="rf-live"
                label="Assigned to"
                value={liveValue}
                displayValue={liveDisplayValue}
                mandatory={false}
                readOnly={false}
                hasError={false}
                reference="sys_user"
                table="incident"
                sysId=""
                onChange={handleChange}
              />
              <Text variant="caption">
                {liveValue ? `Selected: "${liveDisplayValue}" (sys_id: ${liveValue})` : 'No selection'}
              </Text>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'name', type: 'string', required: true, description: 'Field name — passed to onChange as the first argument.' },
                { name: 'label', type: 'string', required: true, description: 'Label text rendered above the input.' },
                { name: 'value', type: 'string', required: true, description: 'Currently selected sys_id. Empty string means no selection.' },
                { name: 'displayValue', type: 'string', required: true, description: 'Display name of the selected record. Shown in the input when a value is present.' },
                { name: 'mandatory', type: 'boolean', required: true, description: 'When true, renders a red asterisk next to the label.' },
                { name: 'readOnly', type: 'boolean', required: true, description: 'When true, renders the display value as plain text with an info icon (when value is present).' },
                { name: 'hasError', type: 'boolean', required: true, description: 'When true, applies a red error outline.' },
                { name: 'reference', type: 'string', required: true, description: 'The table to search (e.g. "sys_user"). Comes from FieldData.reference.' },
                { name: 'table', type: 'string', required: true, description: 'The parent form record table. Used by the info popover to fetch labels via RhinoService.' },
                { name: 'sysId', type: 'string', required: true, description: 'The parent form record sys_id. Used by the info popover.' },
                { name: 'onChange', type: '(field: string, value: string, displayValue: string) => void', required: true, description: 'Called with sys_id as value and the display name as displayValue.' },
                { name: 'referenceQual', type: 'string', description: 'Qualifier string from FieldData — passed as-is to SearchService. All qualifier types (simple, dynamic, advanced) are supported.' },
                { name: 'filter', type: 'string', description: "Developer-supplied encoded query ANDed with referenceQual when searching. Reactive — changing this value clears in-flight results." },
                { name: 'searchFields', type: 'string[]', description: 'Additional fields to include in the CONTAINS search query.' },
                { name: 'previewFields', type: 'string[]', description: 'When provided, the info popover shows only these fields with labels fetched from RhinoService.' },
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
              code={`import { ReferenceField } from 'servicenow-sdk-react-component-pack';

const [assignedTo, setAssignedTo] = useState('');
const [assignedToDv, setAssignedToDv] = useState('');

// Basic usage — metadata comes from the Form organism
<ReferenceField
  name="assigned_to"
  label="Assigned to"
  value={assignedTo}
  displayValue={assignedToDv}
  mandatory={false}
  readOnly={false}
  hasError={false}
  reference="sys_user"
  table="incident"
  sysId="abc123"
  onChange={(_field, v, dv) => {
    setAssignedTo(v);
    setAssignedToDv(dv);
  }}
/>

// With developer-supplied filter (e.g. filtered by assignment group)
<ReferenceField
  name="assigned_to"
  label="Assigned to"
  value={assignedTo}
  displayValue={assignedToDv}
  mandatory={false}
  readOnly={false}
  hasError={false}
  reference="sys_user"
  referenceQual="active=true"
  filter={groupFilter}
  previewFields={['name', 'email', 'department']}
  table="incident"
  sysId="abc123"
  onChange={(_field, v, dv) => {
    setAssignedTo(v);
    setAssignedToDv(dv);
  }}
/>`}
            />
          ),
        },
      ]}
    />
  );
}
