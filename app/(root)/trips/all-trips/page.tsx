'use client';

import { CarLoadingSkeleton } from '@/components/skeletons';
import { DEFAULT_ZIPCODE } from '@/constants';
import { useAllTrips } from '@/hooks/useTrips';
import { formatDateAndTime, formatDateToReadable, generateStartAndEndDates } from '@/lib/utils';
import { addDays, format, isBefore, isSameDay } from 'date-fns';
import { useQueryState } from 'nuqs';
import { useEffect, useMemo, useRef } from 'react';
import { TripCard } from '../_components/trip-card-components';
import { type AllTrip, findUser, findVehicle, searchAndFilterTrips } from '../_components/trip-utils';

const { startDate, endDate } = generateStartAndEndDates(DEFAULT_ZIPCODE, 1, 1);

export default function AllTripsPage() {
    const { data: response, isLoading, isError, error } = useAllTrips(startDate, endDate);

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
    const modifiedTrips = data.trips.map((trip: { vehicleId: number; userId: number; channelName: string }) => {
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

    return <AllTripsSearch tripsData={modifiedTrips} />;
}

function AllTripsSearch({ tripsData }: any) {
    const [searchTerm] = useQueryState('search', { defaultValue: '' });
    const [channelName] = useQueryState('channel', { defaultValue: '' });
    const [tripStatus] = useQueryState('status', { defaultValue: '' });
    const scrollRef = useRef<HTMLDivElement>(null);

    //search and filter trips
    const filteredData = useMemo(() => {
        return searchAndFilterTrips(tripsData, searchTerm, channelName, tripStatus);
    }, [tripsData, searchTerm, channelName, tripStatus]);

    const allTripsObjects = useMemo(() => {
        const trips = filteredData.reduce((acc: Record<string, any[]>, trip: AllTrip) => {
            const zipcode = trip.vehicleAddress.zipcode || DEFAULT_ZIPCODE;
            const endKey = formatDateAndTime(trip.endTime, zipcode, 'yyyy-MM-DD'); // always use yyyy-MM-DD format
            const startKey = formatDateAndTime(trip.startTime, zipcode, 'yyyy-MM-DD');

            const { startDate, endDate } = generateStartAndEndDates(DEFAULT_ZIPCODE, 1, 1);

            let currentDate: any = startDate;
            while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
                const formattedDate = format(currentDate, 'yyyy-MM-dd');
                if (!acc[formattedDate]) {
                    acc[formattedDate] = [];
                }
                currentDate = addDays(currentDate, 1);
            }

            if (acc[startKey]) {
                acc[startKey].push(trip);
            } else if (acc[endKey]) {
                acc[endKey].push(trip);
            }

            return acc;
        }, {});

        // Sort bookings for each date and remove empty dates
        const sortedTrips = Object.entries(trips)
            .sort(([dateA], [dateB]) => new Date(dateA).valueOf() - new Date(dateB).valueOf()) // Sort dates in ascending order
            .reduce(
                (acc, [date, bookingsForDate]: any) => {
                    if (bookingsForDate.length > 0) {
                        acc[date] = bookingsForDate.sort(
                            (a: any, b: any) => new Date(a.starttime).valueOf() - new Date(b.starttime).valueOf() // Change to ascending order
                        );
                    }
                    return acc;
                },
                {} as Record<string, any[]>
            );

        return sortedTrips;
    }, [filteredData]);

    useEffect(() => {
        // Scroll to the top of the ScrollArea when the filter changes
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [searchTerm, channelName, tripStatus]); // Listen for changes in filter state

    if (Object.entries(allTripsObjects).length === 0) {
        return <div className='flex h-[calc(100dvh_-_100px)] w-full flex-col items-center px-4'>No trips found</div>;
    }

    // Handle object of trips
    return (
        <div ref={scrollRef} className='flex h-[calc(100dvh_-_100px)] w-full flex-col items-center overflow-y-auto px-4'>
            {Object.entries(allTripsObjects).map(([date, trips]) => (
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
