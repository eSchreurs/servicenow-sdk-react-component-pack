import React from 'react';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { EmptyState } from '../../../npm-package/components/atoms/EmptyState';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

export function EmptyStatePage(): React.ReactElement {
  const theme = useTheme();

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacingLg,
    alignItems: 'flex-start',
  };

  const boxStyle: React.CSSProperties = {
    flex: '1 1 260px',
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
    borderRadius: theme.borderRadius,
    backgroundColor: theme.colorBackground,
    overflow: 'hidden',
  };

  return (
    <PageLayout
      title="EmptyState"
      description="General-purpose zero-results indicator. Centred icon above a short message. Used directly by List when rows is empty, and available to any other organism (Form, Calendar, Workboard widgets) that needs a no-data state."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={rowStyle}>
              <div style={boxStyle}>
                <EmptyState message="No records found." />
              </div>
              <div style={boxStyle}>
                <EmptyState message="No incidents match your filter." />
              </div>
              <div style={boxStyle}>
                <EmptyState message="Nothing assigned to you." />
              </div>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'message', type: 'string', required: true, description: 'Message shown below the icon. Keep it short and contextual.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides applied to the container.' },
                { name: 'className', type: 'string', description: 'CSS class name override applied to the container.' },
              ]}
            />
          ),
        },
        {
          title: 'Usage',
          children: (
            <CodeSnippet
              code={`import { EmptyState } from 'servicenow-sdk-react-component-pack';

// In a List — List renders this automatically when rows is empty
// (via the emptyMessage prop). Direct use is for custom layouts.

function MyWidget() {
  const [items, setItems] = useState([]);

  if (items.length === 0) {
    return <EmptyState message="No items to display." />;
  }

  return <div>{/* render items */}</div>;
}`}
            />
          ),
        },
      ]}
    />
  );
}
