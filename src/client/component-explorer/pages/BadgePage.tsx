import React from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';
import { Badge } from '../../npm-package/components/actions/Badge';
import { Text } from '../../npm-package/components/primitives/Text';
import { PropTable } from '../components/PropTable';
import { CodeSnippet } from '../components/CodeSnippet';
import { PageLayout } from '../components/PageLayout';

export function BadgePage(): React.ReactElement {
  const theme = useTheme();

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacingMd,
  };

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingMd,
  };

  return (
    <PageLayout
      title="Badge"
      description="Small pill-shaped indicator for statuses, categories, or counts. Five semantic variants with theme-consistent colors."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">Variants</Text>
              <div style={rowStyle}>
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
              </div>

              <Text variant="label">In context</Text>
              <div style={rowStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacingSm }}>
                  <Text variant="body">Priority:</Text>
                  <Badge variant="danger">1 - Critical</Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacingSm }}>
                  <Text variant="body">State:</Text>
                  <Badge variant="success">Resolved</Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacingSm }}>
                  <Text variant="body">State:</Text>
                  <Badge variant="warning">In Progress</Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacingSm }}>
                  <Text variant="body">State:</Text>
                  <Badge variant="default">New</Badge>
                </div>
              </div>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'children', type: 'React.ReactNode', required: true, description: 'Badge label content.' },
                { name: 'variant', type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", defaultValue: "'default'", description: 'Controls the color scheme of the badge.' },
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
              code={`import { Badge } from 'servicenow-sdk-react-component-pack';

// Status indicator
<Badge variant="success">Resolved</Badge>

// Priority label
<Badge variant="danger">1 - Critical</Badge>

// Neutral category tag
<Badge variant="default">Hardware</Badge>

// Alongside text content
<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
  <span>State:</span>
  <Badge variant="warning">In Progress</Badge>
</div>`}
            />
          ),
        },
      ]}
    />
  );
}
