'use client';

import { formatCurrency } from '@/libs/frontend/utils/currency';

interface FeeCalculation {
  label: string;
  amount: number;
  displayValue: string;
}

interface ResultDisplayProps {
  originalPrice: number;
  sourceCurrency: string;
  targetCurrency: string;
  exchangeRate: number;
  fees: FeeCalculation[];
  subtotal: number;
  finalTotal: number;
}

export function ResultDisplay({
  originalPrice,
  sourceCurrency,
  targetCurrency,
  exchangeRate,
  fees,
  subtotal,
  finalTotal,
}: ResultDisplayProps) {
  return (
    <div className="rounded-lg border bg-card p-6 text-card-foreground">
      <h3 className="mb-4 text-lg font-semibold">{'Cost Breakdown'}</h3>

      <div className="space-y-3">
        {/* Original Price */}
        <div className="flex justify-between">
          <span>{'Original Price:'}</span>
          <span className="font-medium">
            {formatCurrency(originalPrice, sourceCurrency)}
          </span>
        </div>

        {/* Exchange Rate */}
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{`Exchange Rate (${sourceCurrency} → ${targetCurrency}):`}</span>
          <span>{exchangeRate.toFixed(4)}</span>
        </div>

        {/* Converted Base Price */}
        <div className="flex justify-between">
          <span>{'Converted Base Price:'}</span>
          <span className="font-medium">
            {formatCurrency(originalPrice * exchangeRate, targetCurrency)}
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
          <span className="font-semibold">{'Subtotal:'}</span>
          <span className="font-semibold">
            {formatCurrency(subtotal, targetCurrency)}
          </span>
        </div>

        {/* Final Total */}
        <div className="flex justify-between border-t pt-3 text-xl">
          <span className="font-bold">{'Final Total:'}</span>
          <span className="font-bold text-primary">
            {formatCurrency(finalTotal, targetCurrency)}
          </span>
        </div>
      </div>
    </div>
  );
}
