import type React from 'react';
import TripsHeader from './_components/trips-header';

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <div className='flex h-[calc(100dvh_-_60px)] flex-col items-center gap-4 overflow-auto'>
            {/* tabs */}
            <TripsHeader />

            {children}
        </div>
    );
}
