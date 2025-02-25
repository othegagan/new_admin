import { QUERY_KEYS } from '@/constants/query-keys';
import { getActivityLogs } from '@/server/hosts';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const useActivityLogs = () => {
    const queryClient = new QueryClient();

    const query = useQuery({
        queryKey: [QUERY_KEYS.activityLogs],
        queryFn: async () => getActivityLogs()
    });

    const refetchAll = () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.activityLogs]
        });
    };

    return { ...query, refetchAll };
};
