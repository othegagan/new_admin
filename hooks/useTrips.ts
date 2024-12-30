import { QUERY_KEYS } from '@/constants/query-keys';
import { getAllMasterHostCheckList, getAllTripsOfHost, getReviewRequiredTrips, getTripDetails } from '@/server/trips';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useAllTrips = (startTime: string, endTime: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.allTripsOfHost, { startTime, endTime }],
        queryFn: async () => getAllTripsOfHost(startTime, endTime)
    });
};

export const useDailyViewTrips = (startTime: string, endTime: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.allDailyViewTrips, { startTime, endTime }],
        queryFn: async () => getAllTripsOfHost(startTime, endTime)
    });
};

export const useReviewRequiredTrips = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [QUERY_KEYS.allReviewRequiredTrips],
        queryFn: async () => getReviewRequiredTrips(),
        staleTime: 0
    });

    const refetchAll = () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.allReviewRequiredTrips]
        });
    };

    return { ...query, refetchAll };
};

export const useTripDetails = (bookingId: string | number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.tripDetails, { bookingId }],
        queryFn: async () => getTripDetails(Number(bookingId)),
        refetchOnWindowFocus: true,
        staleTime: 0
    });
};

export const useAllMasterHostCheckList = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.allMasterHostCheckList],
        queryFn: async () => getAllMasterHostCheckList()
    });
};
