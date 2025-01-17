import { QUERY_KEYS } from '@/constants/query-keys';
import { getAllTripsOfHost, getReviewRequiredTrips, getTripDetails, getVehiclesForSwap } from '@/server/trips';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useAllTrips = (startDate: string, endDate: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.allTripsOfHost, { startDate, endDate }],
        queryFn: async () => getAllTripsOfHost(startDate, endDate)
    });
};

export const useDailyViewTrips = (startDate: string, endDate: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.allDailyViewTrips, { startDate, endDate }],
        queryFn: async () => getAllTripsOfHost(startDate, endDate)
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

export const useTripDetails = (tripId: string | number) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [QUERY_KEYS.tripDetails, { tripId }],
        queryFn: async () => getTripDetails(Number(tripId)),
        refetchOnWindowFocus: true,
        staleTime: 0
    });

    const refetchAll = () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.tripDetails]
        });
    };

    return { ...query, refetchAll };
};

export const useVehiclesForSwap = (payload: any) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [QUERY_KEYS.vehiclesForSwap, { ...payload }],
        queryFn: async () => getVehiclesForSwap(payload),
        refetchOnWindowFocus: true,
        staleTime: 0,
        enabled: !!payload
    });

    const refetchAll = () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.vehiclesForSwap]
        });
    };

    return { ...query, refetchAll };
};
