import { env } from '@/env';

export async function addressSearchUsingMapbox(addressSeach: string) {
    try {
        const searchCountry = env.NEXT_PUBLIC_MAPBOX_SEARCH_COUNTRY;
        const searchLimit = env.NEXT_PUBLIC_MAPBOX_SEARCH_LIMIT;
        const responseLanguage = env.NEXT_PUBLIC_MAPBOX_RESPONSE_LANGUAGE;
        const accessToken = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        const baseURL = env.NEXT_PUBLIC_MAPBOX_BASE_URL;

        let url = '';

        url = `${baseURL}${addressSeach}.json?country=${searchCountry}&limit=${searchLimit}&proximity=ip&types=postcode,address&language=${responseLanguage}&access_token=${accessToken}`;

        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const forwardGeoCodingLocationData = data.features;

        const suggestions = extractAddressFromJson(forwardGeoCodingLocationData);
        return suggestions;
    } catch (error: any) {
        console.error('Error fetching data from Mapbox:', error);
        throw new Error('Error fetching data from Mapbox:');
    }
}

const extractAddressFromJson = (data: any) => {
    const addressSuggestionsFromMapBox = [];

    for (const item of data) {
        const placeName = item.place_name;
        const longitude = item.center[0];
        const latitude = item.center[1];
        const components = placeName?.split(',');

        const address1 = components[0]?.trim();
        const city = components[1]?.trim();
        const stateZip = components[2]?.trim();

        let state = '';
        let zipcode = '';

        // Use regex to separate state and zip code
        const stateZipMatch = stateZip?.match(/^(.+)\s+(\d{5})$/);
        if (stateZipMatch) {
            state = stateZipMatch[1]?.trim();
            zipcode = stateZipMatch[2]?.trim();
        } else {
            // Fallback if no zip code is found
            state = stateZip;
        }

        const locationSuggestion = {
            placeName,
            address1,
            city,
            state,
            zipcode,
            latitude,
            longitude
        };
        addressSuggestionsFromMapBox.push(locationSuggestion);
    }

    return addressSuggestionsFromMapBox;
};
