'use client';

import { composeEventHandlers } from '@radix-ui/primitive';
import { useComposedRefs } from '@radix-ui/react-compose-refs';
import { Primitive } from '@radix-ui/react-primitive';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';

import { Button } from '@/libs/frontend/components/core/button';
import { cn } from '@/libs/frontend/utils/index';

export type InputBaseContextProps = Pick<
  InputBaseProps,
  'autoFocus' | 'disabled'
> & {
  controlRef: React.RefObject<HTMLElement | null>;
  onFocusedChange: (focused: boolean) => void;
};

const InputBaseContext = React.createContext<InputBaseContextProps>({
  autoFocus: false,
  controlRef: { current: null },
  disabled: false,
  onFocusedChange: () => {},
});

function useInputBase() {
  const context = React.useContext(InputBaseContext);
  if (!context) {
    throw new Error('useInputBase must be used within a <InputBase />.');
  }

  return context;
}

export interface InputBaseProps
  extends React.ComponentProps<typeof Primitive.div> {
  autoFocus?: boolean;
  disabled?: boolean;
  error?: boolean;
}

function InputBase({
  autoFocus,
  disabled,
  className,
  onClick,
  error,
  ...props
}: InputBaseProps) {
  const [focused, setFocused] = React.useState(false);
  const controlRef = React.useRef<HTMLElement>(null);

  return (
    <InputBaseContext.Provider
      value={{
        autoFocus,
        controlRef,
        disabled,
        onFocusedChange: setFocused,
      }}
    >
      <Primitive.div
        data-slot="input-base"
        // Based on MUI's <InputBase /> implementation.
        // https://github.com/mui/material-ui/blob/master/packages/mui-material/src/InputBase/InputBase.js#L458~L460
        className={cn(
          'flex min-h-9 cursor-text items-center gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground md:text-sm dark:bg-input/30',
          disabled && 'pointer-events-none cursor-not-allowed opacity-50',
          focused && 'border-ring ring-[3px] ring-ring/50',
          error &&
            'border-destructive ring-destructive/20 dark:ring-destructive/40',
          className
        )}
        onClick={composeEventHandlers(onClick, (event) => {
          if (controlRef.current && event.currentTarget === event.target) {
            controlRef.current.focus();
          }
        })}
        {...props}
      />
    </InputBaseContext.Provider>
  );
}

function InputBaseFlexWrapper({
  className,
  ...props
}: React.ComponentProps<typeof Primitive.div>) {
  return (
    <Primitive.div
      className={cn('flex flex-1 flex-wrap', className)}
      data-slot="input-base-flex-wrapper"
      {...props}
    />
  );
}

function InputBaseControl({
  ref,
  onFocus,
  onBlur,
  ...props
}: React.ComponentProps<typeof Slot>) {
  const { controlRef, autoFocus, disabled, onFocusedChange } = useInputBase();

  const composedRefs = useComposedRefs(controlRef, ref);

  return (
    <Slot
      ref={composedRefs}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
      data-slot="input-base-control"
      onBlur={composeEventHandlers(onBlur, () => onFocusedChange(false))}
      onFocus={composeEventHandlers(onFocus, () => onFocusedChange(true))}
      {...{ disabled }}
      {...props}
    />
  );
}

export interface InputBaseAdornmentProps extends React.ComponentProps<'div'> {
  asChild?: boolean;
}

function InputBaseAdornment({
  className,
  asChild,
  children,
  ...props
}: InputBaseAdornmentProps) {
  const Comp = asChild ? Slot : typeof children === 'string' ? 'p' : 'div';

  return (
    <Comp
      className={cn(
        "flex items-center text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        '[&:not(:has(button))]:pointer-events-none',
        className
      )}
      data-slot="input-base-adornment"
      {...props}
    >
      {children}
    </Comp>
  );
}

function InputBaseAdornmentButton({
  type = 'button',
  variant = 'ghost',
  size = 'icon',
  disabled: disabledProp,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { disabled } = useInputBase();

  return (
    <Button
      className={cn('size-6', className)}
      data-slot="input-base-adornment-button"
      disabled={disabled || disabledProp}
      size={size}
      type={type}
      variant={variant}
      {...props}
    />
  );
}

function InputBaseInput({
  className,
  ...props
}: React.ComponentProps<typeof Primitive.input>) {
  return (
    <Primitive.input
      className={cn(
        'w-full flex-1 bg-transparent file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus:outline-none disabled:pointer-events-none',
        className
      )}
      data-slot="input-base-input"
      {...props}
    />
  );
}

function InputBaseTextarea({
  className,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-16 flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none disabled:pointer-events-none',
        className
      )}
      data-slot="input-base-textarea"
      {...props}
    />
  );
}

export {
  InputBase,
  InputBaseFlexWrapper,
  InputBaseControl,
  InputBaseAdornment,
  InputBaseAdornmentButton,
  InputBaseInput,
  InputBaseTextarea,
  useInputBase,
};
