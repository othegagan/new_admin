'use client';

import { cn, formatDateAndTime } from '@/lib/utils';
import type { TelematicsData } from '@/types';
import { type Key, useMemo } from 'react';

interface TripListProps {
    telematicsData: TelematicsData[];
    onTripSelect: any;
    zipcode: string;
}

export function TripList({ telematicsData, onTripSelect, zipcode }: TripListProps) {
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

    return (
        <div className='h-full overflow-auto pr-4'>
            {processedData.tripDateKeys.map((dateKey: any) => (
                <div key={dateKey.key}>
                    <div className='sticky top-0 my-3 flex items-center justify-between rounded bg-[#ffc8a1] px-4 py-2 font-medium text-sm shadow dark:bg-[#412614]'>
                        <div>{dateKey.seg}</div>
                        <div className='text-xs'>Total: {dateKey.miles.toFixed(2)} mi</div>
                    </div>
                    <div className='space-y-2'>
                        {processedData.tripRender[dateKey.key]?.map((trip: unknown, tripIndex: Key | null | undefined) => (
                            <TripItem key={tripIndex} trip={trip} onSelect={onTripSelect} zipcode={zipcode} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
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
