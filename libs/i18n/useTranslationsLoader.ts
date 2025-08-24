'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { loadTranslations, addTranslationsToI18n } from '@/libs/i18n/client';

export function useTranslationsLoader() {
  const {
    data: translations,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ['translations'],
    queryFn: loadTranslations,
    staleTime: 1000 * 60 * 60, // 1 hour - translations don't change often
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Add translations to i18n when they're loaded
  useEffect(() => {
    if (translations && isSuccess) {
      addTranslationsToI18n(translations);
    }
  }, [translations, isSuccess]);

  return {
    isLoading,
    isError,
    error,
    isReady: isSuccess && !!translations,
  };
}
