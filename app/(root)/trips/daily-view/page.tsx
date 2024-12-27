'use client';

import { useDailyViewTrips } from '@/hooks/useTrips';
import { useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { searchAndFilterTrips } from '../_components/searchAndFilter';
import TripCard from './trip-card';

export default function DailayViewPage() {
    const { response, dailyViewObjects, isLoading, isError, error } = useDailyViewTrips();

    if (isLoading) {
        return <div>Loading Daily View...</div>;
    }

    if (isError) {
        return <div>Error {error?.message}</div>;
    }

    if (!response?.success) {
        return <div>{response?.message}</div>;
    }

    if (!isLoading && response?.success && response.data?.activetripresponse?.length === 0) {
        return <div>No Trips</div>;
    }

    return <DailyTripsSearch initialData={dailyViewObjects} />;
}

function DailyTripsSearch({ initialData }: any) {
    const [searchTerm] = useQueryState('search', { defaultValue: '' });
    const [channelName] = useQueryState('channel', { defaultValue: '' });
    const [tripStatus] = useQueryState('status', { defaultValue: '' });

    const filteredData = useMemo(() => {
        return searchAndFilterTrips(initialData, searchTerm, channelName, tripStatus);
    }, [initialData, searchTerm, channelName, tripStatus]);

    return <TripCard tripsData={filteredData} />;
}
