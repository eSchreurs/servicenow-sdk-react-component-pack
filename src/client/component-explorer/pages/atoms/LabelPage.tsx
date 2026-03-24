import React from 'react';
import { Label } from '../../../npm-package/components/atoms/Label';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

export function LabelPage(): React.ReactElement {
  const theme = useTheme();

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingMd,
  };

  const exampleRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacingMd,
  };

  const stateTagStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: theme.fontSizeSmall,
    color: theme.colorTextMuted,
    width: '120px',
    flexShrink: 0,
  };

  return (
    <PageLayout
      title="Label"
      description="Form field label with optional mandatory indicator. Thin wrapper around Text with label-specific styling and htmlFor association."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={rowStyle}>
              <div style={exampleRowStyle}>
                <span style={stateTagStyle}>default</span>
                <Label htmlFor="example-default">Short description</Label>
              </div>
              <div style={exampleRowStyle}>
                <span style={stateTagStyle}>mandatory</span>
                <Label htmlFor="example-mandatory" mandatory>Required field</Label>
              </div>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'htmlFor', type: 'string', required: true, description: 'ID of the associated form input element.' },
                { name: 'children', type: 'React.ReactNode', required: true, description: 'Label text content.' },
                { name: 'mandatory', type: 'boolean', defaultValue: 'false', description: 'When true, renders a red asterisk after the label text.' },
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
              code={`import { Label } from 'servicenow-sdk-react-component-pack';

// Standard label
<Label htmlFor="first-name">First Name</Label>

// Mandatory field label
<Label htmlFor="email" mandatory>Email Address</Label>`}
            />
          ),
        },
      ]}
    />
  );
}
