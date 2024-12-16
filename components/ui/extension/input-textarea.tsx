'use client';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Textarea } from '../textarea';
import { FormDescription, FormError } from './field';

interface InputTextareaProps extends React.ComponentProps<'textarea'> {
    label?: string;
    description?: string;
    error?: string;
    optional?: boolean;
    minHeight?: number | string;
    maxHeight?: number | string;
}

const InputTextarea = React.forwardRef<HTMLTextAreaElement, InputTextareaProps>(
    ({ className, label, description, error, optional, required, minHeight, maxHeight, id, ...props }, ref) => {
        const textareaId = id || React.useId();

        return (
            <div className={cn('group flex flex-col gap-1.5', className)}>
                {label && (
                    <Label htmlFor={textareaId} className='flex items-center space-x-1'>
                        <span>{label}</span>
                        {required && <span className='text-destructive'>*</span>}
                        {optional && <span className='text-muted-foreground text-sm'>(optional)</span>}
                    </Label>
                )}
                <Textarea id={textareaId} ref={ref} minHeight={minHeight} maxHeight={maxHeight} {...props} />

                {description && !error && <FormDescription>{description}</FormDescription>}

                {error && <FormError>{error}</FormError>}
            </div>
        );
    }
);

InputTextarea.displayName = 'InputTextarea';

export { InputTextarea };
