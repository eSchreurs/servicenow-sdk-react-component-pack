import React from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';

export interface PropDefinition {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
  required?: boolean;
}

interface PropTableProps {
  props: PropDefinition[];
}

export function PropTable({ props }: PropTableProps): React.ReactElement {
  const theme = useTheme();

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSizeBase,
  };

  const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: `${theme.spacingSm} ${theme.spacingMd}`,
    borderBottom: `2px solid ${theme.colorBorder}`,
    fontWeight: theme.fontWeightBold,
    color: theme.colorText,
    backgroundColor: theme.colorBackgroundMuted,
  };

  const tdStyle: React.CSSProperties = {
    padding: `${theme.spacingSm} ${theme.spacingMd}`,
    borderBottom: `${theme.borderWidth} solid ${theme.colorBorder}`,
    color: theme.colorText,
    verticalAlign: 'top',
  };

  const codeStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: theme.fontSizeSmall,
    backgroundColor: theme.colorBackgroundMuted,
    padding: `1px ${theme.spacingXs}`,
    borderRadius: theme.borderRadiusSm,
    color: theme.colorPrimary,
  };

  const requiredBadgeStyle: React.CSSProperties = {
    display: 'inline-block',
    fontSize: theme.fontSizeSmall,
    fontWeight: theme.fontWeightBold,
    color: theme.colorDanger,
    marginLeft: theme.spacingXs,
  };

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Prop</th>
          <th style={thStyle}>Type</th>
          <th style={thStyle}>Default</th>
          <th style={thStyle}>Description</th>
        </tr>
      </thead>
      <tbody>
        {props.map((prop) => (
          <tr key={prop.name}>
            <td style={tdStyle}>
              <code style={codeStyle}>{prop.name}</code>
              {prop.required && <span style={requiredBadgeStyle}>*</span>}
            </td>
            <td style={tdStyle}>
              <code style={{ ...codeStyle, color: theme.colorSecondary }}>{prop.type}</code>
            </td>
            <td style={tdStyle}>
              {prop.defaultValue !== undefined
                ? <code style={codeStyle}>{prop.defaultValue}</code>
                : <span style={{ color: theme.colorTextMuted }}>—</span>
              }
            </td>
            <td style={{ ...tdStyle, color: theme.colorTextMuted }}>{prop.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
