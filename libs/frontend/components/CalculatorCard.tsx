'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { useLocalStorage } from 'react-use';
import { type z } from 'zod';

import { validatedCalculatorConfig } from '@/config/validate';
import { Button } from '@/libs/frontend/components/core/button';
import { Checkbox } from '@/libs/frontend/components/core/checkbox';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/libs/frontend/components/core/collapsible';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerClose,
  DrawerTitle,
  DrawerFooter,
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

import {
  InputBase,
  InputBaseAdornment,
  InputBaseControl,
  InputBaseInput,
} from './core/input-base';
import { Label } from './core/label';
import { Switch } from './core/switch';
import { CurrencySelector } from './CurrencySelector';
import { ExchangeRateInput } from './ExchangeRateInput';
import { FeeInput } from './FeeInput';
import { NumericInputWithPresets } from './NumericInputWithPresets';
import { ResultDisplay } from './ResultDisplay';

type CalculatorFormValues = z.infer<typeof calculatorSchema>;

// Default state with comprehensive initial values
const defaultCalculatorValues: CalculatorFormValues = validatedCalculatorConfig;

const CALCULATOR_FORM_VALUES_KEY = 'calculator-form-state';
const DRAWER_SNAP_POINTS = [0.32, 0.8, 1]; // 50%, 70%, and 100% of screen height

export function CalculatorCard() {
  const { t } = useTranslation('common');
  const [resultView, setResultView] = useState<'drawer' | 'inline'>('drawer');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // State persistence with useLocalStorage
  const [storedCalculatorValues, storeCalculatorValues] =
    useLocalStorage<CalculatorFormValues>(
      CALCULATOR_FORM_VALUES_KEY,
      defaultCalculatorValues
    );

  // Form initialization
  const calculatorForm = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema) as Resolver<CalculatorFormValues>,
    defaultValues: storedCalculatorValues,
    mode: 'all',
  });

  // Get current form values without watching for changes
  const watchedValues = calculatorForm.watch();
  useEffect(() => {
    localStorage.setItem(
      CALCULATOR_FORM_VALUES_KEY,
      JSON.stringify(watchedValues)
    );
  }, [watchedValues]);

  // Handle discount calculations - bidirectional updates
  const { originalPrice, hasDiscount } = watchedValues;

  // Reset discount fields when discount is disabled
  useEffect(() => {
    if (!hasDiscount) {
      calculatorForm.setValue('discountPercentage', 0);
      calculatorForm.setValue('discountedPrice', 0);
    }
  }, [hasDiscount, calculatorForm.setValue]);

  // Handle discount percentage change
  const handleDiscountPercentageChange = (percentage: number) => {
    if (originalPrice > 0 && percentage >= 0 && percentage <= 100) {
      const newDiscountedPrice = originalPrice * (1 - percentage / 100);
      calculatorForm.setValue('discountedPrice', newDiscountedPrice);
    }
  };

  // Handle discounted price change
  const handleDiscountedPriceChange = (price: number) => {
    if (originalPrice > 0 && price >= 0) {
      const newDiscountPercentage =
        ((originalPrice - price) / originalPrice) * 100;
      if (newDiscountPercentage >= 0 && newDiscountPercentage <= 100) {
        calculatorForm.setValue('discountPercentage', newDiscountPercentage);
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
      calculatorForm.setValue('exchangeRate', apiRate);
    }
  }, [
    exchangeRateData,
    watchedValues.sourceCurrency,
    watchedValues.targetCurrency,
    calculatorForm,
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
        calculatorForm.setValue('exchangeRate', apiRate);
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
    const currentPresets = calculatorForm.getValues(field);

    if (field === 'originalPricePresets') {
      calculatorForm.setValue(field, [
        ...(currentPresets as number[]),
        value as number,
      ]);
    } else {
      calculatorForm.setValue(field, [
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
    const currentPresets = calculatorForm.getValues(field);

    if (field === 'originalPricePresets') {
      const updatedPresets = (currentPresets as number[]).filter(
        (_, i) => i !== index
      );
      calculatorForm.setValue(field, updatedPresets);
    } else {
      const updatedPresets = (
        currentPresets as {
          type: 'fixed' | 'percentage';
          value: number;
        }[]
      ).filter((_, i) => i !== index);
      calculatorForm.setValue(field, updatedPresets);
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
            : `${t('calculator.feeTypes.fixed')}`,
      },
      {
        label: t('calculator.fields.baggageFee'),
        amount: baggageFeeAmount,
        displayValue:
          baggageFee.type === 'percentage'
            ? `${baggageFee.value}%`
            : `${t('calculator.feeTypes.fixed')}`,
      },
      {
        label: t('calculator.fields.deliveryFee'),
        amount: deliveryFeeAmount,
        displayValue:
          deliveryFee.type === 'percentage'
            ? `${deliveryFee.value}%`
            : `${t('calculator.feeTypes.fixed')}`,
      },
      {
        label: t('calculator.fields.packagingFee'),
        amount: packagingFeeAmount,
        displayValue:
          packagingFee.type === 'percentage'
            ? `${packagingFee.value}%`
            : `${t('calculator.feeTypes.fixed')}`,
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
    storeCalculatorValues(data);
    console.warn('Form submitted and saved to localStorage');
  };

  const resetForm = () => {
    calculatorForm.reset(defaultCalculatorValues);
    storeCalculatorValues(defaultCalculatorValues);
  };

  const isDrawerView = resultView === 'drawer';
  const isInlineView = resultView === 'inline';
  return (
    <>
      {/* Main Content - ResultDisplay */}
      <div className="mx-auto max-w-4xl space-y-8 p-6 pb-96">
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <Form {...calculatorForm}>
              <form
                className="space-y-6"
                onSubmit={calculatorForm.handleSubmit(onSubmit)}
              >
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Left Column - Item & Currency */}
                  <div className="space-y-6">
                    <Collapsible className="rounded-lg border bg-card p-4 text-card-foreground">
                      <CollapsibleTrigger asChild>
                        <h3 className="flex cursor-pointer flex-row items-center justify-between text-lg font-semibold select-none">
                          {t('calculator.fields.exchangeRate')}
                          <ChevronsUpDown size="14" />
                          <span className="sr-only">{'Toggle'}</span>
                        </h3>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 pt-4">
                        <CurrencySelector
                          control={calculatorForm.control}
                          label={t('calculator.fields.sourceCurrency')}
                          listName="sourceCurrencyList"
                          name="sourceCurrency"
                        />

                        <CurrencySelector
                          control={calculatorForm.control}
                          label={t('calculator.fields.targetCurrency')}
                          listName="targetCurrencyList"
                          name="targetCurrency"
                        />

                        <ExchangeRateInput
                          control={calculatorForm.control}
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
                      </CollapsibleContent>
                    </Collapsible>
                    <div className="rounded-lg border bg-card p-4 text-card-foreground">
                      <h3 className="mb-4 text-lg font-semibold">
                        {t('calculator.sections.itemCurrency')}
                      </h3>

                      <div className="space-y-4">
                        <NumericInputWithPresets
                          control={calculatorForm.control}
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
                          control={calculatorForm.control}
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
                          <div className="flex flex-col gap-4">
                            <FormField
                              control={calculatorForm.control}
                              name="discountPercentage"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    {t('calculator.fields.discountPercentage')}
                                  </FormLabel>
                                  <FormControl>
                                    <InputBase>
                                      <InputBaseControl>
                                        <InputBaseInput
                                          {...field}
                                          max="100"
                                          min="0"
                                          placeholder={t(
                                            'calculator.forms.placeholders.discountPercentage'
                                          )}
                                          step="0.1"
                                          type="number"
                                          onChange={(e) => {
                                            field.onChange(e.target.value);
                                            handleDiscountPercentageChange(
                                              Number(e.target.value)
                                            );
                                          }}
                                        />
                                      </InputBaseControl>

                                      <InputBaseAdornment>
                                        {'%'}
                                      </InputBaseAdornment>
                                    </InputBase>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={calculatorForm.control}
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
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                        handleDiscountedPriceChange(
                                          Number(e.target.value)
                                        );
                                      }}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
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
                          control={calculatorForm.control}
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
                          control={calculatorForm.control}
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
                          control={calculatorForm.control}
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
                          control={calculatorForm.control}
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
                </div>

                <div className="flex flex-row justify-between">
                  {t('calculator.results.costBreakdown')}
                  <div className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={isDrawerView}
                        id="drawer-mode"
                        onCheckedChange={(value) =>
                          setResultView(value ? 'drawer' : 'inline')
                        }
                      />
                      <Label htmlFor="drawer-mode">
                        {t('calculator.fields.drawerMode', {
                          defaultValue: 'Drawer Mode',
                        })}
                      </Label>
                    </div>
                    {isDrawerView && !isDrawerOpen && (
                      <div className="flex justify-center space-x-2">
                        {/* implement button to set drawer open true */}
                        <Button
                          className="bg-primary"
                          onClick={() => setIsDrawerOpen(true)}
                        >
                          {t('calculator.show', { defaultValue: 'Show' })}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {isInlineView && (
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
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>

      {/* Bottom Drawer with Form */}
      <Drawer
        modal={false}
        open={isDrawerView && isDrawerOpen}
        snapPoints={DRAWER_SNAP_POINTS}
        onOpenChange={setIsDrawerOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('calculator.results.costBreakdown')}</DrawerTitle>
          </DrawerHeader>

          {isDrawerView && (
            <>
              <ResultDisplay
                className="mx-6 overflow-y-auto"
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

              <DrawerFooter className="px-6 pt-6">
                <DrawerClose asChild>
                  <Button type="button" variant="secondary">
                    {t('calculator.actions.close', { defaultValue: 'Close' })}
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
