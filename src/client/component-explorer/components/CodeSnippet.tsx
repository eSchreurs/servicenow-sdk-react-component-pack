import React from 'react';
import { useTheme } from '../../npm-package/context/ThemeContext';

interface CodeSnippetProps {
  code: string;
  language?: string;   // default: 'tsx'
}

// ---------------------------------------------------------------------------
// Tokenizer — Catppuccin Mocha palette
// ---------------------------------------------------------------------------

interface Token {
  text: string;
  color: string;
}

const C = {
  plain:    '#cdd6f4',
  comment:  '#6c7086',
  string:   '#a6e3a1',
  keyword:  '#cba6f7',
  jsxTag:   '#89b4fa',
  fn:       '#89b4fa',
  number:   '#fab387',
  operator: '#89dceb',
} as const;

const KEYWORDS = new Set([
  'import', 'export', 'from', 'const', 'let', 'var', 'function', 'return',
  'type', 'interface', 'class', 'extends', 'implements', 'new', 'if', 'else',
  'for', 'while', 'async', 'await', 'default', 'null', 'undefined', 'true',
  'false', 'void', 'of', 'in', 'readonly', 'as', 'typeof', 'switch', 'case',
  'break', 'continue', 'throw', 'try', 'catch', 'finally', 'static',
]);

// Ordered rules — first match wins at the current position
const RULES: Array<{ re: RegExp; color: string }> = [
  { re: /^\/\/[^\n]*/,                          color: C.comment  }, // line comment
  { re: /^\/\*[\s\S]*?\*\//,                    color: C.comment  }, // block comment
  { re: /^`(?:[^`\\]|\\.)*`/,                   color: C.string   }, // template literal
  { re: /^"(?:[^"\\]|\\.)*"/,                   color: C.string   }, // double-quoted string
  { re: /^'(?:[^'\\]|\\.)*'/,                   color: C.string   }, // single-quoted string
  { re: /^<\/?[A-Za-z][a-zA-Z0-9.]*/,           color: C.jsxTag   }, // JSX tag
  { re: /^[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/,    color: C.fn       }, // function call
  { re: /^[a-zA-Z_]\w*/,                        color: C.plain    }, // identifier (keyword check below)
  { re: /^\b\d+(?:\.\d+)?\b/,                   color: C.number   }, // number
  { re: /^(?:=>|\.\.\.)/ ,                       color: C.operator }, // operator
  { re: /^[\s\S]/,                              color: C.plain    }, // catch-all
];

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let remaining = code;

  while (remaining.length > 0) {
    for (const { re, color } of RULES) {
      const match = remaining.match(re);
      if (!match) continue;

      const text = match[0];
      // Promote plain identifiers that are keywords
      const resolvedColor =
        color === C.plain && KEYWORDS.has(text) ? C.keyword : color;

      // Merge adjacent tokens of the same color to keep the DOM small
      const prev = tokens[tokens.length - 1];
      if (prev && prev.color === resolvedColor) {
        prev.text += text;
      } else {
        tokens.push({ text, color: resolvedColor });
      }

      remaining = remaining.slice(text.length);
      break;
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
    color: C.plain,
  };

  const codeStyle: React.CSSProperties = {
    fontFamily: 'inherit',
  };

  const tokens = tokenize(code.trim());

  return (
    <div style={containerStyle}>
      <pre style={preStyle}>
        <code style={codeStyle}>
          {tokens.map((tok, i) => (
            <span key={i} style={{ color: tok.color }}>{tok.text}</span>
          ))}
        </code>
      </pre>
    </div>
  );
}
