'use client';

import { RefreshCw } from 'lucide-react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

import { Button } from '@/libs/frontend/components/core/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/libs/frontend/components/core/form';
import { Input } from '@/libs/frontend/components/core/input';
import { useTranslation } from '@/libs/i18n/client';

interface ExchangeRateInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  sourceCurrency: string;
  targetCurrency: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function ExchangeRateInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label = 'Exchange Rate',
  sourceCurrency,
  targetCurrency,
  onRefresh,
  isLoading = false,
}: ExchangeRateInputProps<TFieldValues, TName>) {
  const { t } = useTranslation('common');

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">{label}</FormLabel>
          <FormControl>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder={t('calculator.forms.placeholders.exchangeRate')}
                  step="any"
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                {sourceCurrency && targetCurrency && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {`1 ${sourceCurrency.toUpperCase()} = ${field.value || 0} ${targetCurrency.toUpperCase()}`}
                  </p>
                )}
              </div>
              <Button
                className="px-3"
                disabled={isLoading || !sourceCurrency || !targetCurrency}
                size="sm"
                type="button"
                variant="outline"
                onClick={onRefresh}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
