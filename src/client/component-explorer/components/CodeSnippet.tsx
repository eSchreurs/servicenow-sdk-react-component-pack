import React from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';

interface CodeSnippetProps {
  code: string;
  language?: string;   // default: 'tsx'
}

export function CodeSnippet({ code }: CodeSnippetProps): React.ReactElement {
  const theme = useTheme();

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    borderRadius: theme.borderRadius,
    overflow: 'hidden',
    border: `${theme.borderWidth} solid ${theme.colorBorder}`,
  };

  const preStyle: React.CSSProperties = {
    margin: 0,
    padding: theme.spacingMd,
    backgroundColor: '#1e1e2e',
    overflowX: 'auto',
    fontFamily: 'monospace',
    fontSize: theme.fontSizeSmall,
    lineHeight: theme.lineHeightBase,
    color: '#cdd6f4',
  };

  const codeStyle: React.CSSProperties = {
    fontFamily: 'inherit',
    color: 'inherit',
  };

  return (
    <div style={containerStyle}>
      <pre style={preStyle}>
        <code style={codeStyle}>{code.trim()}</code>
      </pre>
    </div>
  );
}
