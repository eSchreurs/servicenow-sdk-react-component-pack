import React from 'react';
import { Icon, IconName } from '../../npm-package/components/primitives/Icon';
import { useTheme } from '../../npm-package/context/ThemeContext';
import { Text } from '../../npm-package/components/primitives/Text';
import { PropTable } from '../components/PropTable';
import { CodeSnippet } from '../components/CodeSnippet';
import { PageLayout } from '../components/PageLayout';

const ALL_ICONS: IconName[] = ['search', 'clear', 'info', 'edit', 'calendar', 'check'];

export function IconPage(): React.ReactElement {
  const theme = useTheme();

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: theme.spacingMd,
  };

  const iconCardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacingSm,
    padding: theme.spacingMd,
    backgroundColor: theme.colorBackground,
    borderRadius: theme.borderRadius,
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
  };

  const sizeRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacingLg,
    flexWrap: 'wrap',
  };

  const sizeExampleStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacingXs,
  };

  return (
    <PageLayout
      title="Icon"
      description="Renders inline SVG icons by name. No external icon library — all icons are self-contained SVG paths."
      sections={[
        {
          title: 'Preview',
          children: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacingLg }}>
              <Text variant="label">All icons (16px)</Text>
              <div style={gridStyle}>
                {ALL_ICONS.map((name) => (
                  <div key={name} style={iconCardStyle}>
                    <Icon name={name} size={16} color={theme.colorText} />
                    <Text variant="caption">{name}</Text>
                  </div>
                ))}
              </div>

              <Text variant="label">Sizes</Text>
              <div style={sizeRowStyle}>
                {([12, 16, 20, 24, 32] as const).map((size) => (
                  <div key={size} style={sizeExampleStyle}>
                    <Icon name="search" size={size} color={theme.colorPrimary} />
                    <Text variant="caption">{size}px</Text>
                  </div>
                ))}
              </div>

              <Text variant="label">Color examples</Text>
              <div style={sizeRowStyle}>
                {[
                  { color: theme.colorPrimary, label: 'primary' },
                  { color: theme.colorDanger, label: 'danger' },
                  { color: theme.colorTextMuted, label: 'muted' },
                  { color: theme.colorSecondary, label: 'secondary' },
                ].map(({ color, label }) => (
                  <div key={label} style={sizeExampleStyle}>
                    <Icon name="check" size={20} color={color} />
                    <Text variant="caption">{label}</Text>
                  </div>
                ))}
              </div>
            </div>
          ),
        },
        {
          title: 'Props',
          children: (
            <PropTable
              props={[
                { name: 'name', type: "'search' | 'clear' | 'info' | 'edit' | 'calendar' | 'check'", required: true, description: 'Name of the icon to render.' },
                { name: 'size', type: 'number', defaultValue: '16', description: 'Width and height of the SVG in pixels.' },
                { name: 'color', type: 'string', defaultValue: "'currentColor'", description: 'SVG stroke color. Accepts any CSS color value.' },
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
              code={`import { Icon } from 'servicenow-sdk-react-component-pack';

// Default size and color
<Icon name="search" />

// Custom size and color
<Icon name="check" size={24} color="#16a34a" />

// Inline with text — inherits text color via currentColor
<span style={{ color: '#dc2626' }}>
  <Icon name="clear" />
  Remove
</span>`}
            />
          ),
        },
      ]}
    />
  );
}
