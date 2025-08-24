'use client';

import { LoadingScreen } from '@/libs/frontend/components/LoadingScreen';
import { useTranslationsLoader } from '@/libs/i18n/useTranslationsLoader';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { isLoading, isError, error, isReady } = useTranslationsLoader();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return <LoadingScreen error={error as Error} />;
  }

  if (!isReady) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
