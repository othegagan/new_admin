import { CarLoadingSkeleton } from '@/components/skeletons';
import { Suspense } from 'react';
import TripsHeader from './_components/trips-header';

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<CarLoadingSkeleton />}>
            <div className='flex h-[calc(100dvh_-_60px)] flex-col items-center gap-4 overflow-auto'>
                <TripsHeader />
                {children}
            </div>
        </Suspense>
    );
}
