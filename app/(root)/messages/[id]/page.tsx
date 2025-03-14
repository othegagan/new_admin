'use client';

import { ChatHeaderSkeleton } from '@/components/skeletons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PAGE_ROUTES } from '@/constants/routes';
import { useTripDetails } from '@/hooks/useTrips';
import { formatDateAndTime, toTitleCase } from '@/lib/utils';
import type { Trip } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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

    return (
        <div className='mb-1 flex w-full flex-none items-start justify-between gap-1 rounded-t-md border-b py-1'>
            <button type='button' className='px-0 sm:hidden' onClick={() => router.back()}>
                <ArrowLeft className='size-5' /> <span className='sr-only'>Back</span>
            </button>
            <div className='flex flex-1 gap-3 md:px-4 md:py-1 lg:gap-4'>
                <Link href={`${PAGE_ROUTES.GUESTS}/${trip.userid}`} prefetch={false}>
                    <Avatar className=' size-10 border md:size-16'>
                        <AvatarImage src={trip.userImage || '/images/dummy_avatar.png'} alt={trip.userFirstName || 'Guest'} />
                        <AvatarFallback>{trip?.userFirstName?.[0]}</AvatarFallback>
                    </Avatar>
                </Link>

                <div className='flex flex-1 flex-col '>
                    <Link
                        href={`${PAGE_ROUTES.GUESTS}/${trip.userid}`}
                        prefetch={false}
                        className='w-fit font-semibold text-sm underline-offset-1 hover:underline'>
                        <h5 className='w-fit capitalize'>{`${trip.userFirstName} ${trip.userlastName}`}</h5>
                    </Link>

                    <div className='mb-1 w-full flex-between gap-2 text-sm'>
                        <Link
                            href={`${PAGE_ROUTES.TRIP_DETAILS}/${tripId}`}
                            prefetch={false}
                            className=' flex w-fit gap-2 text-muted-foreground underline-offset-2 hover:underline'>
                            <span>Trip #{trip.tripid}</span> <span>({trip.channelName})</span>
                        </Link>

                        <div className='w-fit rounded bg-[#d1d1d1] p-1.5 font-medium text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                            {trip.status}
                        </div>
                    </div>

                    <Link
                        href={`${PAGE_ROUTES.VEHICLES}/${trip.vehicleId}${PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR}`}
                        prefetch={false}
                        className='w-fit text-muted-foreground text-sm underline-offset-1 hover:underline'>
                        {toTitleCase(`${trip.vehmake} ${trip.vehmodel} ${trip.vehyear}`)}{' '}
                        <span className='font-semibold'>({trip.vehicleNumber})</span>
                    </Link>

                    <div className='mt-1 w-fit text-muted-foreground text-sm'>
                        {formatDateAndTime(trip.starttime, trip.vehzipcode, 'MMM DD, h:mm A')} -{' '}
                        {formatDateAndTime(trip.endtime, trip.vehzipcode, 'MMM DD, h:mm A')}
                    </div>
                </div>
            </div>
        </div>
    );
}
