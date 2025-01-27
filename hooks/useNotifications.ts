import { QUERY_KEYS } from '@/constants/query-keys';
import {
    checkForNotifications,
    getAllMessageNotifications,
    getAllNotifications,
    markMessageNotificationAsRead,
    markNotificationAsRead
} from '@/server/notifications';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function usePaginatedNotifications() {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.allNotifications],
        queryFn: async ({ pageParam = 0 }) => {
            const response = await getAllNotifications(pageParam);
            if (!response.success) {
                throw new Error(response.message);
            }
            return response.data;
        },
        getNextPageParam: (lastPage) => {
            return lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined;
        },
        initialPageParam: 0
    });
}

export const useAllMessageNotifications = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.allMessageNotifications],
        refetchOnWindowFocus: false,
        queryFn: async () => getAllMessageNotifications()
    });
};

export const useCheckNotifications = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.checkNotifications],
        refetchOnWindowFocus: true,
        refetchInterval: 7000,
        queryFn: async () => {
            const response = await checkForNotifications();
            return response;
        }
    });
};

export const useMarkNotificationAsRead = (id: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await markNotificationAsRead(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allNotifications] });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allNotifications] });
        }
        // onError: () => {}
    });
};

export const useMarkMessageNotificationAsRead = (tripId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            await markMessageNotificationAsRead(tripId);
        },
        onSuccess: () => {
            // console.log('refetch all notifications');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.allNotifications] });
        }
        // onError: () => {}
    });
};
