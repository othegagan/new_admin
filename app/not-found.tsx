'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className='flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4'>
            <div className='mb-4 font-bold text-[64px] text-primary leading-4'>404</div>
            <p className='mb-8 text-muted-foreground text-xl'>We couldn't find the page you're looking for.</p>
            <Button variant='default' size='lg' href='/' className=' max-w-xl gap-2' prefix={<ArrowLeft className='h-4 w-4' />}>
                Back to Home
            </Button>
        </div>
    );
}
