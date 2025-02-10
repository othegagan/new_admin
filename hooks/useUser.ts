import { QUERY_KEYS } from '@/constants/query-keys';
import { getUserByEmail } from '@/server/user';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const useUser = () => {
    const queryClient = new QueryClient();

    const query = useQuery({
        queryKey: [QUERY_KEYS.userDetails],
        queryFn: async () => getUserByEmail()
    });

    const refetchAll = () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.userDetails]
        });
    };

    return { ...query, refetchAll };
};
