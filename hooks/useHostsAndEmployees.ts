import { QUERY_KEYS } from '@/constants/query-keys';
import { getAllHostEmployees, getAllHosts } from '@/server/hosts';
import { useQuery } from '@tanstack/react-query';

export const useHosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.allHosts],
        queryFn: async () => getAllHosts()
    });
};

export const useEmployees = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.allEmployees],
        queryFn: async () => getAllHostEmployees()
    });
};
