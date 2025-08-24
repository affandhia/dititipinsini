'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { useLocalStorage } from 'react-use';
import { type z } from 'zod';

import { validatedConfig } from '@/config/validate';
import { Button } from '@/libs/frontend/components/core/button';
import { Checkbox } from '@/libs/frontend/components/core/checkbox';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerClose,
} from '@/libs/frontend/components/core/drawer';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from '@/libs/frontend/components/core/form';
import { Input } from '@/libs/frontend/components/core/input';
import { useCurrencyApi } from '@/libs/frontend/hooks/useCurrencyApi';
import { useTranslation } from '@/libs/i18n/client';
import { calculatorSchema } from '@/schemas/calculatorSchema';

import { CurrencySelector } from './CurrencySelector';
import { ExchangeRateInput } from './ExchangeRateInput';
import { FeeInput } from './FeeInput';
import { NumericInputWithPresets } from './NumericInputWithPresets';
import { ResultDisplay } from './ResultDisplay';

type CalculatorFormValues = z.infer<typeof calculatorSchema>;

// Default state with comprehensive initial values
const defaultFormValues: CalculatorFormValues = validatedConfig;

const FORM_VALUES_KEY = 'calculator-form-state';
const DRAWER_SNAP_POINTS = [0.5, 0.8, 1]; // 50%, 70%, and 100% of screen height
const DRAWER_FADE_FROM_INDEX = 2; // Start fading overlay from the second snap point (50%)

export function CalculatorCard() {
  const { t } = useTranslation('common');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Snap points configuration for Google Maps-like behavior
  const [activeSnapPoint, setActiveSnapPoint] = useState(DRAWER_SNAP_POINTS[0]); // Start at 50%

  // Handle snap point changes with proper typing
  const handleSnapPointChange = (snapPoint: string | number | null) => {
    if (typeof snapPoint === 'number') {
      setActiveSnapPoint(snapPoint);
    }
  };

  // State persistence with useLocalStorage
  const [formValues, setFormValues] = useLocalStorage<CalculatorFormValues>(
    FORM_VALUES_KEY,
    defaultFormValues
  );

  // Form initialization
  const form = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema) as Resolver<CalculatorFormValues>,
    defaultValues: formValues,
    mode: 'all',
  });

  const { watch, control, handleSubmit, setValue } = form;

  // Get current form values without watching for changes
  const watchedValues = watch();
  useEffect(() => {
    localStorage.setItem(FORM_VALUES_KEY, JSON.stringify(watchedValues));
  }, [watchedValues]);

  // Handle discount calculations - bidirectional updates
  const { originalPrice, hasDiscount } = watchedValues;

  // Reset discount fields when discount is disabled
  useEffect(() => {
    if (!hasDiscount) {
      setValue('discountPercentage', 0);
      setValue('discountedPrice', 0);
    }
  }, [hasDiscount, setValue]);

  // Handle discount percentage change
  const handleDiscountPercentageChange = (percentage: number) => {
    setValue('discountPercentage', percentage);
    if (originalPrice > 0 && percentage >= 0 && percentage <= 100) {
      const newDiscountedPrice = originalPrice * (1 - percentage / 100);
      setValue('discountedPrice', newDiscountedPrice);
    }
  };

  // Handle discounted price change
  const handleDiscountedPriceChange = (price: number) => {
    setValue('discountedPrice', price);
    if (originalPrice > 0 && price >= 0) {
      const newDiscountPercentage =
        ((originalPrice - price) / originalPrice) * 100;
      if (newDiscountPercentage >= 0 && newDiscountPercentage <= 100) {
        setValue('discountPercentage', newDiscountPercentage);
      }
    }
  };

  // Currency API for exchange rates
  const {
    data: exchangeRateData,
    isLoading: isLoadingRates,
    refetch: refetchExchangeRate,
  } = useCurrencyApi(watchedValues.sourceCurrency);

  // Auto-update exchange rate when API data changes
  useEffect(() => {
    if (
      exchangeRateData &&
      watchedValues.sourceCurrency &&
      watchedValues.targetCurrency
    ) {
      const apiRate =
        exchangeRateData[watchedValues.sourceCurrency.toLowerCase()]?.[
          watchedValues.targetCurrency.toLowerCase()
        ];
      form.setValue('exchangeRate', apiRate);
    }
  }, [
    exchangeRateData,
    watchedValues.sourceCurrency,
    watchedValues.targetCurrency,
    form,
  ]);

  // Function to refresh exchange rate from API
  const handleRefreshExchangeRate = async () => {
    const result = await refetchExchangeRate();
    if (result.data) {
      const apiRate =
        result.data[watchedValues.sourceCurrency.toLowerCase()]?.[
          watchedValues.targetCurrency.toLowerCase()
        ];
      if (apiRate) {
        form.setValue('exchangeRate', apiRate);
      }
    }
  };

  // Use form exchange rate, fallback to API rate if form rate is not set
  const exchangeRate =
    watchedValues.exchangeRate ||
    exchangeRateData?.[watchedValues.sourceCurrency.toLowerCase()]?.[
      watchedValues.targetCurrency.toLowerCase()
    ] ||
    1;

  // Preset management function
  const handleAddPreset = (
    field:
      | 'originalPricePresets'
      | 'netFeePresets'
      | 'baggageFeePresets'
      | 'deliveryFeePresets'
      | 'packagingFeePresets',
    value: number | { type: 'fixed' | 'percentage'; value: number }
  ) => {
    const currentPresets = form.getValues(field);

    if (field === 'originalPricePresets') {
      form.setValue(field, [...(currentPresets as number[]), value as number]);
    } else {
      form.setValue(field, [
        ...(currentPresets as {
          type: 'fixed' | 'percentage';
          value: number;
        }[]),
        value as { type: 'fixed' | 'percentage'; value: number },
      ]);
    }
  };

  // Preset removal function
  const handleRemovePreset = (
    field:
      | 'originalPricePresets'
      | 'netFeePresets'
      | 'baggageFeePresets'
      | 'deliveryFeePresets'
      | 'packagingFeePresets',
    index: number
  ) => {
    const currentPresets = form.getValues(field);

    if (field === 'originalPricePresets') {
      const updatedPresets = (currentPresets as number[]).filter(
        (_, i) => i !== index
      );
      form.setValue(field, updatedPresets);
    } else {
      const updatedPresets = (
        currentPresets as {
          type: 'fixed' | 'percentage';
          value: number;
        }[]
      ).filter((_, i) => i !== index);
      form.setValue(field, updatedPresets);
    }
  };

  // Calculation logic
  const calculateTotal = () => {
    const {
      originalPrice,
      hasDiscount,
      discountedPrice,
      netFee,
      baggageFee,
      deliveryFee,
      packagingFee,
    } = watchedValues;

    if (!originalPrice || originalPrice <= 0) {
      return {
        subtotal: 0,
        finalTotal: 0,
        fees: [],
      };
    }

    // Use discounted price if discount is applied, otherwise use original price
    const basePrice =
      hasDiscount && discountedPrice > 0 ? discountedPrice : originalPrice;
    const convertedBasePrice = basePrice * exchangeRate;

    // Calculate each fee
    const netFeeAmount =
      netFee.type === 'percentage'
        ? (convertedBasePrice * netFee.value) / 100
        : netFee.value;

    const baggageFeeAmount =
      baggageFee.type === 'percentage'
        ? (convertedBasePrice * baggageFee.value) / 100
        : baggageFee.value;

    const deliveryFeeAmount =
      deliveryFee.type === 'percentage'
        ? (convertedBasePrice * deliveryFee.value) / 100
        : deliveryFee.value;

    const packagingFeeAmount =
      packagingFee.type === 'percentage'
        ? (convertedBasePrice * packagingFee.value) / 100
        : packagingFee.value;

    const fees = [
      {
        label: t('calculator.fields.netFee'),
        amount: netFeeAmount,
        displayValue:
          netFee.type === 'percentage'
            ? `${netFee.value}%`
            : `${t('calculator.feeTypes.fixed')} ${netFee.value}`,
      },
      {
        label: t('calculator.fields.baggageFee'),
        amount: baggageFeeAmount,
        displayValue:
          baggageFee.type === 'percentage'
            ? `${baggageFee.value}%`
            : `${t('calculator.feeTypes.fixed')} ${baggageFee.value}`,
      },
      {
        label: t('calculator.fields.deliveryFee'),
        amount: deliveryFeeAmount,
        displayValue:
          deliveryFee.type === 'percentage'
            ? `${deliveryFee.value}%`
            : `${t('calculator.feeTypes.fixed')} ${deliveryFee.value}`,
      },
      {
        label: t('calculator.fields.packagingFee'),
        amount: packagingFeeAmount,
        displayValue:
          packagingFee.type === 'percentage'
            ? `${packagingFee.value}%`
            : `${t('calculator.feeTypes.fixed')} ${packagingFee.value}`,
      },
    ];

    const totalFees =
      netFeeAmount + baggageFeeAmount + deliveryFeeAmount + packagingFeeAmount;
    const subtotal = convertedBasePrice + totalFees;
    const finalTotal = subtotal;

    return {
      subtotal,
      finalTotal,
      fees,
    };
  };

  const { subtotal, finalTotal, fees } = calculateTotal();

  const onSubmit = (data: CalculatorFormValues) => {
    // Save form values to localStorage on submit
    setFormValues(data);
    console.warn('Form submitted and saved to localStorage');
  };

  const resetForm = () => {
    form.reset(defaultFormValues);
    setFormValues(defaultFormValues);
  };

  return (
    <>
      {/* Main Content - ResultDisplay */}
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{t('calculator.title')}</h1>
          <p className="text-muted-foreground">{t('calculator.description')}</p>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <ResultDisplay
              discountedPrice={watchedValues.discountedPrice}
              exchangeRate={exchangeRate}
              fees={fees}
              finalTotal={finalTotal}
              hasDiscount={watchedValues.hasDiscount}
              originalPrice={watchedValues.originalPrice}
              sourceCurrency={watchedValues.sourceCurrency}
              subtotal={subtotal}
              targetCurrency={watchedValues.targetCurrency}
            />
          </div>
        </div>

        {/* Snap point indicators */}
        <div className="mb-20 flex justify-center space-x-2">
          {DRAWER_SNAP_POINTS.map((point) => (
            <button
              key={point}
              className={`h-3 w-3 rounded-full transition-colors ${
                activeSnapPoint === point
                  ? 'bg-primary'
                  : 'bg-muted-foreground/30'
              }`}
              onClick={() => {
                setIsDrawerOpen(true);
                handleSnapPointChange(point);
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Drawer with Form */}
      <Drawer
        activeSnapPoint={activeSnapPoint}
        fadeFromIndex={DRAWER_FADE_FROM_INDEX}
        modal={false}
        open={isDrawerOpen}
        setActiveSnapPoint={handleSnapPointChange}
        snapPoints={DRAWER_SNAP_POINTS}
        onOpenChange={setIsDrawerOpen}
      >
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader></DrawerHeader>

          <div className="overflow-y-auto px-4 pb-4">
            <Form {...form}>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Left Column - Item & Currency */}
                  <div className="space-y-6">
                    <div className="rounded-lg border bg-card p-4 text-card-foreground">
                      <h3 className="mb-4 text-lg font-semibold">
                        {t('calculator.sections.itemCurrency')}
                      </h3>

                      <div className="space-y-4">
                        <NumericInputWithPresets
                          control={control}
                          label={t('calculator.fields.originalPrice')}
                          name="originalPrice"
                          presets={watchedValues.originalPricePresets}
                          onAddPreset={(value) =>
                            handleAddPreset('originalPricePresets', value)
                          }
                          onRemovePreset={(index) =>
                            handleRemovePreset('originalPricePresets', index)
                          }
                        />

                        {/* Discount Section */}
                        <FormField
                          control={control}
                          name="hasDiscount"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-y-0 space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {t('calculator.fields.hasDiscount')}
                              </FormLabel>
                            </FormItem>
                          )}
                        />

                        {hasDiscount && (
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={control}
                              name="discountPercentage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {t('calculator.fields.discountPercentage')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      max="100"
                                      min="0"
                                      placeholder={t(
                                        'calculator.forms.placeholders.discountPercentage'
                                      )}
                                      step="0.1"
                                      type="number"
                                      onChange={(e) =>
                                        handleDiscountPercentageChange(
                                          Number(e.target.value)
                                        )
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={control}
                              name="discountedPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {t('calculator.fields.discountedPrice')}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      min="0"
                                      placeholder={t(
                                        'calculator.forms.placeholders.discountedPrice'
                                      )}
                                      step="0.01"
                                      type="number"
                                      onChange={(e) =>
                                        handleDiscountedPriceChange(
                                          Number(e.target.value)
                                        )
                                      }
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        )}

                        <CurrencySelector
                          control={control}
                          label={t('calculator.fields.sourceCurrency')}
                          listName="sourceCurrencyList"
                          name="sourceCurrency"
                        />

                        <CurrencySelector
                          control={control}
                          label={t('calculator.fields.targetCurrency')}
                          listName="targetCurrencyList"
                          name="targetCurrency"
                        />

                        <ExchangeRateInput
                          control={control}
                          isLoading={isLoadingRates}
                          label={t('calculator.fields.exchangeRate')}
                          name="exchangeRate"
                          sourceCurrency={watchedValues.sourceCurrency}
                          targetCurrency={watchedValues.targetCurrency}
                          onRefresh={handleRefreshExchangeRate}
                        />

                        {isLoadingRates && (
                          <div className="text-sm text-muted-foreground">
                            {t('calculator.status.loadingExchangeRates')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Fees */}
                  <div className="space-y-6">
                    <div className="rounded-lg border bg-card p-4 text-card-foreground">
                      <h3 className="mb-4 text-lg font-semibold">
                        {t('calculator.sections.feesCharges')}
                      </h3>

                      <div className="space-y-6">
                        <FeeInput
                          control={control}
                          label={t('calculator.fields.netFee')}
                          name="netFee"
                          presets={watchedValues.netFeePresets}
                          onAddPreset={(value) =>
                            handleAddPreset('netFeePresets', value)
                          }
                          onRemovePreset={(index) =>
                            handleRemovePreset('netFeePresets', index)
                          }
                        />

                        <FeeInput
                          control={control}
                          label={t('calculator.fields.baggageFee')}
                          name="baggageFee"
                          presets={watchedValues.baggageFeePresets}
                          onAddPreset={(value) =>
                            handleAddPreset('baggageFeePresets', value)
                          }
                          onRemovePreset={(index) =>
                            handleRemovePreset('baggageFeePresets', index)
                          }
                        />

                        <FeeInput
                          control={control}
                          label={t('calculator.fields.deliveryFee')}
                          name="deliveryFee"
                          presets={watchedValues.deliveryFeePresets}
                          onAddPreset={(value) =>
                            handleAddPreset('deliveryFeePresets', value)
                          }
                          onRemovePreset={(index) =>
                            handleRemovePreset('deliveryFeePresets', index)
                          }
                        />

                        <FeeInput
                          control={control}
                          label={t('calculator.fields.packagingFee')}
                          name="packagingFee"
                          presets={watchedValues.packagingFeePresets}
                          onAddPreset={(value) =>
                            handleAddPreset('packagingFeePresets', value)
                          }
                          onRemovePreset={(index) =>
                            handleRemovePreset('packagingFeePresets', index)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button className="flex-1" type="submit">
                    {t('calculator.actions.calculateTotal')}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    {t('calculator.actions.reset')}
                  </Button>
                  <DrawerClose asChild>
                    <Button type="button" variant="secondary">
                      {t('calculator.actions.close', { defaultValue: 'Close' })}
                    </Button>
                  </DrawerClose>
                </div>
              </form>
            </Form>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
