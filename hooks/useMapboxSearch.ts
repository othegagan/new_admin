import { addressSearchUsingMapbox } from '@/server/mapbox';
import { useCallback, useState } from 'react';

export const useMapboxSearch = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAdresses = useCallback(async (query: string) => {
        setLoading(true);
        setError(null);
        try {
            const response: any = await addressSearchUsingMapbox(query);
            setData(response || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Something went wrong! Try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, fetchAdresses };
};
