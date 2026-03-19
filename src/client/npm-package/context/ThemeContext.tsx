import React, { createContext, useContext, ReactNode } from 'react';
import { Theme, defaultTheme } from '../theme/theme';

export const ThemeContext = createContext<Theme>(defaultTheme);

interface ThemeProviderProps {
  theme?: Partial<Theme>;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps): JSX.Element {
  const mergedTheme: Theme = theme ? { ...defaultTheme, ...theme } : defaultTheme;
  return (
    <ThemeContext.Provider value={mergedTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
