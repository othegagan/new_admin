import { QUERY_KEYS } from '@/constants/query-keys';
import { getHostConstraint } from '@/server/configurations';
import { useQuery } from '@tanstack/react-query';

export const useHostConfigutations = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.hostConstraints],
        queryFn: async () => getHostConstraint(),
        refetchOnWindowFocus: true
    });
};
