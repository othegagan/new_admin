'use client';

import { Button } from '@/components/ui/button';
import { CarBreakdownErrorIcon } from '@/public/icons';
import { useEffect, useState } from 'react';

interface CustomErrorComponentProps {
    error: Error & { digest?: string };
}

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
export default function Error({ error }: CustomErrorComponentProps) {
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className='flex h-screen w-full items-center justify-center bg-background p-4'>
            <div className='text-center'>
                <div className='flex-center'>
                    <CarBreakdownErrorIcon className='size-52' />
                </div>
                <h1 className='mt-5 font-bold text-2xl text-foreground'> Oops! We've Hit a Bump in the Road</h1>
                <p className='mt-2 max-w-xl text-muted-foreground'>
                    It looks like our rental system has temporarily stalled. Our team of expert mechanics is working hard to get things
                    running smoothly again.
                    {/* We apologize for any inconvenience this may cause to your travel plans. */}
                </p>
                <Button
                    className='mt-4'
                    variant='outline'
                    size='sm'
                    onClick={() => setShowDetails(!showDetails)}
                    aria-expanded={showDetails}>
                    {showDetails ? 'Hide' : 'Show'} Error Details
                </Button>
                {showDetails && (
                    <div className='mt-4 rounded-md bg-muted p-4 text-left'>
                        <p className='break-all font-mono text-muted-foreground text-sm'>{error.message}</p>
                    </div>
                )}
                <Button className='mt-4 ml-2' size='sm' onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        </div>
    );
}
