import { z } from 'zod';

const feeSchema = z.object({
  type: z.enum(['percentage', 'fixed']),
  value: z.coerce.number().min(0, 'Value cannot be negative.').nullable(),
});

export const userConfigSchema = z.object({
  resultView: z.enum(['drawer', 'inline']).default('drawer'),
  isDrawerOpen: z.boolean().default(true),
  shouldShowPresets: z.boolean().default(true),
  locale: z.string().default('id'),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
});

export const calculatorSchema = z.object({
  originalPrice: z.coerce.number().positive('Price must be positive.'),
  hasDiscount: z.boolean().default(false),
  discountPercentage: z.coerce
    .number()
    .min(0, 'Discount percentage cannot be negative.')
    .max(100, 'Discount percentage cannot exceed 100%.'),
  discountedPrice: z.coerce
    .number()
    .min(0, 'Discounted price cannot be negative.'),
  sourceCurrency: z.string().min(3, 'Please select a currency.'),
  targetCurrency: z.string().min(3, 'Please select a currency.'),
  exchangeRate: z.coerce.number().positive('Exchange rate must be positive.'),
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

export type FeeSchemaType = z.infer<typeof feeSchema>;
export type UserConfigFormValues = z.infer<typeof userConfigSchema>;
export type CalculatorFormValues = z.infer<typeof calculatorSchema>;
