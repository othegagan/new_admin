'use client';

import { cn } from '@/lib/utils';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import type * as React from 'react';

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
    orientation?: 'horizontal' | 'vertical';
}

const ScrollArea = ({
    ref,
    className,
    children,
    orientation = 'vertical',
    ...props
}: ScrollAreaProps & {
    ref: React.RefObject<React.ComponentRef<typeof ScrollAreaPrimitive.Viewport>>;
}) => (
    <ScrollAreaPrimitive.Root className={cn('relative overflow-hidden', className)} {...props}>
        <ScrollAreaPrimitive.Viewport
            ref={ref}
            className={cn('h-full w-full rounded-[inherit]', orientation === 'horizontal' && 'overflow-x-auto!')}>
            {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar orientation={orientation} />
        <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = ({
    ref,
    className,
    orientation = 'vertical',
    ...props
}: React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & {
    ref: React.RefObject<React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>>;
}) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
        ref={ref}
        orientation={orientation}
        className={cn(
            'flex touch-none select-none transition-colors',
            orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-[1px]',
            orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent p-[1px]',
            className
        )}
        {...props}>
        <ScrollAreaPrimitive.ScrollAreaThumb className='relative flex-1 rounded-full bg-border' />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
