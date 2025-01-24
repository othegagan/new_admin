import Fuse from 'fuse.js';

// Function to find a vehicle by ID
export const findVehicle = (vehicles: any[], vehicleId: number) => {
    return vehicles.find((vehicle: { vehicleId: any }) => vehicle.vehicleId === vehicleId);
};

// Function to find a user by ID
export const findUser = (users: any[], userId: number) => {
    return users.find((user: { userId: any }) => user.userId === userId);
};

export const tripSearchFields = [
    { name: 'make', weight: 1 },
    { name: 'model', weight: 1 },
    { name: 'year', weight: 0.8 },
    { name: 'tripId', weight: 1 },
    { name: 'vehicleId', weight: 1 },
    { name: 'vnumber', weight: 0.9 },
    { name: 'firstName', weight: 1 },
    { name: 'middleName', weight: 1 },
    { name: 'lastName', weight: 1 },
    { name: 'address.address1', weight: 0.6 },
    { name: 'address.address2', weight: 0.6 },
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

export function getCategory(statusCode: string, type: 'start' | 'end'): number {
    if (['REREQ', 'RECANREQ'].includes(statusCode)) return -1;
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

type Location = {
    id: number;
    hostId: number;
    cityName: string;
    zipCode: string;
    address1: string;
    address2: string;
    latitude: string | number;
    longitude: string | number;
    state: string;
    country: string;
    tripId: number;
    vehicleId: number;
    isActive: boolean;
    airportDelivery: boolean;
    createdDate: string | null;
    updatedDate: string | null;
};

type MetaData = {
    DeliveryLocation: Location;
};

type Address = {
    address1: string;
    address2: string;
    address3: string;
    zipcode: string;
    cityname: string;
    state: string;
    latitude: number;
    longitude: number;
    country: string;
    timezone: string | null;
};

export type AllTrip = {
    createdTime: string;
    delivery: boolean;
    airportDelivery: boolean;
    metaData: MetaData;
    userId: number;
    tripId: number;
    vehicleId: number;
    startTime: string;
    endTime: string;
    statusCode: string;
    status: string;
    channelId: number;
    make: string;
    model: string;
    vnumber: string;
    year: string;
    imagename: string;
    vehicleAddress: Address;
    isLicenseVerified: boolean;
    isInsuranceVerified: boolean;
    isLicenseExpired: boolean;
    isInsuranceExpired: boolean;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    mobilePhone: string;
    language: string;
    driverLicense: string;
    isActive: boolean;
    vehicleOwner: boolean;
    createdDate: string;
    updatedDate: string;
    userImage: string;
    channelName: string;
    isVerified: boolean;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    isEmployee: boolean;
    phoneNumberUpdatedDate: string;
    rentalAgreement: boolean;
    category?: number;
};

export function getFullLocation(location: any) {
    if (!location) {
        return '-'; // Return '-' if deliveryLocations is empty or not provided
    }

    const addressParts = [location?.address1, location?.cityName, location?.state, location?.zipCode].filter(Boolean); // Filter out any empty or undefined values

    return addressParts.join(', ') || '-'; // Join the non-empty parts with commas or return '-'
}

export function sortByCreatedDate(array: any[]): any[] {
    return array?.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());
}
