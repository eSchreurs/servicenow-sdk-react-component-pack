import React, { useState } from 'react';
import { ThemeProvider, useTheme } from '../npm-package/context/ThemeContext';
import { ServiceNowProvider } from '../npm-package/context/ServiceNowContext';
import { Text } from '../npm-package/components/primitives/Text';

// Atom pages — foundation
import { TextPage } from './pages/TextPage';
import { LabelPage } from './pages/LabelPage';
import { IconPage } from './pages/IconPage';
import { SpinnerPage } from './pages/SpinnerPage';
import { EmptyStatePage } from './pages/EmptyStatePage';

// Atom pages — inputs
import { InputPage } from './pages/InputPage';
import { CheckboxPage } from './pages/CheckboxPage';
import { DropdownPage } from './pages/DropdownPage';

// Atom pages — feedback & action
import { ButtonPage } from './pages/ButtonPage';
import { BadgePage } from './pages/BadgePage';
import { TooltipPage } from './pages/TooltipPage';
import { PopoverPage } from './pages/PopoverPage';

// Atom pages — Field
import { StringFieldPage } from './pages/StringFieldPage';
import { TextAreaFieldPage } from './pages/TextAreaFieldPage';
import { NumberFieldPage } from './pages/NumberFieldPage';
import { CheckboxFieldPage } from './pages/CheckboxFieldPage';
import { DateTimeFieldPage } from './pages/DateTimeFieldPage';
import { ChoiceFieldPage } from './pages/ChoiceFieldPage';
import { ReferenceFieldPage } from './pages/ReferenceFieldPage';

// Molecule pages
import { SearchBarPage } from './pages/SearchBarPage';
import { PaginationPage } from './pages/PaginationPage';

// Organism pages
import { FormPage } from './pages/FormPage';
import { ListPage } from './pages/ListPage';

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
    title: 'Primitives',
    items: [
      { key: 'text', label: 'Text' },
      { key: 'label', label: 'Label' },
      { key: 'icon', label: 'Icon' },
      { key: 'spinner', label: 'Spinner' },
      { key: 'empty-state', label: 'EmptyState' },
    ],
  },
  {
    title: 'Actions & Feedback',
    items: [
      { key: 'input', label: 'Input' },
      { key: 'checkbox', label: 'Checkbox' },
      { key: 'dropdown', label: 'Dropdown' },
      { key: 'button', label: 'Button' },
      { key: 'badge', label: 'Badge' },
      { key: 'tooltip', label: 'Tooltip' },
      { key: 'popover', label: 'Popover' },
    ],
  },
  {
    title: 'Forms & Fields',
    items: [
      { key: 'form', label: 'Form' },
      { key: 'string-field', label: 'String' },
      { key: 'text-area-field', label: 'TextArea' },
      { key: 'number-field', label: 'Number' },
      { key: 'checkbox-field', label: 'Checkbox' },
      { key: 'date-time-field', label: 'DateTime' },
      { key: 'choice-field', label: 'Choice' },
      { key: 'reference-field', label: 'Reference' },
    ],
  },
  {
    title: 'Lists',
    items: [
      { key: 'list', label: 'List' },
      { key: 'search-bar', label: 'SearchBar' },
      { key: 'pagination', label: 'Pagination' },
    ],
  },
];

const PAGE_MAP: Record<PageKey, React.ReactElement> = {
  // Foundation atoms
  'text': <TextPage />,
  'label': <LabelPage />,
  'icon': <IconPage />,
  'spinner': <SpinnerPage />,
  'empty-state': <EmptyStatePage />,
  // Input atoms
  'input': <InputPage />,
  'checkbox': <CheckboxPage />,
  'dropdown': <DropdownPage />,
  // Feedback & action atoms
  'button': <ButtonPage />,
  'badge': <BadgePage />,
  'tooltip': <TooltipPage />,
  'popover': <PopoverPage />,
  // Field atom pages
  'string-field': <StringFieldPage />,
  'text-area-field': <TextAreaFieldPage />,
  'number-field': <NumberFieldPage />,
  'checkbox-field': <CheckboxFieldPage />,
  'date-time-field': <DateTimeFieldPage />,
  'choice-field': <ChoiceFieldPage />,
  'reference-field': <ReferenceFieldPage />,
  // Molecule pages
  'search-bar': <SearchBarPage />,
  'pagination': <PaginationPage />,
  // Organism pages
  'form': <FormPage />,
  'list': <ListPage />,
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
    minHeight: '100vh',
    fontFamily: theme.fontFamily,
    backgroundColor: theme.colorBackground,
    color: theme.colorText,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'inherit',
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
      <ServiceNowProvider>
        <ExplorerShell />
      </ServiceNowProvider>
    </ThemeProvider>
  );
}
