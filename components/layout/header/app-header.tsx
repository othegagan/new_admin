'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import React from 'react';

interface HeaderProps extends React.HTMLAttributes<React.ElementRef<'header'>> {
    sticky?: boolean;
}

export const Header = React.forwardRef<React.ElementRef<'header'>, HeaderProps>(({ className, sticky, children, ...props }, ref) => {
    const [offset, setOffset] = React.useState(0);

    React.useEffect(() => {
        const onScroll = () => {
            setOffset(document.body.scrollTop || document.documentElement.scrollTop);
        };

        // Add scroll listener to the body
        document.addEventListener('scroll', onScroll, { passive: true });

        // Clean up the event listener on unmount
        return () => document.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            ref={ref}
            className={cn(
                'flex h-16 items-center gap-3 border-b bg-background p-4 sm:gap-4 md:flex-row-reverse md:pr-6',
                sticky && 'sticky top-0 z-20',
                offset > 10 && sticky ? 'shadow' : 'shadow-none',
                className
            )}
            {...props}>
            <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
            <Separator orientation='vertical' className='h-6' />
            {children}
        </header>
    );
});
Header.displayName = 'Header';
