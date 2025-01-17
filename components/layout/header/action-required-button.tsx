'use client';

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

    const newTripRequests = data?.newRequests || [];
    const failedPayments = data?.failedPayments || [];
    const failedTripExtensions = data?.failedTripExtensions || [];
    const failedDriverVerifications = data?.failedDriverVerifications || [];
    const failedCardExtensions = data?.failedCardExtensions || [];
    const cancellationRequestedTrips = data?.cancellationRequestedTrips || [];

    if (
        !newTripRequests ||
        !failedPayments ||
        !failedTripExtensions ||
        !failedDriverVerifications ||
        !failedCardExtensions ||
        !cancellationRequestedTrips
    ) {
        return null;
    }

    return (
        <Link className='relative px-2' href={`${PAGE_ROUTES.TRIPS}${PAGE_ROUTES.TRIPS_TABS.REVIEW_REUIRED}`}>
            <svg width={26} height={26} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <mask id='mask0_15667_22782' style={{ maskType: 'alpha' }} maskUnits='userSpaceOnUse' x={0} y={0} width={24} height={24}>
                    <rect width={24} height={24} fill='#D9D9D9' />
                </mask>
                <g mask='url(#mask0_15667_22782)'>
                    <path
                        className='text-muted-foreground'
                        d='M7 14V20C7 20.2833 6.90417 20.5208 6.7125 20.7125C6.52083 20.9042 6.28333 21 6 21C5.71667 21 5.47917 20.9042 5.2875 20.7125C5.09583 20.5208 5 20.2833 5 20V5C5 4.71667 5.09583 4.47917 5.2875 4.2875C5.47917 4.09583 5.71667 4 6 4H13.175C13.4083 4 13.6167 4.075 13.8 4.225C13.9833 4.375 14.1 4.56667 14.15 4.8L14.4 6H19C19.2833 6 19.5208 6.09583 19.7125 6.2875C19.9042 6.47917 20 6.71667 20 7V15C20 15.2833 19.9042 15.5208 19.7125 15.7125C19.5208 15.9042 19.2833 16 19 16H13.825C13.5917 16 13.3833 15.925 13.2 15.775C13.0167 15.625 12.9 15.4333 12.85 15.2L12.6 14H7ZM14.65 14H18V8H13.575C13.3417 8 13.1333 7.925 12.95 7.775C12.7667 7.625 12.65 7.43333 12.6 7.2L12.35 6H7V12H13.425C13.6583 12 13.8667 12.075 14.05 12.225C14.2333 12.375 14.35 12.5667 14.4 12.8L14.65 14Z'
                        fill='currentColor'
                    />
                    <mask
                        id='mask1_15667_22782'
                        style={{ maskType: 'alpha' }}
                        maskUnits='userSpaceOnUse'
                        x={11}
                        y={-1}
                        width={16}
                        height={16}>
                        <rect x={11} y={-1} width={14} height={14} fill='#D9D9D9' />
                    </mask>
                    <g mask='url(#mask1_15667_22782)'>
                        <path
                            className='size-5 text-red-500'
                            d='M17.9998 11.8331C17.1929 11.8331 16.4346 11.68 15.7248 11.3737C15.0151 11.0675 14.3978 10.6519 13.8728 10.1269C13.3478 9.60185 12.9321 8.98449 12.6259 8.27477C12.3196 7.56505 12.1665 6.80671 12.1665 5.99977C12.1665 5.19282 12.3196 4.43449 12.6259 3.72477C12.9321 3.01505 13.3478 2.39769 13.8728 1.87269C14.3978 1.34769 15.0151 0.93206 15.7248 0.62581C16.4346 0.31956 17.1929 0.166435 17.9998 0.166435C18.8068 0.166435 19.5651 0.31956 20.2748 0.62581C20.9846 0.93206 21.6019 1.34769 22.1269 1.87269C22.6519 2.39769 23.0675 3.01505 23.3738 3.72477C23.68 4.43449 23.8332 5.19282 23.8332 5.99977C23.8332 6.80671 23.68 7.56505 23.3738 8.27477C23.0675 8.98449 22.6519 9.60185 22.1269 10.1269C21.6019 10.6519 20.9846 11.0675 20.2748 11.3737C19.5651 11.68 18.8068 11.8331 17.9998 11.8331Z'
                            fill='currentColor'
                        />
                    </g>
                    <mask
                        id='mask2_15667_22782'
                        style={{ maskType: 'alpha' }}
                        maskUnits='userSpaceOnUse'
                        x={12}
                        y={0}
                        width={13}
                        height={13}>
                        <rect x={12} width='12.0608' height='12.0608' fill='#D9D9D9' />
                    </mask>
                    <g mask='url(#mask2_15667_22782)'>
                        <path
                            d='M18.0304 7.03546C17.888 7.03546 17.7686 6.9873 17.6723 6.89098C17.576 6.79466 17.5278 6.67531 17.5278 6.53293V3.0152C17.5278 2.87281 17.576 2.75346 17.6723 2.65714C17.7686 2.56082 17.888 2.51266 18.0304 2.51266C18.1727 2.51266 18.2921 2.56082 18.3884 2.65714C18.4847 2.75346 18.5329 2.87281 18.5329 3.0152V6.53293C18.5329 6.67531 18.4847 6.79466 18.3884 6.89098C18.2921 6.9873 18.1727 7.03546 18.0304 7.03546ZM18.0304 9.54813C17.888 9.54813 17.7686 9.49997 17.6723 9.40365C17.576 9.30733 17.5278 9.18798 17.5278 9.04559C17.5278 8.90321 17.576 8.78386 17.6723 8.68754C17.7686 8.59122 17.888 8.54306 18.0304 8.54306C18.1727 8.54306 18.2921 8.59122 18.3884 8.68754C18.4847 8.78386 18.5329 8.90321 18.5329 9.04559C18.5329 9.18798 18.4847 9.30733 18.3884 9.40365C18.2921 9.49997 18.1727 9.54813 18.0304 9.54813Z'
                            fill='#FBFBFB'
                        />
                    </g>
                </g>
            </svg>
        </Link>
    );
}
