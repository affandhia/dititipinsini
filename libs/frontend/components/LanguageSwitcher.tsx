'use client';

import { ChevronDown, Globe } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/libs/frontend/components/core/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/libs/frontend/components/core/dropdown-menu';
import { useConfig } from '@/libs/frontend/components/UserConfigProvider';

const languages = [
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'en', name: 'English' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { locale, setLocale } = useConfig();

  // Sync i18n with locale from useConfig on mount and when locale changes
  useEffect(() => {
    if (locale && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  const handleLanguageChange = (languageCode: string) => {
    setLocale(languageCode);
    i18n.changeLanguage(languageCode);
  };

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-9 gap-2" size="sm" variant="ghost">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.name}</span>
          <span className="sm:hidden">
            {currentLanguage.code.toUpperCase()}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className={locale === language.code ? 'bg-accent' : ''}
            onClick={() => handleLanguageChange(language.code)}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
