import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Label } from 'react-aria-components';
import { NumericFormat, type NumericFormatProps } from 'react-number-format';
import { FieldError } from './field';

export interface InputNumberProps extends Omit<NumericFormatProps, 'value' | 'onChange'> {
    stepper?: number;
    thousandSeparator?: string;
    placeholder?: string;
    defaultValue?: number;
    min?: number;
    max?: number;
    value?: number;
    suffix?: string;
    prefix?: string;
    onChange?: (value: number | undefined) => void;
    fixedDecimalScale?: boolean;
    decimalScale?: number;
    description?: string;
    label?: string;
    errorMessage?: string;
    inputFieldClassName?: string;
}

export const InputNumber = ({
    ref,
    stepper,
    thousandSeparator,
    placeholder,

    // Set 0 as fallback default
    defaultValue = 0,

    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    onChange,
    fixedDecimalScale = false,
    decimalScale = 0,
    suffix,
    prefix,
    value: controlledValue,
    className,
    label,
    description,
    errorMessage,
    inputFieldClassName,
    ...props
}: InputNumberProps & {
    ref: React.RefObject<HTMLInputElement>;
}) => {
    const [value, setValue] = useState<number>(controlledValue ?? defaultValue);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const setInputCursorToEnd = () => {
        if (inputRef.current) {
            const length = inputRef.current.value.length;
            requestAnimationFrame(() => {
                inputRef.current?.setSelectionRange(length, length);
            });
        }
    };

    const handleIncrement = useCallback(() => {
        setValue((prev) => Math.min(prev + (stepper ?? 1), max));
        inputRef.current?.focus();
        setInputCursorToEnd();
    }, [stepper, max]);

    const handleDecrement = useCallback(() => {
        setValue((prev) => Math.max(prev - (stepper ?? 1), min));
        inputRef.current?.focus();
        setInputCursorToEnd();
    }, [stepper, min]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement === inputRef.current) {
                if (e.key === 'ArrowUp') {
                    handleIncrement();
                } else if (e.key === 'ArrowDown') {
                    handleDecrement();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleIncrement, handleDecrement]);

    useEffect(() => {
        if (controlledValue !== undefined) {
            setValue(controlledValue);
        }
    }, [controlledValue]);

    const handleChange = (values: {
        value: string;
        floatValue: number | undefined;
    }) => {
        // If the input is empty or invalid, use the default value
        const newValue = values.floatValue === undefined ? defaultValue : values.floatValue;
        setValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    const handleBlur = () => {
        if (value < min) {
            setValue(min);
            inputRef.current!.value = String(min);
        } else if (value > max) {
            setValue(max);
            inputRef.current!.value = String(max);
        }
    };

    return (
        <div className={cn('group flex flex-col gap-2', className)}>
            <Label aria-label={label}>{label}</Label>

            <div className='flex h-9 items-center'>
                <NumericFormat
                    value={value}
                    onValueChange={handleChange}
                    thousandSeparator={thousandSeparator}
                    decimalScale={decimalScale}
                    fixedDecimalScale={fixedDecimalScale}
                    allowNegative={min < 0}
                    valueIsNumericString
                    onBlur={handleBlur}
                    max={max}
                    min={min}
                    suffix={suffix}
                    prefix={prefix}
                    customInput={Input}
                    placeholder={placeholder}
                    className='relative rounded-r-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                    getInputRef={(el: HTMLInputElement | null) => {
                        inputRef.current = el;
                        if (typeof ref === 'function') {
                            ref(el);
                        } else if (ref) {
                            ref.current = el;
                        }
                    }}
                    {...props}
                />

                <div className='flex h-9 flex-col'>
                    <Button
                        aria-label='Increase value'
                        className='w-4.5 grow rounded-l-none rounded-tr-md rounded-br-none border-input border-b-[0.5px] border-l-0 px-1 focus-visible:relative'
                        variant='outline'
                        size='icon'
                        type='button'
                        onClick={handleIncrement}
                        disabled={value === max}>
                        <ChevronUp className='size-3 text-muted-foreground' />
                    </Button>
                    <Button
                        aria-label='Decrease value'
                        className='w-4.5 grow rounded-l-none rounded-tr-none rounded-br-md border-input border-t-[0.5px] border-l-0 px-1 focus-visible:relative'
                        variant='outline'
                        size='icon'
                        type='button'
                        onClick={handleDecrement}
                        disabled={value === min}>
                        <ChevronDown className='size-3 text-muted-foreground' />
                    </Button>
                </div>
            </div>

            {description && (
                <div className='text-muted-foreground text-sm' slot='description'>
                    {description}
                </div>
            )}
            <FieldError>{errorMessage}</FieldError>
        </div>
    );
};
