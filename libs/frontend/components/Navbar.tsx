'use client';

import { Menu } from 'lucide-react';
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

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const menuItems = [{ key: 'calculator', href: '/' }];

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link className="flex items-center space-x-2" href="/">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="text-sm font-bold">{'D'}</span>
          </div>
          <span className="hidden font-bold sm:inline-block">
            {'Ditipin Calculator'}
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center space-x-4 md:flex">
          {menuItems.map((item) => (
            <Link
              key={item.key}
              className="text-sm font-medium transition-colors hover:text-primary"
              href={item.href}
            >
              {t(`navbar.${item.key}`)}
            </Link>
          ))}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <LanguageSwitcher />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button className="h-9 w-9 p-0" size="sm" variant="ghost">
                <Menu className="h-4 w-4" />
                <span className="sr-only">{t('navbar.menu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{'Menu'}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.key}
                    className="block text-sm font-medium transition-colors hover:text-primary"
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    {t(`navbar.${item.key}`)}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
