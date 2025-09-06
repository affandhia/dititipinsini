'use client';

import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from 'next-themes';
import * as React from 'react';

import { useConfig } from '@/libs/frontend/components/UserConfigProvider';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  // theme value coming from user config (light|dark|system)
  theme: Theme;
  // setter will update user config's theme value
  setTheme: (theme: Theme) => void;
  // resolved theme after next-themes resolves system -> light|dark
  actualTheme: 'light' | 'dark';
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useConfig();

  // Wrap the app with next-themes provider so other libs (sonner) can consume it
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={theme}
      enableSystem={true}
    >
      <InnerThemeProvider>{children}</InnerThemeProvider>
    </NextThemesProvider>
  );
}

function InnerThemeProvider({ children }: { children: React.ReactNode }) {
  // useNextTheme is only available inside NextThemesProvider
  const { setTheme: setNextTheme, resolvedTheme } = useNextTheme();
  const { theme, setTheme } = useConfig();

  // Sync useConfig theme changes to next-themes
  React.useEffect(() => {
    setNextTheme(theme);
  }, [theme, setNextTheme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme: resolvedTheme === 'dark' ? 'dark' : 'light',
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
