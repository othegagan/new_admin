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
                <h1 className='mt-5 font-bold text-2xl text-foreground'> Oops! Something went wrong. Try refeshing the page.</h1>
                <Button
                    className='mt-4'
                    variant='outline'
                    size='sm'
                    onClick={() => setShowDetails(!showDetails)}
                    aria-expanded={showDetails}>
                    {showDetails ? 'Hide' : 'Show'} Error Details
                </Button>
                {showDetails && (
                    <pre className='mt-4 max-w-2xl break-all rounded-md bg-muted p-4 text-left font-mono text-muted-foreground text-sm'>
                        {error.message}
                    </pre>
                )}
                <Button className='mt-4 ml-2' size='sm' onClick={() => window.location.reload()}>
                    Refresh
                </Button>
            </div>
        </div>
    );
}
