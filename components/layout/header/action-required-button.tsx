'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PAGE_ROUTES } from '@/constants/routes';
import { useReviewRequiredTrips } from '@/hooks/useTrips';
import Link from 'next/link';

export default function ActionRequiredButton() {
    const { data: response, isLoading, isError } = useReviewRequiredTrips();

    if (isLoading) {
        return null;
    }

    if (isError) {
        return null;
    }

    const data = response?.data;

    const actionRequired =
        data?.newRequests?.length > 0 ||
        data?.failedPayments?.length > 0 ||
        data?.failedTripExtensions?.length > 0 ||
        data?.failedDriverVerifications?.length > 0 ||
        data?.failedCardExtensions?.length > 0 ||
        data?.cancellationRequestedTrips?.length > 0;

    if (!actionRequired) {
        return null;
    }

    return (
        <Link className='relative px-2' href={`${PAGE_ROUTES.TRIPS}${PAGE_ROUTES.TRIPS_TABS.REVIEW_REUIRED}`}>
            <Tooltip>
                <TooltipTrigger>
                    <svg
                        width={24}
                        height={27}
                        className='size-6 text-muted-foreground'
                        viewBox='0 0 24 27'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'>
                        <path
                            d='M1 19.1429C1 19.1429 2 18.2857 5 18.2857C8 18.2857 10 20 13 20C16 20 17 19.1429 17 19.1429V8.85714C17 8.85714 16 9.71429 13 9.71429C10 9.71429 8 8 5 8C2 8 1 8.85714 1 8.85714V19.1429Z'
                            stroke='currentColor'
                            strokeWidth={2}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                        <path d='M1 27V19' stroke='currentColor' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' />
                        <path
                            d='M15.2998 16.8C19.4419 16.8 22.7998 13.4422 22.7998 9.30005C22.7998 5.15791 19.4419 1.80005 15.2998 1.80005C11.1577 1.80005 7.7998 5.15791 7.7998 9.30005C7.7998 13.4422 11.1577 16.8 15.2998 16.8Z'
                            fill='#FF0000'
                        />
                        <path d='M15 5.40002V9.00002' stroke='white' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' />
                        <path d='M15 13H15.006' stroke='white' strokeWidth={2} strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                </TooltipTrigger>
                <TooltipContent>
                    <p> Host Action Required </p>
                </TooltipContent>
            </Tooltip>
        </Link>
    );
}
