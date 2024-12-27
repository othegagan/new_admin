'use client';

import { PAGE_ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import TripsFilter from './trips-filters';

const tripsHeaderTabs = [
    { code: 'daily-view', name: 'Daily View', href: `${PAGE_ROUTES.TRIPS}/daily-view` },
    { code: 'review-required', name: 'Review Required', href: `${PAGE_ROUTES.TRIPS}/review-required` },
    { code: 'all-trips', name: 'All Trips', href: `${PAGE_ROUTES.TRIPS}/all-trips` }
];

export default function TripsHeader() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Check if the pathname includes any of the href values in tripsHeaderTabs
    const hasValidTab = tripsHeaderTabs.some((tab) => pathname.includes(tab.href));

    // Return null if the pathname doesn't include any valid href
    if (!hasValidTab) return null;

    // Convert searchParams to a string, ensuring it starts with '?'
    const searchString = searchParams.toString() && `?${searchParams.toString()}`;

    return (
        <div className='mx-auto flex w-full flex-col items-center justify-between gap-3.5 px-4 py-2 text-center text-15 md:max-w-6xl'>
            <div className='flex w-full max-w-4xl flex-1 flex-row justify-between gap-2 md:justify-around'>
                {tripsHeaderTabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    const showDot = tab.code === 'review-required';

                    return (
                        <Link
                            key={tab.name}
                            href={`${tab.href}${searchString}`}
                            className={`relative cursor-pointer rounded-md px-2 py-1 font-semibold transition-all ease-in-out hover:text-primary ${isActive ? 'text-primary' : 'text-neutral-400'}`}>
                            {tab.name}
                            {showDot && <span className='-right-1 -top-1 absolute h-2 w-2 rounded-full bg-primary' />}
                        </Link>
                    );
                })}
            </div>

            <div className='relative flex w-full items-center border-b'>
                <TripsFilter />
            </div>
        </div>
    );
}
