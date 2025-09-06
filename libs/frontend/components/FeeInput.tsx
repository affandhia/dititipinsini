'use client';

import { Plus, BadgePercent, Hash, X, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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
import { useTranslation } from '@/libs/i18n/client';

import type {
  CalculatorFormValues,
  FeeSchemaType,
} from '@/schemas/calculatorSchema';
import type { Control } from 'react-hook-form';

interface FeeInputProps {
  control: Control<CalculatorFormValues>;
  name: 'netFee' | 'baggageFee' | 'deliveryFee' | 'packagingFee';
  label: string;
  presets: FeeSchemaType[];
  onAddPreset: (preset: FeeSchemaType) => void;
  onRemovePreset: (index: number) => void;
}

export function FeeInput({
  control,
  name,
  label,
  presets,
  onAddPreset,
  onRemovePreset,
}: FeeInputProps) {
  const { t } = useTranslation('common');
  const { getValues, setValue } = useFormContext<CalculatorFormValues>();
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside to reset delete confirmation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDeleteConfirmIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePresetClick = (preset: FeeSchemaType, index: number) => {
    if (deleteConfirmIndex === index) {
      // Second click - delete the preset
      onRemovePreset(index);
      setDeleteConfirmIndex(null);
    } else {
      // First click - apply the preset
      setValue(`${name}.type`, preset.type);
      setValue(`${name}.value`, preset.value);
    }
  };

  const handleDeleteClick = (event: React.MouseEvent, index: number) => {
    event.stopPropagation();
    if (deleteConfirmIndex === index) {
      // Confirm deletion
      onRemovePreset(index);
      setDeleteConfirmIndex(null);
    } else {
      // Enter delete confirmation mode
      setDeleteConfirmIndex(index);
    }
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="font-medium">{label}</div>

      <FormField
        control={control}
        name={`${name}.type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('calculator.forms.labels.feeType')}</FormLabel>
            <FormControl>
              <ToggleGroup
                type="single"
                value={field.value}
                onValueChange={(value) => {
                  if (value) field.onChange(value);
                }}
              >
                <ToggleGroupItem
                  className="gap- flex basis-auto items-center"
                  value="percentage"
                >
                  <BadgePercent className="h-4 w-4" />
                  {field.value === 'percentage' &&
                    t('calculator.feeTypes.percentage')}
                </ToggleGroupItem>
                <ToggleGroupItem
                  className="flex basis-auto items-center gap-2"
                  value="fixed"
                >
                  <Hash className="h-4 w-4" />
                  {field.value === 'fixed' &&
                    t('calculator.feeTypes.fixedAmount')}
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
            <FormLabel>{t('calculator.forms.labels.value')}</FormLabel>
            <FormControl>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    min="0"
                    placeholder={t('calculator.forms.placeholders.enterAmount')}
                    step="0.01"
                    type="number"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const val = e.target.value?.trim();
                      field.onChange(
                        val === '' || val == null ? null : Number(val)
                      );
                    }}
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
                        const newPreset: FeeSchemaType = {
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
                    {presets.map((preset, index) => {
                      const isDeleteMode = deleteConfirmIndex === index;
                      const IconElement = isDeleteMode ? Trash2 : X;

                      // Check if this preset matches current form values
                      const currentType = getValues(`${name}.type`);
                      const currentValue = Number(getValues(`${name}.value`));
                      const isActive =
                        currentType === preset.type &&
                        currentValue === preset.value;

                      return (
                        <div
                          key={`${preset.type}-${preset.value}-${index}`}
                          className="group relative"
                        >
                          <Button
                            className={`pr-8 text-xs ${
                              isDeleteMode
                                ? 'border-red-300 bg-red-50 text-red-700'
                                : isActive
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : ''
                            }`}
                            size="sm"
                            type="button"
                            variant={isActive ? 'default' : 'outline'}
                            onClick={() => handlePresetClick(preset, index)}
                          >
                            {preset.type === 'percentage'
                              ? `${preset.value ?? 0}%`
                              : (preset.value ?? 0).toLocaleString()}
                          </Button>

                          {/* Delete button/icon */}
                          <button
                            className={`absolute top-1/2 right-1 -translate-y-1/2 rounded-full p-0.5 transition-all duration-200 ${
                              isDeleteMode
                                ? 'text-red-600'
                                : isActive
                                  ? 'text-blue-500'
                                  : ''
                            }`}
                            title={
                              isDeleteMode
                                ? t('calculator.forms.tooltips.confirmDelete')
                                : t('calculator.forms.tooltips.deletePreset')
                            }
                            type="button"
                            onClick={(e) => handleDeleteClick(e, index)}
                          >
                            <IconElement className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
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
