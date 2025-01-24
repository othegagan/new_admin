'use client';

import { Main } from '@/components/layout/main';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { DEFAULT_ZIPCODE } from '@/constants';
import { useTelematicsData } from '@/hooks/useVehicles';
import type { TelematicsData } from '@/types';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { TripDetails } from './_components/trip-details';
import { TripList } from './_components/trip-list';

export default function TelematicsTrips() {
    const { vehicleId } = useParams();
    const [selectedTrip, setSelectedTrip] = useState<TelematicsData | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const {
        data: telematicsResponse,
        isLoading: isLoadingTelematicsData,
        error: errorTelematicsData
    } = useTelematicsData(Number(vehicleId));

    if (isLoadingTelematicsData) {
        return (
            <div className='flex h-full w-full items-center justify-center'>
                <CarLoadingSkeleton />
            </div>
        );
    }

    if (errorTelematicsData) {
        return <div>Error: {errorTelematicsData?.message}</div>;
    }

    if (!telematicsResponse?.success) {
        return <div>Error: {telematicsResponse?.message}</div>;
    }

    const telematicsData = telematicsResponse?.data?.tripData || [];

    const zipcode = telematicsResponse.data.zipcode || DEFAULT_ZIPCODE;

    if (!telematicsData.length) {
        return <div>No telematics data found</div>;
    }

    const handleTripSelect = (trip: TelematicsData) => {
        setSelectedTrip(trip);
        setIsSheetOpen(true);
    };

    return (
        <Main fixed className='grid h-full p-0 md:grid-cols-[550px_1fr]'>
            <TripList telematicsData={telematicsData} onTripSelect={handleTripSelect} zipcode={zipcode} />

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side='right' className='w-full sm:max-w-lg'>
                    <TripDetails selectedTrip={selectedTrip} zipcode={zipcode} />
                </SheetContent>
            </Sheet>
        </Main>
    );
}
