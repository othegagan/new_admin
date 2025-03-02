import { cn } from '@/lib/utils';
import type React from 'react';

interface MainProps extends React.HTMLAttributes<React.ComponentRef<'main'>> {
    fixed?: boolean;
}

export const Main = ({
    ref,
    fixed,
    className,
    ...props
}: MainProps & {
    ref: React.RefObject<React.ComponentRef<'main'>>;
}) => {
    return <main ref={ref} className={cn('px-4 py-6 md:pl-6 ', fixed && 'flex grow flex-col overflow-hidden', className)} {...props} />;
};
Main.displayName = 'Main';
