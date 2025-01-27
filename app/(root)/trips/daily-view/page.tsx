'use client';

import { CarLoadingSkeleton } from '@/components/skeletons';
import { DEFAULT_ZIPCODE } from '@/constants';
import { useDailyViewTrips } from '@/hooks/useTrips';
import { formatDateAndTime, formatDateToReadable, generateStartAndEndDates } from '@/lib/utils';
import { format } from 'date-fns';
import { useQueryState } from 'nuqs';
import { useEffect, useMemo, useRef } from 'react';
import { TripCard } from '../_components/trip-card-components';
import { type AllTrip, findUser, findVehicle, getCategory, searchAndFilterTrips } from '../_components/trip-utils';

const { startDate, endDate } = generateStartAndEndDates(DEFAULT_ZIPCODE, 0, 1);

export default function DailyViewPage() {
    const { data: response, isLoading, isError, error } = useDailyViewTrips(startDate, endDate);

    if (isLoading) {
        return <CarLoadingSkeleton />;
    }

    if (isError) {
        return <div>Error {error?.message}</div>;
    }

    if (!response?.success) {
        return <div>{response?.message}</div>;
    }

    const data = response.data;

    const trips = data?.trips || [];

    if (trips?.length === 0) {
        return (
            <div className='flex h-[calc(100dvh_-_300px)] w-full flex-col items-center justify-center'>
                <img src='/images/car_loading_2.gif' className='h-auto w-48 opacity-50 dark:invert' alt='Loading...' />
                <h3 className='mt-6 text-center text-muted-foreground'>No trips yet.</h3>
            </div>
        );
    }

    // Mapping through trips and adding vehicle and user details
    const modifiedTrips = trips.map((trip: { vehicleId: number; userId: number; channelName: string }) => {
        const vehicle = findVehicle(data.vehicles, trip.vehicleId);
        const user = findUser(data.users, trip.userId);

        // Creating a new object with combined details
        return {
            ...trip,
            ...vehicle,
            ...user,
            vehicleAddress: vehicle?.address,
            channel: trip?.channelName
        };
    });

    return <DailyTripsSearch tripsData={modifiedTrips} />;
}

function DailyTripsSearch({ tripsData }: any) {
    const [searchTerm] = useQueryState('search', { defaultValue: '' });
    const [channelName] = useQueryState('channel', { defaultValue: '' });
    const [tripStatus] = useQueryState('status', { defaultValue: '' });
    const scrollRef = useRef<HTMLDivElement>(null);

    //search and filter trips
    const filteredData = useMemo(() => {
        return searchAndFilterTrips(tripsData, searchTerm, channelName, tripStatus);
    }, [tripsData, searchTerm, channelName, tripStatus]);

    const dailyViewObjects = useMemo(() => {
        // Filter out trips which are in requested and cancellation required
        const rawBookingData = (filteredData || []).filter((trip: AllTrip) => !['REREQ', 'RECANREQ'].includes(trip.statusCode));

        const dailyViewObjects: Record<string, any[]> = {};
        const currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);

        while (currentDate <= endDateObj) {
            const key = format(currentDate, 'yyyy-MM-dd');
            dailyViewObjects[key] = [];
            currentDate.setDate(currentDate.getDate() + 1);
        }

        rawBookingData.forEach((trip: AllTrip) => {
            const zipcode = trip.vehicleAddress.zipcode || DEFAULT_ZIPCODE;
            const startKey = formatDateAndTime(trip.startTime, zipcode, 'yyyy-MM-DD');
            const endKey = formatDateAndTime(trip.endTime, zipcode, 'yyyy-MM-DD');

            if (dailyViewObjects[startKey]) {
                const tripCopy = {
                    ...trip,
                    actionDate: trip.startTime,
                    category: getCategory(trip.statusCode, 'start')
                };
                dailyViewObjects[startKey].push(tripCopy);
            }

            if (dailyViewObjects[endKey]) {
                const tripCopy = {
                    ...trip,
                    actionDate: trip.endTime,
                    category: getCategory(trip.statusCode, 'end')
                };
                dailyViewObjects[endKey].push(tripCopy);
            }
        });

        return Object.fromEntries(
            Object.entries(dailyViewObjects)
                .filter(([, bookings]) => bookings.length > 0)
                .map(([date, bookings]) => [
                    date,
                    bookings.sort((a, b) => new Date(a.actionDate).getTime() - new Date(b.actionDate).getTime())
                ])
        );
    }, [filteredData]);

    useEffect(() => {
        // Scroll to the top of the ScrollArea when the filter changes
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [searchTerm, channelName, tripStatus]); // Listen for changes in filter state

    if (Object.entries(dailyViewObjects).length === 0) {
        return <div className='flex h-[calc(100dvh_-_100px)] w-full flex-col items-center px-4'>No trips found</div>;
    }

    // Handle object of trips
    return (
        <div ref={scrollRef} className='flex h-[calc(100dvh_-_100px)] w-full flex-col items-center overflow-y-auto px-4'>
            {Object.entries(dailyViewObjects).map(([date, trips]) => (
                <div key={date} className='mb-4 flex w-full flex-col md:max-w-5xl'>
                    <div className='sticky top-0 z-20 mb-2 bg-background shadow-sm md:mb-0'>
                        <div className='mx-auto w-fit rounded-sm border border-black/20 bg-background p-3 py-1 text-center font-medium text-14'>
                            {formatDateToReadable(date)}
                        </div>
                    </div>
                    {trips.map((tripData, index) => (
                        <div key={`${tripData.tripid}-${index}`}>
                            <TripCard tripData={tripData} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
