import { cn } from '@/lib/utils';
import React from 'react';

interface MainProps extends React.HTMLAttributes<React.ComponentRef<'main'>> {
    fixed?: boolean;
}

export const Main = React.forwardRef<React.ComponentRef<'main'>, MainProps>(({ fixed, className, ...props }, ref) => {
    return (
        <main ref={ref} className={cn('px-4 py-6 md:pl-6 ', fixed && 'flex flex-grow flex-col overflow-hidden', className)} {...props} />
    );
});
Main.displayName = 'Main';
