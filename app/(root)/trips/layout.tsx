'use client';

import { CarLoadingSkeleton } from '@/components/skeletons';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import TripsHeader from './_components/trips-header';

export default function layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <CarLoadingSkeleton />; // or a loading spinner
    }
    return (
        <div className='flex h-[calc(100dvh_-_60px)] flex-col items-center gap-4 overflow-auto'>
            {/* tabs */}
            <TripsHeader pathname={pathname} />

            {children}
        </div>
    );
}
