'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { useLocalStorage } from 'react-use';
import { type z } from 'zod';

import { validatedConfig } from '@/config/validate';
import { Button } from '@/libs/frontend/components/core/button';
import { Form } from '@/libs/frontend/components/core/form';
import { useCurrencyApi } from '@/libs/frontend/hooks/useCurrencyApi';
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
export function CalculatorCard() {
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

  const { watch, control, handleSubmit } = form;

  // Get current form values without watching for changes
  const watchedValues = watch();
  useEffect(() => {
    localStorage.setItem(FORM_VALUES_KEY, JSON.stringify(watchedValues));
  }, [watchedValues]);

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
    const { originalPrice, netFee, baggageFee, deliveryFee, packagingFee } =
      watchedValues;

    if (!originalPrice || originalPrice <= 0) {
      return {
        subtotal: 0,
        finalTotal: 0,
        fees: [],
      };
    }

    const convertedBasePrice = originalPrice * exchangeRate;

    // Calculate each fee
    const netFeeAmount =
      netFee.type === 'percentage'
        ? (convertedBasePrice * netFee.value) / 100
        : netFee.value * exchangeRate;

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
        label: 'Net Fee',
        amount: netFeeAmount,
        displayValue:
          netFee.type === 'percentage'
            ? `${netFee.value}%`
            : `Fixed ${netFee.value}`,
      },
      {
        label: 'Baggage Fee',
        amount: baggageFeeAmount,
        displayValue:
          baggageFee.type === 'percentage'
            ? `${baggageFee.value}%`
            : `Fixed ${baggageFee.value}`,
      },
      {
        label: 'Delivery Fee',
        amount: deliveryFeeAmount,
        displayValue:
          deliveryFee.type === 'percentage'
            ? `${deliveryFee.value}%`
            : `Fixed ${deliveryFee.value}`,
      },
      {
        label: 'Packaging Fee',
        amount: packagingFeeAmount,
        displayValue:
          packagingFee.type === 'percentage'
            ? `${packagingFee.value}%`
            : `Fixed ${packagingFee.value}`,
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
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          {'Advanced Cross-Border Calculator'}
        </h1>
        <p className="text-muted-foreground">
          {
            'Professional personal shopper cost calculator with multi-currency support'
          }
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Input Form */}
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6 text-card-foreground">
                <h2 className="mb-4 text-xl font-semibold">
                  {'Item & Currency'}
                </h2>

                <div className="space-y-4">
                  <NumericInputWithPresets
                    control={control}
                    label="Original Price"
                    name="originalPrice"
                    presets={watchedValues.originalPricePresets}
                    onAddPreset={(value) =>
                      handleAddPreset('originalPricePresets', value)
                    }
                    onRemovePreset={(index) =>
                      handleRemovePreset('originalPricePresets', index)
                    }
                  />

                  <CurrencySelector
                    control={control}
                    label="Source Currency"
                    listName="sourceCurrencyList"
                    name="sourceCurrency"
                  />

                  <CurrencySelector
                    control={control}
                    label="Target Currency"
                    listName="targetCurrencyList"
                    name="targetCurrency"
                  />

                  <ExchangeRateInput
                    control={control}
                    isLoading={isLoadingRates}
                    label="Exchange Rate"
                    name="exchangeRate"
                    sourceCurrency={watchedValues.sourceCurrency}
                    targetCurrency={watchedValues.targetCurrency}
                    onRefresh={handleRefreshExchangeRate}
                  />

                  {isLoadingRates && (
                    <div className="text-sm text-muted-foreground">
                      {'Loading exchange rates...'}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6 text-card-foreground">
                <h2 className="mb-4 text-xl font-semibold">
                  {'Fees & Charges'}
                </h2>

                <div className="space-y-6">
                  <FeeInput
                    control={control}
                    label="Net Fee"
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
                    label="Baggage Fee"
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
                    label="Delivery Fee"
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
                    label="Packaging Fee"
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

              <div className="flex gap-4">
                <Button className="flex-1" type="submit">
                  {'Calculate Total'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {'Reset'}
                </Button>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              <ResultDisplay
                exchangeRate={exchangeRate}
                fees={fees}
                finalTotal={finalTotal}
                originalPrice={watchedValues.originalPrice}
                sourceCurrency={watchedValues.sourceCurrency}
                subtotal={subtotal}
                targetCurrency={watchedValues.targetCurrency}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
