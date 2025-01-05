import { QUERY_KEYS } from '@/constants/query-keys';
import {
    getAllVehiclesUnderHost,
    getVehicleConfigurationEvents,
    getVehicleExpenseLogs,
    getVehicleFeaturesById,
    getVehicleMasterDataByVIN,
    getVehicleRepairLogs,
    getVehicleTripById,
    getVehicleUpdateLogsById,
    getVehiclesForMapView
} from '@/server/vehicles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { add, addDays, differenceInHours, format, isAfter, isBefore, parse, parseISO, set } from 'date-fns';

export const useVehiclesUnderHost = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.allVechiclesUnderHost],
        queryFn: async () => getAllVehiclesUnderHost()
    });
};

export const useVehiclesForMapView = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.vehiclesForMapView],
        queryFn: async () => getVehiclesForMapView()
    });
};

export const useVehicleMasterDataByVIN = (vin: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.vehiclesByVin, vin],
        queryFn: async () => getVehicleMasterDataByVIN(vin),
        enabled: vin !== ''
    });
};

export const useVehicleFeaturesById = (id: number) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.vehicleFeaturesById, id],
            queryFn: async () => getVehicleFeaturesById(id),
            staleTime: 0
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.vehicleFeaturesById]
            });
        }
    };
};

export const useVehicleUpdateLogsById = (id: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.vehicleUpdateLogsById, id],
        queryFn: async () => getVehicleUpdateLogsById(id)
    });
};

export const useVehicleRepairLogs = (id: number) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.vehicleRepairLogs, id],
            queryFn: async () => getVehicleRepairLogs(id)
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.vehicleRepairLogs]
            });
        }
    };
};

export const useVehicleExpenseLogs = (id: number) => {
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.vehicleExpenseLogs, id],
            queryFn: async () => getVehicleExpenseLogs(id)
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.vehicleExpenseLogs]
            });
        }
    };
};

export const useVehicleTripById = (startDate: string, endDate: string, vehicleId: number) => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.vehicleTripById, { startDate, endDate, vehicleId }],
            queryFn: async () => getVehicleTripById(startDate, endDate, vehicleId)
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.vehicleTripById]
            });
        }
    };
};

export const useVehicleConfigurationEvents = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.vehicleConfigurationEvents],
            queryFn: async () => getVehicleConfigurationEvents()
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.vehicleConfigurationEvents]
            });
        }
    };
};

export function validateBookingTime(bookingDateTime: string) {
    // Convert input to Date object if string
    const bookingTime = typeof bookingDateTime === 'string' ? parseISO(bookingDateTime) : bookingDateTime;

    const now = new Date();
    const today = new Date();
    const tomorrow = addDays(today, 1);

    // Set up time boundaries
    const todaySevenPM = set(today, { hours: 19, minutes: 0, seconds: 0, milliseconds: 0 });
    const tomorrowNoon = set(tomorrow, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });
    const todayNoon = set(today, { hours: 12, minutes: 0, seconds: 0, milliseconds: 0 });

    // If current time is after 7 PM
    if (isAfter(now, todaySevenPM)) {
        // No bookings allowed until next day noon
        if (isBefore(bookingTime, tomorrowNoon)) {
            return {
                isValid: false,
                error: `The trip can't start before ${format(tomorrowNoon, 'h:mm aa')} tomorrow due to car preparation time.`
            };
        }
    }
    // If current time is after midnight but before noon
    else if (isBefore(now, todayNoon) && now.getHours() < 12) {
        // No bookings allowed until today noon
        if (isBefore(bookingTime, todayNoon)) {
            return {
                isValid: false,
                error: `The trip can't start before ${format(tomorrowNoon, 'h:mm aa')} today due to car preparation time.`
            };
        }
    }

    return {
        isValid: true,
        error: 'Booking time is valid'
    };
}

export function validateBookingTimeWithDelivery(bookingDateTime: string, isCustomDelivery: boolean, isAirportDelivery: boolean) {
    // Ensure delivery conditions apply
    if (isCustomDelivery || isAirportDelivery) {
        const timeFormat = 'h:mm aa';
        const dateTimeFormat = 'yyyy-MM-dd h:mm aa';

        // Define restricted range times
        const startOfRange = parse('7:00 PM', timeFormat, new Date());
        const endOfRange = add(parse('9:00 AM', timeFormat, new Date()), { days: 1 });

        // Parse given time
        const bookingTime = parse(bookingDateTime, dateTimeFormat, new Date());
        const now = new Date();

        // Adjust for times crossing midnight
        let adjustedBookingTime = bookingTime;
        if (bookingTime.getHours() < 12 && adjustedBookingTime.getHours() < 12) {
            adjustedBookingTime = add(adjustedBookingTime, { days: 1 });
        }

        // Additional condition: Check if pickup time is within 24 hours
        if (differenceInHours(bookingTime, now) < 24) {
            return {
                isValid: false,
                error: 'Vehicle delivery is not available for trips starting within 24 hours.'
            };
        }

        // Check if the booking time falls within the restricted range
        if ((isAfter(adjustedBookingTime, startOfRange) || isBefore(adjustedBookingTime, endOfRange)) && isCustomDelivery) {
            return {
                isValid: false,
                error: `Vehicle delivery is unavailable between ${format(startOfRange, 'h:mm aa')} and ${format(endOfRange, 'h:mm aa')}.`
            };
        }
    }

    return {
        isValid: true,
        error: ''
    };
}
