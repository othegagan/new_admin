import { formatDateAndTime } from '@/lib/utils';
import type { Trip } from '@/types';
import { addDays, addMonths, format, isBefore, isSameDay, subMonths } from 'date-fns';
import Fuse from 'fuse.js';

export const tripSearchFields = [
    { name: 'vehmake', weight: 1 },
    { name: 'vehmodel', weight: 1 },
    { name: 'vehyear', weight: 0.8 },
    { name: 'tripid', weight: 1 },
    { name: 'userFirstName', weight: 1 },
    { name: 'userlastName', weight: 1 },
    { name: 'vehaddress1', weight: 0.6 },
    { name: 'vehaddress2', weight: 0.6 },
    { name: 'vehcityname', weight: 0.6 },
    { name: 'vehstate', weight: 0.6 },
    { name: 'vehzipcode', weight: 0.6 },
    { name: 'status', weight: 0.9 }
];

/**
 * Search and filter trips data
 * @param data - Trips data
 * @param searchTerm - Search term
 * @param channelName - Channel name
 * @param tripStatus - Trip status
 * @returns Filtered trips data
 */
export function searchAndFilterTrips(data: any[], searchTerm: string | null, channelName: string | null, tripStatus: string | null): any[] {
    let results = data;

    const fuse = new Fuse(data, {
        keys: tripSearchFields.map((field) => ({
            name: field.name,
            weight: field.weight
        })),
        threshold: 0.4,
        distance: 100,
        minMatchCharLength: 2,
        shouldSort: true,
        includeScore: true,
        useExtendedSearch: true,
        ignoreLocation: true,
        findAllMatches: true,
        isCaseSensitive: false
    });

    if (searchTerm) {
        results = fuse.search(searchTerm).map((result) => result.item);
    }

    if (channelName) {
        results = results.filter((item: any) => item.channelName.toLowerCase() === channelName.toLowerCase());
    }

    if (tripStatus) {
        results = results.filter((item: any) => item.status.toLowerCase() === tripStatus.toLowerCase());
    }

    return results;
}

export function parseTrips(rawTripsData: Trip[]) {
    const trips = rawTripsData.reduce((acc: Record<string, any[]>, trip: Trip) => {
        const zipcode = trip.vehzipcode;
        const endKey = formatDateAndTime(trip.endtime, zipcode, 'yyyy-MM-DD'); // always use yyyy-MM-DD format
        const startKey = formatDateAndTime(trip.starttime, zipcode, 'yyyy-MM-DD');

        const startDate = `${format(subMonths(new Date(), 1), 'yyyy-MM-dd')}T05:00:00.362Z`;
        const endDate = `${format(addMonths(new Date(), 1), 'yyyy-MM-dd')}T04:59:59.362Z`;

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
}

export function getCategory(statusCode: string, type: 'start' | 'end'): number {
    if (type === 'start') {
        if (['REAPP', 'REMODHLD'].includes(statusCode)) return 0;
        if (['TRSTR', 'TRMODHLD'].includes(statusCode)) return 1;
        if (['TRCOM'].includes(statusCode)) return 3;
        if (['REREJ', 'RECAN'].includes(statusCode)) return 3;
    } else if (type === 'end') {
        if (['TRCOM'].includes(statusCode)) return 3;
        if (['REREJ', 'RECAN'].includes(statusCode)) return 3;
        if (['REAPP', 'TRSTR', 'REMODHLD', 'TRMODHLD'].includes(statusCode)) return 2;
    }
    return -1;
}
