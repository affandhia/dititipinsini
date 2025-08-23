import { z } from 'zod';

const feeSchema = z.object({
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0, 'Value cannot be negative.'),
});

export const calculatorSchema = z.object({
  originalPrice: z.coerce.number().positive('Price must be positive.'),
  sourceCurrency: z.string().min(3, 'Please select a currency.'),
  targetCurrency: z.string().min(3, 'Please select a currency.'),
  sourceCurrencyList: z.array(z.string()),
  targetCurrencyList: z.array(z.string()),
  netFee: feeSchema,
  baggageFee: feeSchema,
  deliveryFee: feeSchema,
  packagingFee: feeSchema,

  // --- Custom Preset Arrays ---
  originalPricePresets: z.array(z.number()),
  netFeePresets: z.array(feeSchema),
  baggageFeePresets: z.array(feeSchema),
  deliveryFeePresets: z.array(feeSchema),
  packagingFeePresets: z.array(feeSchema),
});

export type CalculatorFormValues = z.infer<typeof calculatorSchema>;
