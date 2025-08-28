'use client';

import { ChevronsUpDown } from 'lucide-react';

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/libs/frontend/components/core/collapsible';
import { formatCurrency } from '@/libs/frontend/utils/currency';
import { useTranslation } from '@/libs/i18n/client';

import { cn } from '../utils';

interface FeeCalculation {
  label: string;
  amount: number;
  displayValue: string;
}

interface ResultDisplayProps {
  originalPrice: number;
  hasDiscount: boolean;
  discountedPrice: number;
  sourceCurrency: string;
  targetCurrency: string;
  exchangeRate: number;
  fees: FeeCalculation[];
  subtotal: number;
  finalTotal: number;
  className?: HTMLDivElement['className'];
}

export function ResultDisplay({
  originalPrice,
  hasDiscount,
  discountedPrice,
  sourceCurrency,
  targetCurrency,
  exchangeRate,
  fees,
  subtotal,
  finalTotal,
  className,
}: ResultDisplayProps) {
  const { t } = useTranslation('common');

  return (
    <div
      className={cn(
        className,
        'rounded-lg border bg-card p-6 text-card-foreground'
      )}
    >
      <div className="space-y-3">
        {/* Original Price */}
        <div className="flex justify-between">
          <span>{t('calculator.results.originalPrice')}</span>
          <span className="font-medium">
            {formatCurrency(originalPrice, sourceCurrency)}
          </span>
        </div>

        {/* Discounted Price - show only if discount is applied */}
        {hasDiscount && discountedPrice > 0 && (
          <div className="flex justify-between">
            <span>{t('calculator.results.discountedPrice')}</span>
            <span className="font-medium text-green-600">
              {formatCurrency(discountedPrice, sourceCurrency)}
            </span>
          </div>
        )}

        {/* Exchange Rate */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {t('calculator.results.exchangeRate', {
              sourceCurrency,
              targetCurrency,
            })}
          </span>
          <span>{exchangeRate.toFixed(4)}</span>
        </div>

        {/* Converted Base Price */}
        <div className="flex justify-between">
          <span>{t('calculator.results.convertedBasePrice')}</span>
          <span className="font-medium">
            {formatCurrency(
              (hasDiscount && discountedPrice > 0
                ? discountedPrice
                : originalPrice) * exchangeRate,
              targetCurrency
            )}
          </span>
        </div>

        <hr className="my-4" />

        {/* Fees (Collapsible) */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger asChild>
            <div className="flex cursor-pointer items-center justify-between py-2 select-none">
              <span className="font-semibold">
                {t('calculator.results.fees', { defaultValue: 'Total Fee:' })}{' '}
                {formatCurrency(
                  fees.reduce((acc, fee) => acc + fee.amount, 0),
                  targetCurrency
                )}
              </span>
              <ChevronsUpDown size="14" />
              <span className="sr-only">{'Toggle'}</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3">
            {fees.map((fee) => (
              <div key={fee.label} className="flex justify-between">
                <span>{`${fee.label}:`}</span>
                <span className="font-medium">
                  {formatCurrency(fee.amount, targetCurrency)}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {`(${fee.displayValue})`}
                  </span>
                </span>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <hr className="my-4" />

        {/* Subtotal */}
        <div className="flex justify-between text-lg">
          <span className="font-semibold">
            {t('calculator.results.subtotal')}
          </span>
          <span className="font-semibold">
            {formatCurrency(subtotal, targetCurrency)}
          </span>
        </div>

        {/* Final Total */}
        <div className="flex justify-between border-t pt-3 text-xl">
          <span className="font-bold">
            {t('calculator.results.finalTotal')}
          </span>
          <span className="font-bold text-primary">
            {formatCurrency(finalTotal, targetCurrency)}
          </span>
        </div>
      </div>
    </div>
  );
}
