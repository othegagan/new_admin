'use client';

import { CaretDownIcon, CaretUpIcon } from '@radix-ui/react-icons';
import {
    type ButtonProps as AriaButtonProps,
    Input as AriaInput,
    type InputProps as AriaInputProps,
    NumberField as AriaNumberField,
    type NumberFieldProps as AriaNumberFieldProps,
    type ValidationResult as AriaValidationResult,
    Text,
    composeRenderProps
} from 'react-aria-components';

import { cn } from '@/lib/utils';

import { FieldError, FieldGroup, Label } from '@/components/ui/extension/field';
import { Button } from './button';

const NumberField = AriaNumberField;

function NumberFieldInput({ className, ...props }: AriaInputProps) {
    return (
        <AriaInput
            className={composeRenderProps(className, (className) =>
                cn(
                    'w-fit min-w-0 flex-1 border-transparent border-r bg-background pr-2 outline outline-0 placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden',
                    className
                )
            )}
            {...props}
        />
    );
}

function NumberFieldSteppers({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div className={cn('absolute right-0 flex h-full flex-col border-l', className)} {...props}>
            <NumberFieldStepper slot='increment' type='button'>
                <CaretUpIcon aria-hidden className='size-4' />
            </NumberFieldStepper>
            <div className='border-b' />
            <NumberFieldStepper slot='decrement' type='button'>
                <CaretDownIcon aria-hidden className='size-4' />
            </NumberFieldStepper>
        </div>
    );
}

function NumberFieldStepper({ className, ...props }: AriaButtonProps) {
    return (
        <Button
            className={composeRenderProps(className, (className) => cn('w-auto grow rounded-none px-0.5 text-muted-foreground', className))}
            variant={'ghost'}
            size={'icon'}
            {...props}
        />
    );
}

interface NumberFieldProps extends AriaNumberFieldProps {
    label?: string;
    description?: string;
    errorMessage?: string | ((validation: AriaValidationResult) => string);
    inputFieldClassName?: string;
}

function JollyNumberField({ label, description, errorMessage, className, inputFieldClassName, ...props }: NumberFieldProps) {
    return (
        <NumberField
            className={composeRenderProps(className, (className) => cn('group flex flex-col gap-2', className))}
            minValue={0}
            {...props}>
            <Label aria-label={label}>{label}</Label>
            <FieldGroup className={cn('md:max-w-44', inputFieldClassName)}>
                <NumberFieldInput />
                <NumberFieldSteppers />
            </FieldGroup>
            {description && (
                <Text className='text-muted-foreground text-sm' slot='description'>
                    {description}
                </Text>
            )}
            <FieldError>{errorMessage}</FieldError>
        </NumberField>
    );
}

export { NumberField, NumberFieldInput, NumberFieldSteppers, NumberFieldStepper, JollyNumberField };

export type { NumberFieldProps };