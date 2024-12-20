import { QUERY_KEYS } from '@/constants/query-keys';
import { getAllChannels } from '@/server/dynamicPricingAndUnavailability';
import { useQuery } from '@tanstack/react-query';

export const useChannels = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.allChannels],
        queryFn: async () => getAllChannels()
    });
};
