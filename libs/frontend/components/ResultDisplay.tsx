'use client';

import { cn, safeNstr } from '@/libs/frontend/utils';
import { formatCurrency } from '@/libs/frontend/utils/currency';
import { useTranslation } from '@/libs/i18n/client';

import { CopyButton } from './CopyButton';

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
  subtotal: _subtotal,
  finalTotal,
  className,
}: ResultDisplayProps) {
  const { t } = useTranslation('common');

  // Calculate converted base price
  const basePrice =
    hasDiscount && discountedPrice > 0 ? discountedPrice : originalPrice;
  const convertedBasePrice = Number(safeNstr(basePrice * exchangeRate));

  return (
    <div
      className={cn(
        className,
        'rounded-lg border bg-card p-6 text-card-foreground'
      )}
    >
      <div className="space-y-6">
        {/* ITEM COST Section */}
        <div className="space-y-3">
          <div className="text-sm font-semibold tracking-wider text-muted-foreground">
            {t('calculator.results.itemCost')}
          </div>
          <div className="space-y-3 border-b border-dashed border-muted-foreground/30 pb-3">
            {/* Original Price */}
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
              <span className="text-sm sm:text-base">
                {t('calculator.results.originalPrice')}
              </span>
              <span className="text-base font-medium">
                {formatCurrency(originalPrice, sourceCurrency)}
              </span>
            </div>

            {/* Discounted Price - show only if discount is applied */}
            {hasDiscount && discountedPrice > 0 && (
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
                <span className="text-sm sm:text-base">
                  {t('calculator.results.discountedPrice')}
                </span>
                <span className="text-base font-medium text-green-600">
                  {formatCurrency(discountedPrice, sourceCurrency)}
                </span>
              </div>
            )}

            {/* Exchange Rate - shown as info */}
            <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:gap-0">
              <span>
                {t('calculator.results.exchangeRate', {
                  sourceCurrency,
                  targetCurrency,
                })}
              </span>
              <span>{safeNstr(exchangeRate)}</span>
            </div>

            {/* Converted Base Price */}
            <div className="flex flex-col gap-1 font-medium sm:flex-row sm:justify-between sm:gap-0">
              <span className="text-sm sm:text-base">
                {t('calculator.results.convertedBasePrice')}
              </span>
              <span className="text-base">
                {formatCurrency(convertedBasePrice, targetCurrency)}
              </span>
            </div>
          </div>
        </div>

        {/* SERVICE & LOGISTICS Section */}
        <div className="space-y-3">
          <div className="text-sm font-semibold tracking-wider text-muted-foreground">
            {t('calculator.results.serviceLogistics')}
          </div>
          <div className="space-y-3 pb-3">
            {fees.map((fee) => (
              <div
                key={fee.label}
                className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0"
              >
                <span className="text-sm sm:text-base">{fee.label}</span>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-base font-medium">
                    {formatCurrency(fee.amount, targetCurrency)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {`(${fee.displayValue})`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOTAL TO PAY Section */}
        <div className="border-t-2 border-primary/20 pt-4">
          <div className="flex items-center justify-between text-xl">
            <span className="font-bold text-primary">
              {t('calculator.results.totalToPay')}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary">
                {formatCurrency(finalTotal, targetCurrency)}
              </span>
              <CopyButton
                className="h-8 px-3"
                size="sm"
                textToCopy={finalTotal.toString()}
                variant="ghost"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
