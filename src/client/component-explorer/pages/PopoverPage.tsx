import React, { useRef, useState } from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';
import { Popover } from '../../npm-package/components/actions/Popover';
import { Button } from '../../npm-package/components/actions/Button';
import { Badge } from '../../npm-package/components/actions/Badge';
import { Text } from '../../npm-package/components/primitives/Text';
import { PropTable } from '../components/PropTable';
import { CodeSnippet } from '../components/CodeSnippet';
import { PageLayout } from '../components/PageLayout';

export function PopoverPage(): React.ReactElement {
  const theme = useTheme();

  const [basicOpen, setBasicOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [noTitleOpen, setNoTitleOpen] = useState(false);

  const basicRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const noTitleRef = useRef<HTMLDivElement>(null);

  const colStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacingLg,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacingMd,
  };

  const fieldRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: theme.spacingSm,
    paddingBottom: theme.spacingSm,
    borderBottom: `${theme.borderWidth} solid ${theme.colorBorder}`,
  };

  const labelStyle: React.CSSProperties = {
    color: theme.colorTextMuted,
    fontSize: theme.fontSizeSmall,
    fontFamily: theme.fontFamily,
    fontWeight: theme.fontWeightMedium,
  };

  const valueStyle: React.CSSProperties = {
    fontSize: theme.fontSizeBase,
    fontFamily: theme.fontFamily,
    color: theme.colorText,
  };

  return (
    <PageLayout
      title="Popover"
      description="Floating content container triggered by click. Renders via ReactDOM.createPortal to avoid z-index issues. Flips upward when there is insufficient space below the anchor."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={colStyle}>
              <Text variant="label">Basic popover</Text>
              <div style={rowStyle}>
                <div ref={basicRef} style={{ display: 'inline-block' }}>
                  <Button
                    variant="secondary"
                    onClick={() => setBasicOpen((o) => !o)}
                  >
                    {basicOpen ? 'Close popover' : 'Open popover'}
                  </Button>
                </div>
                <Popover
                  isOpen={basicOpen}
                  onClose={() => setBasicOpen(false)}
                  title="Example popover"
                  anchorRef={basicRef as unknown as React.RefObject<HTMLElement>}
                >
                  <Text variant="body">
                    This is the popover body. It can contain any React content — text, fields, tables, or other components.
                  </Text>
                </Popover>
              </div>

              <Text variant="label">Record info preview — typical use case</Text>
              <div style={rowStyle}>
                <div ref={infoRef} style={{ display: 'inline-block' }}>
                  <Button
                    variant="ghost"
                    onClick={() => setInfoOpen((o) => !o)}
                  >
                    View record details
                  </Button>
                </div>
                <Popover
                  isOpen={infoOpen}
                  onClose={() => setInfoOpen(false)}
                  title="INC0012345 — Printer not working"
                  anchorRef={infoRef as unknown as React.RefObject<HTMLElement>}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacingSm }}>
                    {[
                      { label: 'Number', value: 'INC0012345' },
                      { label: 'State', value: 'In Progress' },
                      { label: 'Priority', value: '2 - High' },
                      { label: 'Assigned to', value: 'Jane Smith' },
                      { label: 'Category', value: 'Hardware' },
                    ].map(({ label, value }) => (
                      <div key={label} style={fieldRowStyle}>
                        <span style={labelStyle}>{label}</span>
                        <span style={valueStyle}>
                          {label === 'State' && <Badge variant="warning">{value}</Badge>}
                          {label === 'Priority' && <Badge variant="danger">{value}</Badge>}
                          {label !== 'State' && label !== 'Priority' && value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Popover>
              </div>

              <Text variant="label">Without title</Text>
              <div style={rowStyle}>
                <div ref={noTitleRef} style={{ display: 'inline-block' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setNoTitleOpen((o) => !o)}
                  >
                    No title popover
                  </Button>
                </div>
                <Popover
                  isOpen={noTitleOpen}
                  onClose={() => setNoTitleOpen(false)}
                  anchorRef={noTitleRef as unknown as React.RefObject<HTMLElement>}
                >
                  <Text variant="body">Popover without a title — only the × close button appears in the header.</Text>
                </Popover>
              </div>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'isOpen', type: 'boolean', required: true, description: 'Controls whether the popover is visible.' },
                { name: 'onClose', type: '() => void', required: true, description: 'Called when the user clicks outside, presses Escape, or clicks the × button.' },
                { name: 'children', type: 'React.ReactNode', required: true, description: 'Content rendered inside the popover body.' },
                { name: 'anchorRef', type: 'React.RefObject<HTMLElement>', required: true, description: 'Ref to the element the popover positions itself against.' },
                { name: 'title', type: 'string', description: 'Optional title shown in the popover header.' },
                { name: 'style', type: 'React.CSSProperties', description: 'Inline style overrides applied to the popover container.' },
                { name: 'className', type: 'string', description: 'CSS class name override applied to the popover container.' },
              ]}
            />
          ),
        },
        {
          title: 'Usage',
          children: (
            <CodeSnippet
              code={`import { Popover, Button } from 'servicenow-sdk-react-component-pack';
import { useRef, useState } from 'react';

const [isOpen, setIsOpen] = useState(false);
const anchorRef = useRef<HTMLDivElement>(null);

<div ref={anchorRef} style={{ display: 'inline-block' }}>
  <Button onClick={() => setIsOpen((o) => !o)}>
    Show details
  </Button>
</div>

<Popover
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Record details"
  anchorRef={anchorRef as unknown as React.RefObject<HTMLElement>}
>
  <p>Popover content goes here.</p>
</Popover>`}
            />
          ),
        },
      ]}
    />
  );
}
