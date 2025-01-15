'use client';

import { PAGE_ROUTES } from '@/constants/routes';
import { useReviewRequiredTrips } from '@/hooks/useTrips';
import { TriangleAlert } from 'lucide-react';
import Link from 'next/link';

export default function ActionRequiredAlert() {
    const { data: response, isLoading, isError } = useReviewRequiredTrips();

    if (isLoading) {
        return null;
    }

    if (isError) {
        return null;
    }

    if (!response?.success) {
        return null;
    }

    const data = response.data;

    const actionRequired =
        data?.newRequests?.length > 0 ||
        data?.failedPayments?.length > 0 ||
        data?.failedTripExtensions?.length > 0 ||
        data?.failedDriverVerifications?.length > 0 ||
        data?.failedCardExtensions?.length > 0 ||
        data?.cancellationRequestedTrips?.length > 0;

    if (actionRequired)
        return (
            <Link
                href={`${PAGE_ROUTES.TRIPS}${PAGE_ROUTES.TRIPS_TABS.REVIEW_REUIRED}`}
                prefetch={false}
                className='cursor-pointer rounded-lg border border-border bg-background p-4 shadow shadow-black/5'>
                <div className='flex gap-2'>
                    <div className='flex grow flex-col gap-3'>
                        <div className='space-y-1'>
                            <p className='flex-start gap-2 font-medium text-sm'>
                                <TriangleAlert className='mt-0.5 shrink-0 text-amber-500' size={20} strokeWidth={2} aria-hidden='true' />
                                Host Action Required
                            </p>
                            <div className='text-muted-foreground text-sm'>
                                There are some items that need your review.
                                <span className='ml-2.5 font-medium underline underline-offset-2 hover:text-primary'>See More</span>
                            </div>
                        </div>
                    </div>
                    {/* <Button
                    variant='ghost'
                    className='group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent'
                    aria-label='Close notification'>
                    <X size={16} strokeWidth={2} className='opacity-60 transition-opacity group-hover:opacity-100' aria-hidden='true' />
                </Button> */}
                </div>
            </Link>
        );
}
