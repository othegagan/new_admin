import Fuse from 'fuse.js';

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

export interface TripData {
    [date: string]: Array<{
        channelName: string;
        status: string;
        [key: string]: any;
    }>;
}

export function searchAndFilterTrips(
    data: TripData,
    searchTerm: string | null,
    channelName: string | null,
    tripStatus: string | null
): TripData {
    const allTrips = Object.values(data).flat();

    const fuse = new Fuse(allTrips, {
        keys: tripSearchFields.map((field) => ({ name: field.name, weight: field.weight })),
        threshold: 0.4,
        includeScore: true
    });

    let filteredTrips = allTrips;

    if (searchTerm) {
        const searchResults = fuse.search(searchTerm);
        filteredTrips = searchResults.map((result) => result.item);
    }

    if (channelName) {
        filteredTrips = filteredTrips.filter((trip) => trip.channelName === channelName);
    }

    if (tripStatus) {
        filteredTrips = filteredTrips.filter((trip) => trip.status === tripStatus);
    }

    const result: TripData = {};
    filteredTrips.forEach((trip) => {
        const date = Object.keys(data).find((date) => data[date].some((t) => t.tripid === trip.tripid)) || '';
        if (!result[date]) result[date] = [];
        result[date].push(trip);
    });

    return result;
}
