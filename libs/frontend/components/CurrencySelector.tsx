'use client';

import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import {
  Control,
  FieldPath,
  FieldValues,
  useFormContext,
} from 'react-hook-form';

import { Button } from '@/libs/frontend/components/core/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/libs/frontend/components/core/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/libs/frontend/components/core/dialog';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/libs/frontend/components/core/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/libs/frontend/components/core/select';
import { cn } from '@/libs/frontend/utils';
import { WORLD_CURRENCIES } from '@/libs/frontend/utils/currency';

interface CurrencySelectorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TListName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  listName: TListName;
  label: string;
}

export function CurrencySelector<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TListName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  listName,
  label,
}: CurrencySelectorProps<TFieldValues, TName, TListName>) {
  const { getValues, setValue } = useFormContext<TFieldValues>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const currencyList = (getValues(listName) as string[]) || [];

  const handleAddCurrency = (currencyCode: string) => {
    const currentList = (getValues(listName) as string[]) || [];
    if (!currentList.includes(currencyCode)) {
      setValue(listName, [
        ...currentList,
        currencyCode,
      ] as unknown as TFieldValues[TListName]);
    }
    setIsDialogOpen(false);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex gap-2">
            <FormControl className="flex-1">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {currencyList.map((currencyCode) => {
                    const currency = WORLD_CURRENCIES.find(
                      (c) => c.code === currencyCode
                    );
                    return (
                      <SelectItem key={currencyCode} value={currencyCode}>
                        {`${currencyCode} - ${currency?.name || currencyCode}`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormControl>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon" type="button" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{'Add Currency'}</DialogTitle>
                </DialogHeader>
                <Command>
                  <CommandInput placeholder="Search currencies..." />
                  <CommandList>
                    <CommandEmpty>{'No currency found.'}</CommandEmpty>
                    <CommandGroup>
                      {WORLD_CURRENCIES.filter(
                        (currency) => !currencyList.includes(currency.code)
                      ).map((currency) => (
                        <CommandItem
                          key={currency.code}
                          value={`${currency.code} ${currency.name}`}
                          onSelect={() => handleAddCurrency(currency.code)}
                        >
                          <Check className={cn('mr-2 h-4 w-4', 'opacity-0')} />
                          <div className="flex flex-col">
                            <span className="font-medium">{currency.code}</span>
                            <span className="text-sm text-muted-foreground">
                              {currency.name}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DialogContent>
            </Dialog>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
