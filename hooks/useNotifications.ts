import { QUERY_KEYS } from '@/constants/query-keys';
import { checkForNotifications, getAllNotifications, markMessageNotificationAsRead, markNotificationAsRead } from '@/server/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAllNotifications = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.allNotifications],
        refetchOnWindowFocus: false,
        queryFn: async () => getAllNotifications()
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
