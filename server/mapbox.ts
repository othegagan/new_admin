import { env } from '@/env';

import axios from 'axios';

export async function getMapboxSuggestions(query: string, searchType: 'general' | 'address') {
    const {
        NEXT_PUBLIC_MAPBOX_SEARCH_COUNTRY: searchCountry,
        NEXT_PUBLIC_MAPBOX_SEARCH_LIMIT: searchLimit,
        NEXT_PUBLIC_MAPBOX_RESPONSE_LANGUAGE: responseLanguage,
        NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: accessToken,
        NEXT_PUBLIC_MAPBOX_BASE_URL: baseURL
    } = env;

    const types = searchType === 'general' ? 'place,postcode,address,poi,district,locality,neighborhood' : 'postcode,address';

    const url = `${baseURL}${encodeURIComponent(query)}.json?country=${searchCountry}&limit=${searchLimit}&proximity=ip&types=${types}&language=${responseLanguage}&access_token=${accessToken}`;

    try {
        const response = await axios.get(url);

        if (response.status !== 200) {
            throw new Error('Error fetching data from Mapbox');
        }

        return response.data.features;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error fetching data from Mapbox: ${error.message}`);
        }
        throw new Error('Error fetching data from Mapbox');
    }
}
