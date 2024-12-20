import { cn } from '@/lib/utils';
import React from 'react';

interface MainProps extends React.HTMLAttributes<React.ComponentRef<'main'>> {
    fixed?: boolean;
}

export const Main = React.forwardRef<React.ComponentRef<'main'>, MainProps>(({ fixed, className, ...props }, ref) => {
    return <main ref={ref} className={cn('px-5 py-6 md:px-8', fixed && 'flex flex-col overflow-hidden', className)} {...props} />;
});
Main.displayName = 'Main';
