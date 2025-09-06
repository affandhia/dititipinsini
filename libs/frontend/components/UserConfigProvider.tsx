'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { Resolver, useForm, UseFormReturn } from 'react-hook-form';
import { useLocalStorage } from 'react-use';

import { validatedUserConfig } from '@/config/validate';
import {
  UserConfigFormValues,
  userConfigSchema,
} from '@/schemas/calculatorSchema';

const USER_CONFIG_FORM_VALUES_KEY = 'user-config-form-state';
const defaultUserConfigValues: UserConfigFormValues = validatedUserConfig;

interface ConfigFormContextValue {
  userConfigForm: UseFormReturn<UserConfigFormValues>;
}

const ConfigFormContext = createContext<ConfigFormContextValue | undefined>(
  undefined
);

interface ConfigFormProviderProps {
  children: ReactNode;
}

export function ConfigFormProvider({ children }: ConfigFormProviderProps) {
  const [storedUserConfigValues] = useLocalStorage<UserConfigFormValues>(
    USER_CONFIG_FORM_VALUES_KEY,
    defaultUserConfigValues
  );

  const userConfigForm = useForm<UserConfigFormValues>({
    resolver: zodResolver(userConfigSchema) as Resolver<UserConfigFormValues>,
    defaultValues: storedUserConfigValues,
    mode: 'all',
  });

  const watchedUserConfigValues = userConfigForm.watch();

  // Persist form values to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      USER_CONFIG_FORM_VALUES_KEY,
      JSON.stringify(watchedUserConfigValues)
    );
  }, [watchedUserConfigValues]);

  const contextValue: ConfigFormContextValue = {
    userConfigForm,
  };

  return (
    <ConfigFormContext.Provider value={contextValue}>
      {children}
    </ConfigFormContext.Provider>
  );
}

export function useConfigForm(): ConfigFormContextValue {
  const context = useContext(ConfigFormContext);
  if (context === undefined) {
    throw new Error('useConfigForm must be used within a ConfigFormProvider');
  }
  return context;
}

export function useConfig(): {
  shouldShowPresets: boolean;
  setShowPresets: (value: boolean) => void;
  isDrawerView: boolean;
  isInlineView: boolean;
  isDrawerOpen: boolean;
  setResultViewMode: (value: boolean) => void;
  setDrawerOpen: (value: boolean) => void;
  theme: UserConfigFormValues['theme'];
  setTheme: (value: UserConfigFormValues['theme']) => void;
  locale: string;
  setLocale: (value: string) => void;
  reset: () => void;
} {
  const { userConfigForm } = useConfigForm();

  // =========================
  // ===== USER CONFIG =======
  // =========================
  const isDrawerOpen = userConfigForm.watch('isDrawerOpen');
  const locale = userConfigForm.watch('locale');
  const theme = userConfigForm.watch('theme');
  const resultViewValue = userConfigForm.watch('resultView');
  const isDrawerView = resultViewValue === 'drawer';
  const isInlineView = resultViewValue === 'inline';
  const shouldShowPresets = userConfigForm.watch('shouldShowPresets');
  const setShowPresets = useCallback(
    (value: boolean): void => {
      userConfigForm.setValue('shouldShowPresets', value);
    },
    [userConfigForm]
  );

  const setResultViewMode = useCallback(
    (value: boolean): void => {
      userConfigForm.setValue('resultView', value ? 'drawer' : 'inline');
      if (value) {
        userConfigForm.setValue('isDrawerOpen', true);
      }
    },
    [userConfigForm]
  );

  const setDrawerOpen = useCallback(
    (value: boolean): void => {
      userConfigForm.setValue('isDrawerOpen', value);
    },
    [userConfigForm]
  );

  const setTheme = useCallback(
    (value: 'light' | 'dark' | 'system'): void => {
      userConfigForm.setValue('theme', value);
    },
    [userConfigForm]
  );

  const setLocale = useCallback(
    (value: string): void => {
      userConfigForm.setValue('locale', value);
    },
    [userConfigForm]
  );

  const reset = useCallback((): void => {
    userConfigForm.reset(defaultUserConfigValues);
  }, [userConfigForm]);

  return {
    shouldShowPresets,
    setShowPresets,
    isDrawerView,
    setResultViewMode,
    isInlineView,
    isDrawerOpen,
    setDrawerOpen,
    theme,
    setTheme,
    locale,
    setLocale,
    reset,
  };
}
