'use client';

import { PAGE_ROUTES } from '@/constants/routes';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TripsFilter from './trips-filters';

const tripsHeaderTabs = [
    { code: 'daily-view', name: 'Daily View', href: `${PAGE_ROUTES.TRIPS}/daily-view` },
    { code: 'review-required', name: 'Review Required', href: `${PAGE_ROUTES.TRIPS}/review-required` },
    { code: 'all-trips', name: 'All Trips', href: `${PAGE_ROUTES.TRIPS}/all-trips` }
];

interface TripsHeaderProps {
    pathname: string;
}
export default function TripsHeader({ pathname }: TripsHeaderProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState(pathname);
    const searchParams = useSearchParams();

    useEffect(() => {
        setActiveTab(pathname);
    }, [pathname]);
    // Convert searchParams to a string, ensuring it starts with '?'
    const searchString = searchParams.toString() && `?${searchParams.toString()}`;

    const handleTabClick = (href: string) => {
        setActiveTab(href);
        router.push(href + searchString);
    };
    return (
        <div className='mx-auto flex w-full flex-col items-center justify-between gap-3.5 px-4 py-2 text-center text-15 md:max-w-6xl'>
            <div className='flex w-full max-w-4xl flex-1 flex-row justify-between gap-2 md:justify-around'>
                {tripsHeaderTabs.map((tab) => {
                    const isActive = activeTab.startsWith(tab.href);
                    const showDot = tab.code === 'review-required';

                    return (
                        <button
                            type='button'
                            key={tab.code}
                            onClick={() => handleTabClick(tab.href)}
                            className={`relative cursor-pointer rounded-md px-2 py-1 font-semibold transition-all ease-in-out hover:text-primary ${isActive ? 'text-primary' : 'text-neutral-400'}`}
                            aria-current={isActive ? 'page' : undefined}>
                            {tab.name}
                            {showDot && <span className='-right-1 -top-1 absolute h-2 w-2 rounded-full bg-primary' aria-hidden='true' />}
                        </button>
                    );
                })}
            </div>

            <div className='relative flex w-full items-center border-b'>
                <TripsFilter />
            </div>
        </div>
    );
}
