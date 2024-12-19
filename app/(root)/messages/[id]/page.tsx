'use client';

import { ChatHeaderSkeleton } from '@/components/skeletons';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { useTripDetails } from '@/hooks/useTrips';
import type { Trip } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import MainMessageComponent from '../_components/MainMessage';

export default function MessageDetail() {
    const params = useParams();
    const tripId = Number(params.id);

    return (
        <div className='inset-0 left-full z-50 flex h-full w-full flex-1 flex-col rounded-md bg-background shadow-sm sm:static sm:z-auto md:border'>
            <ChatHeader tripId={tripId} />

            <div className='inset-0 left-full z-50 flex h-full w-full flex-1 flex-col rounded-md bg-background shadow-sm sm:static sm:z-auto'>
                <MainMessageComponent tripId={tripId} className='h-full lg:h-full' />
            </div>
        </div>
    );
}

function ChatHeader({ tripId }: { tripId: number }) {
    const router = useRouter();
    const { data: response, isLoading, isError, error } = useTripDetails(tripId);

    if (isLoading) {
        return (
            <div className='mb-1 flex flex-none justify-between rounded-t-md border-b pb-2'>
                <ChatHeaderSkeleton />
            </div>
        );
    }

    if (isError) {
        return <div>Error: {error?.message}</div>;
    }

    if (!response?.success) {
        return <div>Error: {response?.message}</div>;
    }

    const trip: Trip = response?.data?.activetripresponse[0];
    //{toTitleCase(`${booking?.vehmake} ${booking?.vehmodel} ${booking?.vehyear}`)} ({booking.vehicleNumber})

    return (
        <div className='mb-1 flex flex-none justify-between rounded-t-md border-b pb-2'>
            <div className='flex gap-3'>
                <button type='button' className='px-0 sm:hidden' onClick={() => router.back()}>
                    <ArrowLeft /> <span className='sr-only'>Back</span>
                </button>
                <div className='flex items-center gap-2 md:px-4 md:py-1 lg:gap-4'>
                    <Avatar className='h-12 w-12 border'>
                        <AvatarImage src={trip.userImage || '/images/dummy_avatar.png'} alt={trip.userFirstName || 'Guest'} />
                    </Avatar>

                    <div>
                        <h5 className='capitalize'>{`${trip.userFirstName} ${trip.userlastName}`}</h5>
                        <p>{trip.vehicleNumber}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
