'use client';

import { Main } from '@/components/layout/main';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { DEFAULT_ZIPCODE } from '@/constants';
import { useTelematicsData } from '@/hooks/useVehicles';
import { cn, formatDateAndTime } from '@/lib/utils';
import type { TelematicsData } from '@/types';
import { useParams } from 'next/navigation';
import { type Key, useEffect, useMemo, useRef, useState } from 'react';
import { TripDetails } from './_components/trip-details';

export default function TelematicsTrips() {
    const { vehicleId } = useParams();
    const [selectedTrip, setSelectedTrip] = useState<TelematicsData | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef<number>(0); // Track scroll position

    const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, error } = useTelematicsData(Number(vehicleId));

    const telematicsData = data?.pages.flatMap((page) => page?.tripData) || [];

    const zipcode = DEFAULT_ZIPCODE;

    const processedData = useMemo(() => {
        const tripRender: any = {};
        const tripDateKeys: any = [];

        telematicsData.forEach((trip) => {
            if (trip.tripStart) {
                const dateKey = `d_${formatDateAndTime(trip.tripStart, zipcode, 'YYYY_MM_DD')}`;
                const dateSegment = formatDateAndTime(trip.tripStart, zipcode, 'dddd, MMM D');

                if (!tripRender[dateKey]) {
                    tripRender[dateKey] = [];
                    tripDateKeys.push({
                        seg: dateSegment,
                        key: dateKey,
                        miles: 0
                    });
                }

                tripRender[dateKey].push(trip);
            }
        });

        Object.keys(tripRender).forEach((key) => {
            tripRender[key] = tripRender[key].sort((a: { tripId: number }, b: { tripId: number }) => b.tripId - a.tripId);
        });

        tripDateKeys.forEach((keyData: { miles: any; key: string | number }) => {
            keyData.miles = tripRender[keyData.key].reduce((total: any, trip: { tripDistance: any }) => total + trip.tripDistance, 0);
        });

        tripDateKeys.sort((a: { key: string | number }, b: { key: string | number }) => {
            const lastTripA = tripRender[a.key]?.[0]?.tripId || 0;
            const lastTripB = tripRender[b.key]?.[0]?.tripId || 0;
            return lastTripB - lastTripA;
        });

        return { tripRender, tripDateKeys };
    }, [telematicsData]);

    const handleTripSelect = (trip: TelematicsData) => {
        setSelectedTrip(trip);
        setIsSheetOpen(true);
    };

    const handleScroll = () => {
        if (!scrollRef.current || isLoading || !hasNextPage) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            fetchNextPage(); // Fetch the next page when the user scrolls near the bottom
        }

        // Save the current scroll position
        scrollPositionRef.current = scrollTop;
    };

    // Restore scroll position after re-render
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollPositionRef.current;
        }
    }, [telematicsData]); // Restore scroll position when notifications change

    if (isLoading && !isFetchingNextPage) {
        return <CarLoadingSkeleton />;
    }

    return (
        <Main fixed className='grid h-full p-0 md:grid-cols-[550px_1fr]'>
            {error && <div className='flex h-20 items-center justify-center'>{error.message}</div>}

            {!isLoading && !error && telematicsData.length === 0 && (
                <div className='flex h-20 items-center justify-center'>No telematics data found.</div>
            )}

            {!error && telematicsData.length > 0 && (
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className='flex h-[calc(65dvh-100px)] select-none flex-col overflow-y-auto rounded-none pr-2 md:w-full '>
                    {processedData.tripDateKeys.map((dateKey: any) => (
                        <div key={dateKey.key}>
                            <div className='sticky top-0 my-3 flex items-center justify-between rounded bg-[#ffc8a1] px-4 py-2 font-medium text-sm shadow dark:bg-[#412614]'>
                                <div>{dateKey.seg}</div>
                                <div className='text-xs'>Total: {dateKey.miles.toFixed(2)} mi</div>
                            </div>
                            <div className='space-y-2'>
                                {processedData.tripRender[dateKey.key]?.map((trip: unknown, tripIndex: Key | null | undefined) => (
                                    <TripItem key={tripIndex} trip={trip} onSelect={handleTripSelect} zipcode={zipcode} />
                                ))}
                            </div>
                        </div>
                    ))}

                    {isFetchingNextPage && (
                        <div className='my-5 flex h-20 w-full flex-col items-center justify-center gap-2 px-2 text-muted-foreground text-sm'>
                            Loading More...
                        </div>
                    )}
                </div>
            )}

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side='right' className='w-full sm:max-w-lg'>
                    <TripDetails selectedTrip={selectedTrip} zipcode={zipcode} />
                </SheetContent>
            </Sheet>
        </Main>
    );
}

function TripItem({ trip, onSelect, zipcode }: { trip: any; onSelect: any; zipcode: string }) {
    return (
        <button
            type='button'
            onClick={() => onSelect(trip)}
            className='w-full rounded border border-neutral-300 px-4 py-2 text-left text-sm hover:bg-muted/50 dark:border-neutral-800'>
            <div className='grid grid-cols-4 gap-x-2 gap-y-1'>
                <div className='col-span-2'>
                    {formatDateAndTime(trip.tripStart, zipcode, 'h:mm A')} <span className='text-muted-foreground'>to</span>{' '}
                    {formatDateAndTime(trip.tripEnd, zipcode, 'h:mm A')}
                </div>
                <div className='text-muted-foreground'>{trip.tripDistance.toFixed(2)} mi</div>
                <div className={cn('ml-auto w-fit rounded-full px-2 py-0.5 text-xs')}>
                    {trip.bundeeBookingId > 0 ? <div>BID: {trip.bundeeBookingId}</div> : <div className='offrental'>Off Rental</div>}
                </div>
            </div>
        </button>
    );
}
