import React, { useState } from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';
import { Field } from '../../npm-package/components/forms/fields/Field';
import { Text } from '../../npm-package/components/primitives/Text';
import { PropTable } from '../components/PropTable';
import { CodeSnippet } from '../components/CodeSnippet';
import { PageLayout } from '../components/PageLayout';

const SN_DATETIME = '2025-03-24 14:30:00';
const SN_DATE = '2025-03-24';
const SN_TIME = '14:30:00';

export function DateTimeFieldPage(): React.ReactElement {
  const theme = useTheme();
  const [liveDatetime, setLiveDatetime] = useState('');
  const [liveDate, setLiveDate] = useState('');
  const [liveTime, setLiveTime] = useState('');

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingMd,
    maxWidth: '400px',
  };

  const sectionLabelStyle: React.CSSProperties = {
    marginTop: theme.spacingMd,
  };

  return (
    <PageLayout
      title="Field — date/time types"
      description="Field molecule for date, time, and datetime types. Use type='glide_date_time', 'glide_date', or 'glide_time'. Handles bidirectional format conversion between ServiceNow format and browser input format. Read-only renders a human-readable display."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">type: glide_date_time</Text>
              <Field
                type="glide_date_time"
                name="dt-normal"
                label="Opened at"
                value={SN_DATETIME}
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="glide_date_time"
                name="dt-error"
                label="Opened at"
                value=""
                mandatory={true}
                readOnly={false}
                hasError={true}
                onChange={() => undefined}
              />
              <Field
                type="glide_date_time"
                name="dt-readonly"
                label="Opened at (read-only)"
                value={SN_DATETIME}
                mandatory={false}
                readOnly={true}
                hasError={false}
                onChange={() => undefined}
              />

              <Text variant="label" style={sectionLabelStyle}>type: glide_date</Text>
              <Field
                type="glide_date"
                name="d-normal"
                label="Due date"
                value={SN_DATE}
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="glide_date"
                name="d-readonly"
                label="Due date (read-only)"
                value={SN_DATE}
                mandatory={false}
                readOnly={true}
                hasError={false}
                onChange={() => undefined}
              />

              <Text variant="label" style={sectionLabelStyle}>type: glide_time</Text>
              <Field
                type="glide_time"
                name="t-normal"
                label="Business start time"
                value={SN_TIME}
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={() => undefined}
              />
              <Field
                type="glide_time"
                name="t-readonly"
                label="Business start time (read-only)"
                value={SN_TIME}
                mandatory={false}
                readOnly={true}
                hasError={false}
                onChange={() => undefined}
              />

              <Text variant="label" style={sectionLabelStyle}>Interactive</Text>
              <Field
                type="glide_date_time"
                name="dt-live"
                label="Opened at"
                value={liveDatetime}
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={(_field, v) => setLiveDatetime(v)}
              />
              <Field
                type="glide_date"
                name="d-live"
                label="Due date"
                value={liveDate}
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={(_field, v) => setLiveDate(v)}
              />
              <Field
                type="glide_time"
                name="t-live"
                label="Business start time"
                value={liveTime}
                mandatory={false}
                readOnly={false}
                hasError={false}
                onChange={(_field, v) => setLiveTime(v)}
              />
              <Text variant="caption">
                datetime: "{liveDatetime}" | date: "{liveDate}" | time: "{liveTime}"
              </Text>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'type', type: "string ('glide_date_time' | 'glide_date' | 'glide_time')", required: true, description: "Controls the input type: glide_date_time → datetime-local input, glide_date → date input, glide_time → time input." },
                { name: 'name', type: 'string', required: true, description: 'Field name — used as the input id and passed to onChange.' },
                { name: 'label', type: 'string', required: true, description: 'Label text rendered above the input.' },
                { name: 'value', type: 'string', required: true, description: 'ServiceNow-formatted value: YYYY-MM-DD HH:mm:ss (datetime), YYYY-MM-DD (date), or HH:mm:ss (time).' },
                { name: 'mandatory', type: 'boolean', required: true, description: 'When true, renders a red asterisk next to the label.' },
                { name: 'readOnly', type: 'boolean', required: true, description: 'When true, renders a human-readable formatted date/time string instead of an input.' },
                { name: 'hasError', type: 'boolean', required: true, description: 'When true, applies a red error outline to the field.' },
                { name: 'onChange', type: '(field: string, value: string, displayValue: string) => void', required: true, description: 'Called with the ServiceNow-formatted value when the user changes the input.' },
                { name: 'mode', type: "'datetime' | 'date' | 'time'", description: 'Optional override for the date mode. Normally derived automatically from type.' },
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

// value is always in ServiceNow format
const [openedAt, setOpenedAt] = useState('');

<Field
  type="glide_date_time"
  name="opened_at"
  label="Opened at"
  value={openedAt}
  mandatory={false}
  readOnly={false}
  hasError={false}
  onChange={(_field, v) => setOpenedAt(v)}
/>

// Read-only — displays as "24/03/2025 14:30"
<Field
  type="glide_date_time"
  name="opened_at"
  label="Opened at"
  value="2025-03-24 14:30:00"
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
