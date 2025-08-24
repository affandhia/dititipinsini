'use client';

import { Plus, X, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
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
import { useTranslation } from '@/libs/i18n/client';

interface NumericInputWithPresetsProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  presets: number[];
  onAddPreset: (value: number) => void;
  onRemovePreset: (index: number) => void;
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
  onRemovePreset,
}: NumericInputWithPresetsProps<TFieldValues, TName>) {
  const { t } = useTranslation('common');
  const { getValues } = useFormContext<TFieldValues>();
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

  const handlePresetClick = (
    preset: number,
    index: number,
    field: { onChange: (value: number) => void }
  ) => {
    if (deleteConfirmIndex === index) {
      // Second click - delete the preset
      onRemovePreset(index);
      setDeleteConfirmIndex(null);
    } else {
      // First click - apply the preset
      field.onChange(preset);
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
    <div ref={containerRef}>
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
                    placeholder={t('calculator.forms.placeholders.enterAmount')}
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
                    {presets.map((preset, index) => {
                      const isDeleteMode = deleteConfirmIndex === index;
                      const IconElement = isDeleteMode ? Trash2 : X;

                      // Check if this preset matches current form value
                      const currentValue = Number(getValues(name));
                      const isActive = currentValue === preset;

                      return (
                        <div
                          key={`${preset}-${index}`}
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
                            onClick={() =>
                              handlePresetClick(preset, index, field)
                            }
                          >
                            {preset.toLocaleString()}
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
