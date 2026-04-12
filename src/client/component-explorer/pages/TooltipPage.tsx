import React from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';
import { Tooltip } from '../../npm-package/components/actions/Tooltip';
import { Button } from '../../npm-package/components/actions/Button';
import { Icon } from '../../npm-package/components/primitives/Icon';
import { Text } from '../../npm-package/components/primitives/Text';
import { PropTable } from '../components/PropTable';
import { CodeSnippet } from '../components/CodeSnippet';
import { PageLayout } from '../components/PageLayout';

export function TooltipPage(): React.ReactElement {
  const theme = useTheme();

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacingXl,
  };

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingLg,
  };

  return (
    <PageLayout
      title="Tooltip"
      description="Hover-triggered informational label. Implemented with CSS transitions — no third-party library. Supports four placement positions with an arrow indicator."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">Positions — hover each button</Text>
              <div style={{ ...rowStyle, paddingTop: theme.spacingLg, paddingBottom: theme.spacingLg }}>
                <Tooltip content="Tooltip on top" position="top">
                  <Button variant="secondary">Top</Button>
                </Tooltip>
                <Tooltip content="Tooltip on bottom" position="bottom">
                  <Button variant="secondary">Bottom</Button>
                </Tooltip>
                <Tooltip content="Tooltip on left" position="left">
                  <Button variant="secondary">Left</Button>
                </Tooltip>
                <Tooltip content="Tooltip on right" position="right">
                  <Button variant="secondary">Right</Button>
                </Tooltip>
              </div>

              <Text variant="label">On an icon</Text>
              <div style={rowStyle}>
                <Tooltip content="More information" position="right">
                  <Icon name="info" size={18} color={theme.colorPrimary} />
                </Tooltip>
                <Tooltip content="This field is required" position="top">
                  <Icon name="info" size={18} color={theme.colorDanger} />
                </Tooltip>
              </div>

              <Text variant="label">Long content</Text>
              <div style={rowStyle}>
                <Tooltip content="This is a longer tooltip message that describes something in more detail." position="top">
                  <Button variant="ghost">Hover for details</Button>
                </Tooltip>
              </div>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'content', type: 'string', required: true, description: 'Text shown inside the tooltip.' },
                { name: 'children', type: 'React.ReactNode', required: true, description: 'The element the tooltip is attached to.' },
                { name: 'position', type: "'top' | 'bottom' | 'left' | 'right'", defaultValue: "'top'", description: 'Which side of the anchor element the tooltip appears on.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides applied to the tooltip content element.' },
                { name: 'className', type: 'string', description: 'CSS class name override applied to the tooltip wrapper.' },
              ]}
            />
          ),
        },
        {
          title: 'Usage',
          children: (
            <CodeSnippet
              code={`import { Tooltip, Button, Icon } from 'servicenow-sdk-react-component-pack';

// On a button
<Tooltip content="Save the current record" position="top">
  <Button variant="primary">Save</Button>
</Tooltip>

// On an icon
<Tooltip content="This field is required" position="right">
  <Icon name="info" size={16} />
</Tooltip>

// On any element — Tooltip wraps it in a positioned div
<Tooltip content="Click to expand" position="bottom">
  <span>More details</span>
</Tooltip>`}
            />
          ),
        },
      ]}
    />
  );
}
