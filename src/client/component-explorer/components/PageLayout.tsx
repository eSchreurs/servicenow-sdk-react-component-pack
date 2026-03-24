import React from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';
import { Text } from '../../npm-package/components/atoms/Text';

interface Section {
  title: string;
  children: React.ReactNode;
}

interface PageLayoutProps {
  title: string;
  description: string;
  sections: Section[];
}

export function PageLayout({ title, description, sections }: PageLayoutProps): React.ReactElement {
  const theme = useTheme();

  const pageStyle: React.CSSProperties = {
    padding: theme.spacingXl,
    maxWidth: '900px',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: theme.spacingLg,
    paddingBottom: theme.spacingMd,
    borderBottom: `2px solid ${theme.colorBorder}`,
  };

  const descriptionStyle: React.CSSProperties = {
    marginTop: theme.spacingSm,
    color: theme.colorTextMuted,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
    lineHeight: theme.lineHeightBase,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: theme.spacingXl,
  };

  const sectionTitleStyle: React.CSSProperties = {
    marginBottom: theme.spacingMd,
    paddingBottom: theme.spacingXs,
    borderBottom: `${theme.borderWidth} solid ${theme.colorBorder}`,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeLarge,
    fontWeight: theme.fontWeightBold,
    color: theme.colorText,
  };

  const previewBoxStyle: React.CSSProperties = {
    padding: theme.spacingLg,
    backgroundColor: theme.colorBackgroundMuted,
    borderRadius: theme.borderRadius,
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <Text variant="heading" style={{ fontSize: '1.5rem' }}>{title}</Text>
        <p style={descriptionStyle}>{description}</p>
      </div>

      {sections.map((section) => (
        <div key={section.title} style={sectionStyle}>
          <h3 style={sectionTitleStyle}>{section.title}</h3>
          {section.title === 'Preview'
            ? <div style={previewBoxStyle}>{section.children}</div>
            : section.children
          }
        </div>
      ))}
    </div>
  );
}
