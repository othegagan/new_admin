'use client';

import { FormDescription, FormError, Label } from '@/components/ui/extension/field';
import { cn } from '@/lib/utils';
import type React from 'react';
import { Input } from '../input';

export interface InputTextProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    description?: string;
    error?: string;
    optional?: boolean;
}

const InputText = ({
    ref,
    label,
    description,
    error,
    required,
    className,
    type,
    optional,
    ...props
}: InputTextProps & {
    ref: React.RefObject<HTMLInputElement>;
}) => {
    return (
        <div className={cn('group flex flex-col gap-1.5', className)}>
            {label && (
                <Label aria-label={label} htmlFor={props.id}>
                    {label}
                    {required && <span className='ml-1 text-red-500'>*</span>}
                    {optional && <span className='text-[0.8rem] text-muted-foreground'>(optional)</span>}
                </Label>
            )}

            <Input ref={ref} {...props} />

            {description && !error && <FormDescription>{description}</FormDescription>}

            {error && <FormError>{error}</FormError>}
        </div>
    );
};
InputText.displayName = 'InputText';

export { InputText };
