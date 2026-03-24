export interface Theme {
  // Colors
  colorPrimary: string;
  colorSecondary: string;
  colorDanger: string;
  colorText: string;
  colorTextMuted: string;
  colorBackground: string;
  colorBackgroundMuted: string;
  colorBorder: string;
  colorBorderFocus: string;

  // Typography
  fontFamily: string;
  fontSizeSmall: string;
  fontSizeBase: string;
  fontSizeLarge: string;
  fontWeightNormal: number;
  fontWeightMedium: number;
  fontWeightBold: number;
  lineHeightBase: number;

  // Spacing
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;

  // Borders
  borderRadius: string;
  borderRadiusSm: string;
  borderRadiusLg: string;
  borderWidth: string;

  // Icons
  iconSizeDefault: number;

  // Inputs
  inputHeight: string;
  inputPaddingHorizontal: string;
  inputBackgroundColor: string;
  inputBackgroundColorDisabled: string;

  // Shadows
  shadowSm: string;
  shadowMd: string;

  // Transitions
  transitionSpeed: string;
}

export const defaultTheme: Theme = {
  // Colors — neutral enterprise palette
  colorPrimary: '#1a6cf6',
  colorSecondary: '#6b7280',
  colorDanger: '#dc2626',
  colorText: '#111827',
  colorTextMuted: '#6b7280',
  colorBackground: '#ffffff',
  colorBackgroundMuted: '#f9fafb',
  colorBorder: '#d1d5db',
  colorBorderFocus: '#1a6cf6',

  // Typography
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSizeSmall: '0.75rem',
  fontSizeBase: '0.875rem',
  fontSizeLarge: '1rem',
  fontWeightNormal: 400,
  fontWeightMedium: 500,
  fontWeightBold: 600,
  lineHeightBase: 1.5,

  // Spacing
  spacingXs: '0.25rem',
  spacingSm: '0.5rem',
  spacingMd: '1rem',
  spacingLg: '1.5rem',
  spacingXl: '2rem',

  // Borders
  borderRadius: '0.375rem',
  borderRadiusSm: '0.25rem',
  borderRadiusLg: '0.5rem',
  borderWidth: '1px',

  // Icons
  iconSizeDefault: 16,

  // Inputs
  inputHeight: '2.25rem',
  inputPaddingHorizontal: '0.75rem',
  inputBackgroundColor: '#ffffff',
  inputBackgroundColorDisabled: '#f3f4f6',

  // Shadows
  shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',

  // Transitions
  transitionSpeed: '150ms',
};
