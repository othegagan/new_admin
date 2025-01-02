'use client';

import { Main } from '@/components/layout/main';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { useTripDetails, useVehiclesForSwap } from '@/hooks/useTrips';
import { convertToTimeZoneISO, formatDateAndTime } from '@/lib/utils';
import type { Trip } from '@/types';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import SwapDialog from '../../_components/swap/swap-dialog';
import SwapVehiclesList from '../../_components/swap/swap-vehicles-list';
import useSwapDialog from '../../_components/swap/useSwapDialog';

type SwapPageProps = Promise<{ tripId: string }>;

export default function SwapPage({ params }: { params: SwapPageProps }) {
    const router = useRouter();
    const { tripId } = use(params);

    const {
        data: tripResponse,
        isLoading: isTripDetialsLoading,
        isError: isTripDetialsError,
        error: tripDetialsError
    } = useTripDetails(tripId);

    if (isTripDetialsLoading) return <CarLoadingSkeleton />;
    if (isTripDetialsError) return <div>Error: {tripDetialsError.message}</div>;
    if (!tripResponse?.success) return <div>Error: {tripResponse?.message}</div>;
    if (!tripResponse.data.activetripresponse?.length) return <div>Error: No trip details found</div>;

    const trip: Trip = tripResponse.data.activetripresponse[0];

    return (
        <Main fixed className='mx-auto h-full w-full max-w-[1600px] py-4'>
            <header className='pb-2'>
                <div className='flex items-center'>
                    <button
                        type='button'
                        onClick={() => router.back()}
                        className='flex items-center font-medium text-muted-foreground text-sm'>
                        <ChevronLeft className='mr-2 h-4 w-4' /> Back
                    </button>
                </div>
            </header>

            <SwapVehiclesFetch trip={trip} />

            <SwapDialog />
        </Main>
    );
}

function SwapVehiclesFetch({ trip }: { trip: Trip }) {
    const swapDialog = useSwapDialog();

    swapDialog.tripId = trip.tripid;
    swapDialog.userId = trip.userid;
    swapDialog.hostId = trip.hostid;
    swapDialog.currentVehicleDetails = { ...trip.vehicleDetails[0], number: trip.vehicleNumber };

    const start = {
        date: formatDateAndTime(trip.starttime, trip.vehzipcode, 'YYYY-MM-DD'),
        time: formatDateAndTime(trip.starttime, trip.vehzipcode, 'HH:mm:ss')
    };
    const end = {
        date: formatDateAndTime(trip.endtime, trip.vehzipcode, 'YYYY-MM-DD'),
        time: formatDateAndTime(trip.endtime, trip.vehzipcode, 'HH:mm:ss')
    };

    const startTime = convertToTimeZoneISO(`${start.date}T${start.time}`, trip.vehzipcode);
    const endTime = convertToTimeZoneISO(`${end.date}T${end.time}`, trip.vehzipcode);

    const payload = {
        startTs: startTime,
        endTS: endTime,
        pickupTime: startTime,
        dropTime: endTime,
        vehicleId: trip.vehicleId,
        hostId: trip.hostid,
        delivery: trip.delivery,
        airportDelivery: trip.airportDelivery
    };

    const {
        data: vehiclesForSwapResponse,
        isLoading: isVehiclesForSwapLoading,
        isError: isVehiclesForSwapError,
        error: vehiclesForSwapError
    } = useVehiclesForSwap(payload);

    if (isVehiclesForSwapLoading) return <CarLoadingSkeleton />;
    if (isVehiclesForSwapError) return <div>Error: {vehiclesForSwapError.message}</div>;
    if (!vehiclesForSwapResponse?.success) return <div>Error: {vehiclesForSwapResponse?.message}</div>;

    const vehiclesForSwap = vehiclesForSwapResponse?.data.vehicleAllDetails || [];

    return (
        <div className='flex w-full flex-col gap-4'>
            <div className='space-y-2'>
                <h3>Swap Vehicle</h3>
                <p className='text-muted-foreground text-sm'>Explore all available vehicles for swap selection</p>
            </div>

            <div className='font-semibold text-lg'>{vehiclesForSwap.length} vehicles available for swap</div>

            {vehiclesForSwap.length === 0 ? (
                <div className='flex h-full w-full items-center justify-center'>
                    <p>No vehicles found for swap</p>
                </div>
            ) : (
                <SwapVehiclesList swapVehicles={vehiclesForSwap} />
            )}
        </div>
    );
}
