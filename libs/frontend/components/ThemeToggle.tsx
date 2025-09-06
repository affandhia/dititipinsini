'use client';

import { Moon, Sun } from 'lucide-react';

import { Button } from '@/libs/frontend/components/core/button';
import { useTheme } from '@/libs/frontend/components/ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(actualTheme === 'light' ? 'dark' : 'light');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  };

  return (
    <Button
      className="h-9 w-9 p-0"
      size="sm"
      variant="ghost"
      onClick={toggleTheme}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">{'Toggle theme'}</span>
    </Button>
  );
}
