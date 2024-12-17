import { QUERY_KEYS } from '@/constants/query-keys';
import { getDriverLicenseDetails, getGuestsHistory, getGuestsOfHost } from '@/server/guests';
import type { Channel } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const useAllGuestsOfHost = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.allDriversOfHost],
        queryFn: async () => getGuestsOfHost()
    });
};

export const useGuestsHistory = (driverId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.guestsRentalHistory, { driverId }],
        queryFn: async () => getGuestsHistory(driverId)
    });
};

export const useDriverLicenseDetails = (requestId: string, channel: Channel) => {
    return useQuery({
        queryKey: [QUERY_KEYS.driverLicenseDetails, { requestId, channel }],
        queryFn: async () => getDriverLicenseDetails(requestId, channel)
    });
};
