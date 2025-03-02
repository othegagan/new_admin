import { cn } from '@/lib/utils';
import * as React from 'react';

interface TextareaProps extends React.ComponentProps<'textarea'> {
    minHeight?: number | string;
    maxHeight?: number | string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, minHeight = '140px', maxHeight = '140px', style, rows = 5, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    'flex w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                    className,
                    maxHeight && `max-h-[${maxHeight}]`,
                    minHeight && `min-h-[${minHeight}]`
                )}
                rows={rows}
                ref={ref}
                {...props}
            />
        );
    }
);

Textarea.displayName = 'Textarea';

export { Textarea };
