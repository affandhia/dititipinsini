'use client';

import { Plus } from 'lucide-react';
import {
  Control,
  FieldPath,
  FieldValues,
  useFormContext,
} from 'react-hook-form';

import { Button } from '@/libs/frontend/components/core/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/libs/frontend/components/core/form';
import { Input } from '@/libs/frontend/components/core/input';

interface FeePreset {
  type: 'percentage' | 'fixed';
  value: number;
}

interface FeeInputWithPresetsProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  presets: FeePreset[];
  onAddPreset: (preset: FeePreset) => void;
}

export function FeeInputWithPresets<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  presets,
  onAddPreset,
}: FeeInputWithPresetsProps<TFieldValues, TName>) {
  const { getValues, setValue } = useFormContext<TFieldValues>();

  const handlePresetClick = (preset: FeePreset) => {
    // Set both type and value from the preset
    const baseName = name.toString().replace('.value', '');
    setValue(`${baseName}.type` as FieldPath<TFieldValues>, preset.type as any);
    setValue(
      `${baseName}.value` as FieldPath<TFieldValues>,
      preset.value as any
    );
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
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
                    const currentValue = getValues(name);
                    const numValue = Number(currentValue);
                    const baseName = name.toString().replace('.value', '');
                    const currentType = getValues(`${baseName}.type` as any) as
                      | 'percentage'
                      | 'fixed';

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
  );
}
