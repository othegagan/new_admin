'use client';

import { Main } from '@/components/layout/main';
import { env } from '@/env';
import dynamic from 'next/dynamic';
import { useState } from 'react';

// Dynamically import the SearchBox component with no SSR
//@ts-ignore
const SearchBox = dynamic(() => import('@mapbox/search-js-react').then((mod) => mod.SearchBox), { ssr: false });

export default function Page() {
    const [value, setValue] = useState(
        'Austin-Bergstrom International Airport 3600 Presidential Boulevard, Austin, Texas 78719, United States'
    );
    const [locationDetails, setLocationDetails] = useState({
        name: '',
        address1: '',
        city: '',
        state: '',
        zipcode: '',
        latitude: '',
        longitude: ''
    });

    const handleChange = (d: any) => {
        setValue(d);
    };

    const parseLocationDetails = (data: any) => {
        const feature = data.features[0];
        if (!feature) return;

        const properties = feature.properties;
        const context = properties.context;

        setLocationDetails({
            name: properties.name || properties.name_preferred || '',
            address1: properties.address || '',
            city: context.place?.name || '',
            state: context.region?.name || '',
            zipcode: context.postcode?.name || '',
            latitude: properties.coordinates.latitude.toString() || '',
            longitude: properties.coordinates.longitude.toString() || ''
        });

        setValue((prev) => {
            return `${properties.name || properties.name_preferred} ${prev}`;
        });
    };

    return (
        <Main>
            {/* Only render SearchBox on client side */}
            <div className='w-full max-w-xl'>
                <SearchBox
                    options={{
                        proximity: 'ip',
                        // types: 'postcode,address',
                        types: 'place,postcode,address,poi,district,locality,neighborhood',
                        language: 'en',
                        country: 'us',
                        limit: 6
                    }}
                    value={value}
                    onChange={handleChange}
                    onRetrieve={(d: any) => {
                        const fullAddress = d.features[0]?.properties.full_address || '';
                        setValue(fullAddress);
                        parseLocationDetails(d);
                    }}
                    onClear={() => {
                        setValue('');
                        setLocationDetails({
                            name: '',
                            address1: '',
                            city: '',
                            state: '',
                            zipcode: '',
                            latitude: '',
                            longitude: ''
                        });
                    }}
                    accessToken={env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                    placeholder='Search for a place'
                />
            </div>

            <div className='mt-8 space-y-2'>
                <div>Full Address: {value}</div>
                <div>Place Name: {locationDetails.name}</div>
                <div>Address: {locationDetails.address1}</div>
                <div>City: {locationDetails.city}</div>
                <div>State: {locationDetails.state}</div>
                <div>Zipcode: {locationDetails.zipcode}</div>
                <div>Latitude: {locationDetails.latitude}</div>
                <div>Longitude: {locationDetails.longitude}</div>
            </div>
        </Main>
    );
}
