import React, { useState } from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { DateTimeField } from '../../../npm-package/components/molecules/DateTimeField';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

// ServiceNow-formatted sample values
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
      title="DateTimeField"
      description="Field molecule for date, time, and datetime types. Wraps the native browser date/time input directly. Handles bidirectional format conversion between ServiceNow format (YYYY-MM-DD HH:mm:ss) and browser input format. Read-only renders a human-readable display."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">mode: datetime</Text>
              <DateTimeField
                name="dt-normal"
                label="Opened at"
                value={SN_DATETIME}
                displayValue={SN_DATETIME}
                mandatory={false}
                readOnly={false}
                hasError={false}
                mode="datetime"
                onChange={() => undefined}
              />
              <DateTimeField
                name="dt-error"
                label="Opened at"
                value=""
                displayValue=""
                mandatory={true}
                readOnly={false}
                hasError={true}
                mode="datetime"
                onChange={() => undefined}
              />
              <DateTimeField
                name="dt-readonly"
                label="Opened at (read-only)"
                value={SN_DATETIME}
                displayValue={SN_DATETIME}
                mandatory={false}
                readOnly={true}
                hasError={false}
                mode="datetime"
                onChange={() => undefined}
              />

              <Text variant="label" style={sectionLabelStyle}>mode: date</Text>
              <DateTimeField
                name="d-normal"
                label="Due date"
                value={SN_DATE}
                displayValue={SN_DATE}
                mandatory={false}
                readOnly={false}
                hasError={false}
                mode="date"
                onChange={() => undefined}
              />
              <DateTimeField
                name="d-readonly"
                label="Due date (read-only)"
                value={SN_DATE}
                displayValue={SN_DATE}
                mandatory={false}
                readOnly={true}
                hasError={false}
                mode="date"
                onChange={() => undefined}
              />

              <Text variant="label" style={sectionLabelStyle}>mode: time</Text>
              <DateTimeField
                name="t-normal"
                label="Business start time"
                value={SN_TIME}
                displayValue={SN_TIME}
                mandatory={false}
                readOnly={false}
                hasError={false}
                mode="time"
                onChange={() => undefined}
              />
              <DateTimeField
                name="t-readonly"
                label="Business start time (read-only)"
                value={SN_TIME}
                displayValue={SN_TIME}
                mandatory={false}
                readOnly={true}
                hasError={false}
                mode="time"
                onChange={() => undefined}
              />

              <Text variant="label" style={sectionLabelStyle}>Interactive</Text>
              <DateTimeField
                name="dt-live"
                label="Opened at"
                value={liveDatetime}
                displayValue={liveDatetime}
                mandatory={false}
                readOnly={false}
                hasError={false}
                mode="datetime"
                onChange={(_field, v) => setLiveDatetime(v)}
              />
              <DateTimeField
                name="d-live"
                label="Due date"
                value={liveDate}
                displayValue={liveDate}
                mandatory={false}
                readOnly={false}
                hasError={false}
                mode="date"
                onChange={(_field, v) => setLiveDate(v)}
              />
              <DateTimeField
                name="t-live"
                label="Business start time"
                value={liveTime}
                displayValue={liveTime}
                mandatory={false}
                readOnly={false}
                hasError={false}
                mode="time"
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
                { name: 'name', type: 'string', required: true, description: 'Field name — used as the input id and passed to onChange.' },
                { name: 'label', type: 'string', required: true, description: 'Label text rendered above the input.' },
                { name: 'value', type: 'string', required: true, description: 'ServiceNow-formatted value: YYYY-MM-DD HH:mm:ss (datetime), YYYY-MM-DD (date), or HH:mm:ss (time).' },
                { name: 'displayValue', type: 'string', required: true, description: 'Same as value for date/time fields. The component converts to a human-readable format for read-only display.' },
                { name: 'mandatory', type: 'boolean', required: true, description: 'When true, renders a red asterisk next to the label.' },
                { name: 'readOnly', type: 'boolean', required: true, description: 'When true, renders a human-readable formatted date/time string instead of an input.' },
                { name: 'hasError', type: 'boolean', required: true, description: 'When true, applies a red error outline to the field.' },
                { name: 'mode', type: "'datetime' | 'date' | 'time'", required: true, description: "Controls input type: datetime → datetime-local input, date → date input, time → time input." },
                { name: 'onChange', type: '(field: string, value: string, displayValue: string) => void', required: true, description: 'Called with the ServiceNow-formatted value when the user changes the input.' },
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
              code={`import { DateTimeField } from 'servicenow-sdk-react-component-pack';

// value is always in ServiceNow format
const [openedAt, setOpenedAt] = useState('');

<DateTimeField
  name="opened_at"
  label="Opened at"
  value={openedAt}
  displayValue={openedAt}
  mandatory={false}
  readOnly={false}
  hasError={false}
  mode="datetime"
  onChange={(_field, v) => setOpenedAt(v)}
/>

// Read-only — displays as "24/03/2025 14:30"
<DateTimeField
  name="opened_at"
  label="Opened at"
  value="2025-03-24 14:30:00"
  displayValue="2025-03-24 14:30:00"
  mandatory={false}
  readOnly={true}
  hasError={false}
  mode="datetime"
  onChange={() => undefined}
/>`}
            />
          ),
        },
      ]}
    />
  );
}
