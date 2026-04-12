import React, { useState } from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';
import { Button } from '../../npm-package/components/actions/Button';
import { Text } from '../../npm-package/components/primitives/Text';
import { PropTable } from '../components/PropTable';
import { CodeSnippet } from '../components/CodeSnippet';
import { PageLayout } from '../components/PageLayout';

export function ButtonPage(): React.ReactElement {
  const theme = useTheme();
  const [clickCount, setClickCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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

  function handleSimulateLoad(): void {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  }

  return (
    <PageLayout
      title="Button"
      description="Action trigger with four variants and three sizes. Supports a loading state that shows a Spinner and disables interaction."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">Variants</Text>
              <div style={rowStyle}>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>

              <Text variant="label">Sizes</Text>
              <div style={{ ...rowStyle, alignItems: 'flex-end' }}>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>

              <Text variant="label">States</Text>
              <div style={rowStyle}>
                <Button disabled>Disabled</Button>
                <Button variant="secondary" disabled>Disabled secondary</Button>
                <Button loading>Loading</Button>
                <Button variant="secondary" loading>Loading secondary</Button>
              </div>

              <Text variant="label">Interactive</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacingMd }}>
                <Button onClick={() => setClickCount((n) => n + 1)}>
                  Clicked {clickCount} {clickCount === 1 ? 'time' : 'times'}
                </Button>
                <Button variant="secondary" onClick={() => setClickCount(0)}>
                  Reset
                </Button>
              </div>

              <Text variant="label">Simulated async loading</Text>
              <div style={rowStyle}>
                <Button loading={isLoading} onClick={handleSimulateLoad}>
                  {isLoading ? 'Saving…' : 'Save record'}
                </Button>
                <Text variant="caption">Click to simulate a 2-second async operation.</Text>
              </div>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'children', type: 'React.ReactNode', required: true, description: 'Button label or content.' },
                { name: 'onClick', type: '() => void', description: 'Click handler. Not called when disabled or loading.' },
                { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", defaultValue: "'primary'", description: 'Visual style of the button.' },
                { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'Controls padding and font size.' },
                { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disables the button and applies reduced opacity.' },
                { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'Shows a Spinner inside the button and disables interaction.' },
                { name: 'type', type: "'button' | 'submit'", defaultValue: "'button'", description: 'Native button type attribute.' },
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
              code={`import { Button } from 'servicenow-sdk-react-component-pack';

// Primary action
<Button variant="primary" onClick={handleSave}>
  Save
</Button>

// Async operation with loading state
const [saving, setSaving] = useState(false);

<Button
  loading={saving}
  onClick={async () => {
    setSaving(true);
    await save();
    setSaving(false);
  }}
>
  {saving ? 'Saving…' : 'Save record'}
</Button>

// Danger — destructive action
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

// Ghost — low-emphasis secondary action
<Button variant="ghost" onClick={onCancel}>
  Cancel
</Button>`}
            />
          ),
        },
      ]}
    />
  );
}
