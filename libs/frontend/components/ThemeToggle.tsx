'use client';

import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/libs/frontend/components/core/button';
import { useTheme } from '@/libs/frontend/components/ThemeProvider';
import { cn } from '@/libs/frontend/utils';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <Button
      className="h-9 w-9 p-0"
      size="sm"
      variant="ghost"
      onClick={toggleTheme}
    >
      <Sun
        className={cn(
          'h-[1.2rem] w-[1.2rem] transition-all',
          theme === 'light' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
        )}
      />
      <Moon
        className={cn(
          'absolute h-[1.2rem] w-[1.2rem] transition-all',
          theme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'
        )}
      />
      <Monitor
        className={cn(
          'absolute h-[1.2rem] w-[1.2rem] transition-all',
          theme === 'system' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'
        )}
      />
      <span className="sr-only">{'Toggle theme'}</span>
    </Button>
  );
}
