'use client';

import { formatCurrency } from '@/libs/frontend/utils/currency';
import { useTranslation } from '@/libs/i18n/client';

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
}: ResultDisplayProps) {
  const { t } = useTranslation('common');

  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground">
      <h3 className="mb-4 text-lg font-semibold">
        {t('calculator.results.costBreakdown')}
      </h3>

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

        {/* Fees */}
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
