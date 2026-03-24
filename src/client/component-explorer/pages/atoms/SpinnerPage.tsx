import React from 'react';
import { Spinner } from '../../../npm-package/components/atoms/Spinner';
import { useTheme } from '../../../npm-package/context/ThemeContext';
import { Text } from '../../../npm-package/components/atoms/Text';
import { PropTable } from '../../components/PropTable';
import { CodeSnippet } from '../../components/CodeSnippet';
import { PageLayout } from '../../components/PageLayout';

export function SpinnerPage(): React.ReactElement {
  const theme = useTheme();

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacingXl,
    flexWrap: 'wrap',
  };

  const exampleStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacingSm,
  };

  return (
    <PageLayout
      title="Spinner"
      description="Animated loading indicator for async operations. Implemented as a CSS keyframe animation with no external dependencies."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacingLg }}>
              <Text variant="label">Sizes</Text>
              <div style={rowStyle}>
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <div key={size} style={exampleStyle}>
                    <Spinner size={size} />
                    <Text variant="caption">{size}</Text>
                  </div>
                ))}
              </div>

              <Text variant="label">In context</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacingSm }}>
                <Spinner size="sm" />
                <Text variant="body">Loading records…</Text>
              </div>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: "Controls the diameter of the spinner. sm=1rem, md=1.5rem, lg=2.5rem." },
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
              code={`import { Spinner } from 'servicenow-sdk-react-component-pack';

// Default (medium)
<Spinner />

// Small, inline with text
<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
  <Spinner size="sm" />
  <span>Loading…</span>
</div>

// Large, centered
<div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
  <Spinner size="lg" />
</div>`}
            />
          ),
        },
      ]}
    />
  );
}
