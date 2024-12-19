import { QUERY_KEYS } from '@/constants/query-keys';
import { formatDateAndTime } from '@/lib/utils';
import { getAllMasterHostCheckList, getAllTripsOfHost, getTripDetails } from '@/server/trips';
import type { Trip } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { addMonths, format } from 'date-fns';
import { useMemo } from 'react';

export const tripSearchFields = [
    { name: 'vehmake', weight: 1 },
    { name: 'vehmodel', weight: 1 },
    { name: 'vehyear', weight: 0.8 },
    { name: 'vehicleId', weight: 0.9 },
    { name: 'vehicleNumber', weight: 1 },
    { name: 'tripid', weight: 1 },
    { name: 'channelName', weight: 0.7 },
    { name: 'userFirstName', weight: 1 },
    { name: 'userlastName', weight: 1 },
    { name: 'vehaddress1', weight: 0.6 },
    { name: 'vehaddress2', weight: 0.6 },
    { name: 'vehcityname', weight: 0.6 },
    { name: 'vehstate', weight: 0.6 },
    { name: 'vehzipcode', weight: 0.6 },
    { name: 'status', weight: 0.7 }
];

export const useAllTrips = (startTime: string, endTime: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.allTripsOfHost, { startTime, endTime }],
        queryFn: async () => getAllTripsOfHost(startTime, endTime)
    });
};

export const useDailyViewAndTripRequests = () => {
    const startDate = `${format(new Date(), 'yyyy-MM-dd')}T05:00:00.362Z`;
    const endDate = `${format(addMonths(new Date(), 1), 'yyyy-MM-dd')}T04:59:59.362Z`;

    const { data: response, isLoading, isError, error, isFetching } = useAllTrips(startDate, endDate);

    // Helper function to determine the category based on status and type
    function getCategory(statusCode: string, type: 'start' | 'end'): number {
        if (type === 'start') {
            if (['REAPP', 'REMODHLD'].includes(statusCode)) return 0;
            if (['TRSTR', 'TRMODHLD'].includes(statusCode)) return 1;
        } else if (type === 'end') {
            if (['TRCOM'].includes(statusCode)) return 3;
            if (['REAPP', 'TRSTR', 'REMODHLD', 'TRMODHLD'].includes(statusCode)) return 2;
        }
        return -1; // Default if no match
    }

    const { dailyViewObjects, bookingRequests } = useMemo(() => {
        const dailyViewObjects: Record<string, any[]> = {};
        const bookingRequests: Trip[] = [];

        // Generate the keys for each day in the range
        const currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);
        // Include the end date in the range
        while (currentDate <= endDateObj) {
            const key = format(currentDate, 'yyyy-MM-dd');
            dailyViewObjects[key] = [];
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (response?.success) {
            const rawBookingData = response?.data?.activetripresponse || [];

            rawBookingData.forEach((trip: Trip) => {
                const zipcode = trip.vehzipcode;
                const startKey = formatDateAndTime(trip.starttime, zipcode, 'yyyy-MM-DD');
                const endKey = formatDateAndTime(trip.endtime, zipcode, 'yyyy-MM-DD');

                // Handle action list based on status code
                const statusCodes = ['REREQ', 'TRMODREQ', 'REMODHLD', 'TRMODHLD', 'RECANREQ'];
                if (statusCodes.includes(trip.statusCode)) {
                    bookingRequests.push(trip);
                }

                // Handle start date based on status code
                if (dailyViewObjects[startKey]) {
                    if (['REAPP', 'TRSTR', 'TRCOM', 'REMODHLD', 'TRMODHLD'].includes(trip.statusCode)) {
                        const tripCopy = {
                            ...trip,
                            actionDate: trip.starttime,
                            category: getCategory(trip.statusCode, 'start')
                        };
                        dailyViewObjects[startKey].push(tripCopy);
                    }
                }

                // Handle end date based on status code
                if (dailyViewObjects[endKey]) {
                    if (['REAPP', 'TRSTR', 'TRCOM', 'REMODHLD', 'TRMODHLD'].includes(trip.statusCode)) {
                        const tripCopy = {
                            ...trip,
                            actionDate: trip.endtime,
                            category: getCategory(trip.statusCode, 'end')
                        };
                        dailyViewObjects[endKey].push(tripCopy);
                    }
                }
            });
        }

        return { dailyViewObjects, bookingRequests };
    }, [response, startDate, endDate]);

    // Sort bookings for each date and remove empty dates
    const sortedDailyViewObjects = Object.fromEntries(
        Object.entries(dailyViewObjects)
            // Sort dates in ascending order
            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
            // Filter out dates with no bookings
            .filter(([, bookingsForDate]) => bookingsForDate.length > 0)
            // Sort bookings for each date
            .map(([date, bookingsForDate]) => [
                date,
                bookingsForDate.sort((a, b) => new Date(a.starttime).getTime() - new Date(b.starttime).getTime())
            ])
    );

    return {
        response,
        isLoading,
        isError,
        isFetching,
        error,
        dailyViewObjects: sortedDailyViewObjects,
        bookingRequests
    };
};

export const useTripDetails = (bookingId: string | number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.tripDetails, { bookingId }],
        queryFn: async () => getTripDetails(Number(bookingId)),
        refetchOnWindowFocus: true,
        staleTime: 10 * 1000
    });
};

export const useAllMasterHostCheckList = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.allMasterHostCheckList],
        queryFn: async () => getAllMasterHostCheckList()
    });
};
