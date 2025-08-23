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

interface NumericInputWithPresetsProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  presets: number[];
  onAddPreset: (value: number) => void;
}

export function NumericInputWithPresets<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  presets,
  onAddPreset,
}: NumericInputWithPresetsProps<TFieldValues, TName>) {
  const { getValues } = useFormContext<TFieldValues>();

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
                    if (
                      !isNaN(numValue) &&
                      numValue > 0 &&
                      !presets.includes(numValue)
                    ) {
                      onAddPreset(numValue);
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {presets.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset}
                      className="text-xs"
                      size="sm"
                      type="button"
                      variant="secondary"
                      onClick={() => field.onChange(preset)}
                    >
                      {preset.toLocaleString()}
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
