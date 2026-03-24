import React, { useState } from 'react';
import { ThemeProvider, useTheme } from '../npm-package/context/ThemeContext';
import { Text } from '../npm-package/components/atoms/Text';

// Atom pages — Phase 4
import { TextPage } from './pages/atoms/TextPage';
import { LabelPage } from './pages/atoms/LabelPage';
import { FieldWrapperPage } from './pages/atoms/FieldWrapperPage';
import { IconPage } from './pages/atoms/IconPage';
import { SpinnerPage } from './pages/atoms/SpinnerPage';

// ---------------------------------------------------------------------------
// Nav structure — add new pages here as phases are completed
// ---------------------------------------------------------------------------

type PageKey = string;

interface NavItem {
  key: PageKey;
  label: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Atoms — Foundation',
    items: [
      { key: 'text', label: 'Text' },
      { key: 'label', label: 'Label' },
      { key: 'field-wrapper', label: 'FieldWrapper' },
      { key: 'icon', label: 'Icon' },
      { key: 'spinner', label: 'Spinner' },
    ],
  },
  // Phase 5 — Input Atoms (to be added)
  // Phase 6 — Feedback & Action Atoms (to be added)
  // Phase 7 — Molecules (to be added)
  // Phase 8 — Organisms (to be added)
];

const PAGE_MAP: Record<PageKey, React.ReactElement> = {
  'text': <TextPage />,
  'label': <LabelPage />,
  'field-wrapper': <FieldWrapperPage />,
  'icon': <IconPage />,
  'spinner': <SpinnerPage />,
};

const DEFAULT_PAGE: PageKey = 'text';

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

interface SidebarProps {
  selected: PageKey;
  onSelect: (key: PageKey) => void;
}

function Sidebar({ selected, onSelect }: SidebarProps): React.ReactElement {
  const theme = useTheme();

  const sidebarStyle: React.CSSProperties = {
    width: '220px',
    flexShrink: 0,
    backgroundColor: theme.colorBackgroundMuted,
    borderRight: `${theme.borderWidth} solid ${theme.colorBorder}`,
    overflowY: 'auto',
    padding: `${theme.spacingMd} 0`,
  };

  const logoAreaStyle: React.CSSProperties = {
    padding: `0 ${theme.spacingMd} ${theme.spacingMd}`,
    borderBottom: `${theme.borderWidth} solid ${theme.colorBorder}`,
    marginBottom: theme.spacingMd,
  };

  const groupTitleStyle: React.CSSProperties = {
    padding: `${theme.spacingXs} ${theme.spacingMd}`,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeSmall,
    fontWeight: theme.fontWeightBold,
    color: theme.colorTextMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: theme.spacingSm,
  };

  return (
    <nav style={sidebarStyle}>
      <div style={logoAreaStyle}>
        <Text variant="label" style={{ fontSize: theme.fontSizeBase }}>
          Component Explorer
        </Text>
        <Text variant="caption" style={{ display: 'block', marginTop: theme.spacingXs }}>
          ServiceNow SDK React Pack
        </Text>
      </div>

      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <div style={groupTitleStyle}>{group.title}</div>
          {group.items.map((item) => (
            <NavItem
              key={item.key}
              label={item.label}
              isSelected={selected === item.key}
              onClick={() => onSelect(item.key)}
            />
          ))}
        </div>
      ))}
    </nav>
  );
}

interface NavItemProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

function NavItem({ label, isSelected, onClick }: NavItemProps): React.ReactElement {
  const theme = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const itemStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: `${theme.spacingXs} ${theme.spacingMd}`,
    border: 'none',
    background: isSelected
      ? theme.colorPrimary
      : isHovered
      ? theme.colorBorder
      : 'transparent',
    color: isSelected ? '#ffffff' : theme.colorText,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
    textAlign: 'left',
    cursor: 'pointer',
    transition: `background ${theme.transitionSpeed}`,
    borderRadius: theme.borderRadiusSm,
    margin: '1px 0',
    boxSizing: 'border-box',
  };

  return (
    <button
      style={itemStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Root shell
// ---------------------------------------------------------------------------

function ExplorerShell(): React.ReactElement {
  const theme = useTheme();
  const [selectedKey, setSelectedKey] = useState<PageKey>(DEFAULT_PAGE);

  const shellStyle: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    fontFamily: theme.fontFamily,
    backgroundColor: theme.colorBackground,
    color: theme.colorText,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
  };

  return (
    <div style={shellStyle}>
      <Sidebar selected={selectedKey} onSelect={setSelectedKey} />
      <main style={contentStyle}>
        {PAGE_MAP[selectedKey] ?? (
          <div style={{ padding: theme.spacingXl }}>
            <Text variant="body">Select a component from the sidebar.</Text>
          </div>
        )}
      </main>
    </div>
  );
}

export function ComponentExplorer(): React.ReactElement {
  return (
    <ThemeProvider>
      <ExplorerShell />
    </ThemeProvider>
  );
}
