import React from 'react';
import { Text } from '../../../npm-package/components/atoms/Text';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

export function TextPage(): React.ReactElement {
  const theme = useTheme();

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingMd,
  };

  const variantRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacingMd,
  };

  const variantLabelStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: theme.fontSizeSmall,
    color: theme.colorTextMuted,
    width: '80px',
    flexShrink: 0,
  };

  return (
    <PageLayout
      title="Text"
      description="Generic typography component. Use the variant prop to select the appropriate typographic style."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={rowStyle}>
              {(['heading', 'body', 'caption', 'label'] as const).map((variant) => (
                <div key={variant} style={variantRowStyle}>
                  <span style={variantLabelStyle}>{variant}</span>
                  <Text variant={variant}>The quick brown fox jumps over the lazy dog</Text>
                </div>
              ))}
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'children', type: 'React.ReactNode', required: true, description: 'Content to render.' },
                { name: 'variant', type: "'heading' | 'body' | 'caption' | 'label'", defaultValue: "'body'", description: 'Typographic style variant.' },
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
              code={`import { Text } from 'servicenow-sdk-react-component-pack';

<Text variant="heading">Page Title</Text>
<Text variant="body">Regular paragraph text.</Text>
<Text variant="caption">Helper text or secondary info.</Text>
<Text variant="label">Form field label text.</Text>`}
            />
          ),
        },
      ]}
    />
  );
}
