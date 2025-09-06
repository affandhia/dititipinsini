'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronsUpDown } from 'lucide-react';
import nstr from 'nstr';
import { useEffect } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { useLocalStorage } from 'react-use';

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
import { safeNstr } from '@/libs/frontend/utils';
import { useTranslation } from '@/libs/i18n/client';
import {
  CalculatorFormValues,
  calculatorSchema,
} from '@/schemas/calculatorSchema';

import {
  InputBase,
  InputBaseAdornment,
  InputBaseControl,
  InputBaseInput,
} from './core/input-base';
import { Label } from './core/label';
import { Separator } from './core/separator';
import { Switch } from './core/switch';
import { CurrencySelector } from './CurrencySelector';
import { ExchangeRateInput } from './ExchangeRateInput';
import { FeeInput } from './FeeInput';
import { NumericInputWithPresets } from './NumericInputWithPresets';
import { ResultDisplay } from './ResultDisplay';
import { useConfig } from './UserConfigProvider';

// Default state with comprehensive initial values
const defaultCalculatorValues: CalculatorFormValues = validatedCalculatorConfig;

const CALCULATOR_FORM_VALUES_KEY = 'calculator-form-state';
const DRAWER_SNAP_POINTS = [0.32, 0.8, 1]; // 50%, 70%, and 100% of screen height

export function CalculatorCard() {
  const { t } = useTranslation('common');

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
  const watchedCalculatorValues = calculatorForm.watch();
  useEffect(() => {
    localStorage.setItem(
      CALCULATOR_FORM_VALUES_KEY,
      JSON.stringify(watchedCalculatorValues)
    );
  }, [watchedCalculatorValues]);

  // Handle discount calculations - bidirectional updates
  const { originalPrice, hasDiscount } = watchedCalculatorValues;

  // Reset discount fields when discount is disabled
  useEffect(() => {
    if (!hasDiscount) {
      calculatorForm.setValue('discountPercentage', 0);
      calculatorForm.setValue('discountedPrice', 0);
    }
  }, [hasDiscount, calculatorForm]);

  // Handle discount percentage change
  const handleDiscountPercentageChange = (percentage: number) => {
    if (originalPrice > 0 && percentage >= 0 && percentage <= 100) {
      const newDiscountedPrice = originalPrice * (1 - percentage / 100);
      calculatorForm.setValue(
        'discountedPrice',
        Number(nstr(newDiscountedPrice))
      );
    }
  };

  // Handle discounted price change
  const handleDiscountedPriceChange = (price: number) => {
    if (originalPrice > 0 && price >= 0) {
      const newDiscountPercentage =
        ((originalPrice - price) / originalPrice) * 100;
      if (newDiscountPercentage >= 0 && newDiscountPercentage <= 100) {
        calculatorForm.setValue(
          'discountPercentage',
          Number(nstr(newDiscountPercentage))
        );
      }
    }
  };

  // Currency API for exchange rates
  const {
    data: exchangeRateData,
    isLoading: isLoadingRates,
    refetch: refetchExchangeRate,
  } = useCurrencyApi(watchedCalculatorValues.sourceCurrency);

  // Auto-update exchange rate when API data changes
  useEffect(() => {
    if (
      exchangeRateData &&
      watchedCalculatorValues.sourceCurrency &&
      watchedCalculatorValues.targetCurrency
    ) {
      const apiRate =
        exchangeRateData[
          watchedCalculatorValues.sourceCurrency.toLowerCase()
        ]?.[watchedCalculatorValues.targetCurrency.toLowerCase()];
      calculatorForm.setValue('exchangeRate', Number(safeNstr(apiRate, 1)));
    }
  }, [
    exchangeRateData,
    watchedCalculatorValues.sourceCurrency,
    watchedCalculatorValues.targetCurrency,
    calculatorForm,
  ]);

  // Function to refresh exchange rate from API
  const handleRefreshExchangeRate = async () => {
    const result = await refetchExchangeRate();
    if (result.data) {
      const apiRate =
        result.data[watchedCalculatorValues.sourceCurrency.toLowerCase()]?.[
          watchedCalculatorValues.targetCurrency.toLowerCase()
        ];
      if (apiRate) {
        calculatorForm.setValue('exchangeRate', Number(safeNstr(apiRate, 1)));
      }
    }
  };

  // Use form exchange rate, fallback to API rate if form rate is not set
  const exchangeRate =
    watchedCalculatorValues.exchangeRate ||
    exchangeRateData?.[watchedCalculatorValues.sourceCurrency.toLowerCase()]?.[
      watchedCalculatorValues.targetCurrency.toLowerCase()
    ] ||
    1;

  // Preset management for originalPrice only
  const handleAddOriginalPricePreset = (value: number) => {
    const currentPresets = calculatorForm.getValues('originalPricePresets');
    if (typeof value === 'number') {
      calculatorForm.setValue('originalPricePresets', [
        ...(currentPresets as number[]),
        value,
      ]);
    }
  };

  const handleRemoveOriginalPricePreset = (index: number) => {
    const currentPresets = calculatorForm.getValues('originalPricePresets');
    const updatedPresets = (currentPresets as number[]).filter(
      (_, i) => i !== index
    );
    calculatorForm.setValue('originalPricePresets', updatedPresets);
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
      withNetFee,
      withBaggageFee,
      withDeliveryFee,
      withPackagingFee,
    } = watchedCalculatorValues;

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
    const convertedBasePrice = Number(nstr(basePrice * exchangeRate));

    // Define fee configurations for extensibility
    const feeConfigs = [
      {
        enabled: withNetFee,
        fee: netFee,
        label: t('calculator.fields.netFee'),
        key: 'netFee',
      },
      {
        enabled: withBaggageFee,
        fee: baggageFee,
        label: t('calculator.fields.baggageFee'),
        key: 'baggageFee',
      },
      {
        enabled: withDeliveryFee,
        fee: deliveryFee,
        label: t('calculator.fields.deliveryFee'),
        key: 'deliveryFee',
      },
      {
        enabled: withPackagingFee,
        fee: packagingFee,
        label: t('calculator.fields.packagingFee'),
        key: 'packagingFee',
      },
    ];

    // Calculate fees only if enabled
    const calculatedFees = feeConfigs
      .filter((config) => config.enabled)
      .map((config) => {
        const amount = Number(
          nstr(
            config.fee.type === 'percentage'
              ? (convertedBasePrice * (config.fee.value ?? 0)) / 100
              : (config.fee.value ?? 0)
          )
        );

        return {
          label: config.label,
          amount,
          displayValue:
            config.fee.type === 'percentage'
              ? `${nstr(config.fee.value ?? 0)}%`
              : `${t('calculator.feeTypes.fixed')}`,
        };
      });

    const totalFees = Number(
      nstr(calculatedFees.reduce((sum, fee) => sum + fee.amount, 0))
    );
    const subtotal = Number(nstr(convertedBasePrice + totalFees));
    const finalTotal = Number(nstr(subtotal));

    return {
      subtotal,
      finalTotal,
      fees: calculatedFees,
    };
  };

  const { subtotal, finalTotal, fees } = calculateTotal();

  // Check if any fees are enabled
  const anyFeesEnabled =
    watchedCalculatorValues.withNetFee ||
    watchedCalculatorValues.withBaggageFee ||
    watchedCalculatorValues.withDeliveryFee ||
    watchedCalculatorValues.withPackagingFee;

  // Function to apply all fees
  const handleApplyAllFees = () => {
    calculatorForm.setValue('withNetFee', true);
    calculatorForm.setValue('withBaggageFee', true);
    calculatorForm.setValue('withDeliveryFee', true);
    calculatorForm.setValue('withPackagingFee', true);
  };

  // Function to clear all fees
  const handleClearAllFees = () => {
    calculatorForm.setValue('withNetFee', false);
    calculatorForm.setValue('withBaggageFee', false);
    calculatorForm.setValue('withDeliveryFee', false);
    calculatorForm.setValue('withPackagingFee', false);
  };

  const onSubmit = (data: CalculatorFormValues) => {
    // Save form values to localStorage on submit
    storeCalculatorValues(data);
    console.warn('Form submitted and saved to localStorage');
  };

  const resetForm = () => {
    calculatorForm.reset(defaultCalculatorValues);
    storeCalculatorValues(defaultCalculatorValues);
  };

  // =========================
  // ===== USER CONFIG =======
  // =========================

  const {
    shouldShowPresets,
    isDrawerView,
    isInlineView,
    isDrawerOpen,
    setResultViewMode,
    setDrawerOpen,
  } = useConfig();

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
                          sourceCurrency={
                            watchedCalculatorValues.sourceCurrency
                          }
                          targetCurrency={
                            watchedCalculatorValues.targetCurrency
                          }
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
                          presets={
                            shouldShowPresets
                              ? watchedCalculatorValues.originalPricePresets
                              : []
                          }
                          onAddPreset={handleAddOriginalPricePreset}
                          onRemovePreset={handleRemoveOriginalPricePreset}
                        />

                        {/* Discount Section */}
                        <FormField
                          control={calculatorForm.control}
                          name="hasDiscount"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center">
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
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {t('calculator.sections.feesCharges')}
                        </h3>
                        <Button
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={
                            anyFeesEnabled
                              ? handleClearAllFees
                              : handleApplyAllFees
                          }
                        >
                          {anyFeesEnabled
                            ? t('calculator.actions.clear', {
                                defaultValue: 'Clear',
                              })
                            : t('calculator.actions.apply', {
                                defaultValue: 'Apply',
                              })}
                        </Button>
                      </div>

                      <div className="space-y-6">
                        <FeeInput
                          control={calculatorForm.control}
                          label={t('calculator.fields.netFee')}
                          name="netFee"
                        />

                        <Separator />

                        <FeeInput
                          control={calculatorForm.control}
                          label={t('calculator.fields.baggageFee')}
                          name="baggageFee"
                        />

                        <Separator />

                        <FeeInput
                          control={calculatorForm.control}
                          label={t('calculator.fields.deliveryFee')}
                          name="deliveryFee"
                        />

                        <Separator />

                        <FeeInput
                          control={calculatorForm.control}
                          label={t('calculator.fields.packagingFee')}
                          name="packagingFee"
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

                <div className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {t('calculator.results.costBreakdown')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={isDrawerView}
                        id="drawer-mode"
                        onCheckedChange={setResultViewMode}
                      />
                      <Label htmlFor="drawer-mode">
                        {t('calculator.fields.drawerMode', {
                          defaultValue: 'Drawer Mode',
                        })}
                      </Label>
                    </div>
                    {isDrawerView && !isDrawerOpen && (
                      <div className="flex justify-center space-x-2">
                        <Button
                          className="bg-primary"
                          size="sm"
                          onClick={() => setDrawerOpen(true)}
                        >
                          {t('calculator.show', { defaultValue: 'Show' })}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {isInlineView && (
                  <ResultDisplay
                    discountedPrice={watchedCalculatorValues.discountedPrice}
                    exchangeRate={exchangeRate}
                    fees={fees}
                    finalTotal={finalTotal}
                    hasDiscount={watchedCalculatorValues.hasDiscount}
                    originalPrice={watchedCalculatorValues.originalPrice}
                    sourceCurrency={watchedCalculatorValues.sourceCurrency}
                    subtotal={subtotal}
                    targetCurrency={watchedCalculatorValues.targetCurrency}
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
        onOpenChange={setDrawerOpen}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('calculator.results.costBreakdown')}</DrawerTitle>
          </DrawerHeader>

          {isDrawerView && (
            <>
              <ResultDisplay
                className="mx-6 overflow-y-auto"
                discountedPrice={watchedCalculatorValues.discountedPrice}
                exchangeRate={exchangeRate}
                fees={fees}
                finalTotal={finalTotal}
                hasDiscount={watchedCalculatorValues.hasDiscount}
                originalPrice={watchedCalculatorValues.originalPrice}
                sourceCurrency={watchedCalculatorValues.sourceCurrency}
                subtotal={subtotal}
                targetCurrency={watchedCalculatorValues.targetCurrency}
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
