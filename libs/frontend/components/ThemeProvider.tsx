'use client';

import * as React from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>('system');
  const [actualTheme, setActualTheme] = React.useState<'light' | 'dark'>(
    'light'
  );

  // Function to get system theme preference
  const getSystemTheme = React.useCallback((): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return 'light';
  }, []);

  // Function to apply theme to document
  const applyTheme = React.useCallback((themeToApply: 'light' | 'dark') => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;

      if (themeToApply === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        body.classList.remove('dark');
      }
    }
  }, []);

  // Initialize theme on mount
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    const initialTheme = savedTheme || 'system';
    setTheme(initialTheme);

    const resolvedTheme =
      initialTheme === 'system'
        ? getSystemTheme()
        : initialTheme === 'dark'
          ? 'dark'
          : 'light';
    setActualTheme(resolvedTheme);
    applyTheme(resolvedTheme);
  }, [getSystemTheme, applyTheme]);

  // Listen for system theme changes
  React.useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const systemTheme = getSystemTheme();
        setActualTheme(systemTheme);
        applyTheme(systemTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, getSystemTheme, applyTheme]);

  // Update theme when theme state changes
  React.useEffect(() => {
    localStorage.setItem('theme', theme);
    const resolvedTheme =
      theme === 'system'
        ? getSystemTheme()
        : theme === 'dark'
          ? 'dark'
          : 'light';
    setActualTheme(resolvedTheme);
    applyTheme(resolvedTheme);
  }, [theme, getSystemTheme, applyTheme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    actualTheme,
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
