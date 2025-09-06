'use client';

import { Settings as Menu } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/libs/frontend/components/core/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/libs/frontend/components/core/sheet';
import { LanguageSwitcher } from '@/libs/frontend/components/LanguageSwitcher';
import { ThemeToggle } from '@/libs/frontend/components/ThemeToggle';
import { UserConfig } from '@/libs/frontend/components/UserConfig';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const settingsText = t('navbar.settings', { defaultValue: 'Pengaturan' });

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link className="flex items-center space-x-2" href="/">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">{'D'}</span>
          </div>
          <span className="hidden font-bold sm:inline-block">
            {t('app.name', { defaultValue: 'Ditipin Calculator' })}
          </span>
        </Link>

        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button className="h-9 w-9 p-0" size="sm" variant="ghost">
                <Menu className="h-4 w-4" />
                <span className="sr-only">{settingsText}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{settingsText}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 px-4">
                <UserConfig />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
