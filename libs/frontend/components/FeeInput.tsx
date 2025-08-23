'use client';

import { Plus } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/libs/frontend/components/core/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/libs/frontend/components/core/form';
import { Input } from '@/libs/frontend/components/core/input';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/libs/frontend/components/core/toggle-group';

import type { CalculatorFormValues } from '@/schemas/calculatorSchema';
import type { Control } from 'react-hook-form';

interface FeePreset {
  type: 'percentage' | 'fixed';
  value: number;
}

interface FeeInputProps {
  control: Control<CalculatorFormValues>;
  name: 'netFee' | 'baggageFee' | 'deliveryFee' | 'packagingFee';
  label: string;
  presets: FeePreset[];
  onAddPreset: (preset: FeePreset) => void;
}

export function FeeInput({
  control,
  name,
  label,
  presets,
  onAddPreset,
}: FeeInputProps) {
  const { getValues, setValue } = useFormContext<CalculatorFormValues>();

  const handlePresetClick = (preset: FeePreset) => {
    setValue(`${name}.type`, preset.type);
    setValue(`${name}.value`, preset.value);
  };

  return (
    <div className="space-y-4">
      <div className="font-medium">{label}</div>

      <FormField
        control={control}
        name={`${name}.type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{'Fee Type'}</FormLabel>
            <FormControl>
              <ToggleGroup
                type="single"
                value={field.value}
                onValueChange={(value) => {
                  if (value) field.onChange(value);
                }}
              >
                <ToggleGroupItem value="percentage">
                  {'Percentage'}
                </ToggleGroupItem>
                <ToggleGroupItem value="fixed">
                  {'Fixed Amount'}
                </ToggleGroupItem>
              </ToggleGroup>
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`${name}.value`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{'Value'}</FormLabel>
            <FormControl>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    min="0"
                    placeholder="Enter amount"
                    step="0.01"
                    type="number"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                  <Button
                    size="icon"
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const currentValue = getValues(`${name}.value`);
                      const currentType = getValues(`${name}.type`);
                      const numValue = Number(currentValue);

                      if (!isNaN(numValue) && numValue > 0) {
                        const newPreset: FeePreset = {
                          type: currentType,
                          value: numValue,
                        };
                        const exists = presets.some(
                          (p) =>
                            p.type === newPreset.type &&
                            p.value === newPreset.value
                        );
                        if (!exists) {
                          onAddPreset(newPreset);
                        }
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {presets.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset, index) => (
                      <Button
                        key={`${preset.type}-${preset.value}-${index}`}
                        className="text-xs"
                        size="sm"
                        type="button"
                        variant="secondary"
                        onClick={() => handlePresetClick(preset)}
                      >
                        {preset.type === 'percentage'
                          ? `${preset.value}%`
                          : preset.value.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
