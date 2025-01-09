'use client';

import { PAGE_ROUTES } from '@/constants/routes';
import { formatDateAndTime } from '@/lib/utils';
import Link from 'next/link';

interface TripDriverDetailsProps {
    avatarSrc: string | null;
    name: string;
    className?: string;
    userId: number;
    tripId: number;
    createdDate: string;
    zipcode: string;
}

export default function TripDriverDetails({
    avatarSrc,
    name,
    className = '',
    userId,
    tripId,
    createdDate,
    zipcode
}: TripDriverDetailsProps) {
    return (
        <div className={`flex w-fit items-center gap-3 ${className} `}>
            <Link
                prefetch={false}
                href={`${PAGE_ROUTES.GUESTS}/${userId}`}
                className='relative size-10 overflow-hidden rounded-full border md:size-14'>
                <img src={avatarSrc || '/images/dummy_avatar.png'} alt={name} className='h-full w-full object-cover object-center' />
            </Link>
            <div className='flex flex-col gap-1'>
                <Link
                    prefetch={false}
                    href={`${PAGE_ROUTES.GUESTS}/${userId}`}
                    className='max-w-24 truncate font-semibold hover:underline hover:underline-offset-2 md:max-w-fit md:text-lg'>
                    {name}
                </Link>
                <Link
                    prefetch={false}
                    href={`${PAGE_ROUTES.TRIP_DETAILS}/${tripId}`}
                    className='hidden font-normal hover:underline hover:underline-offset-2 md:block'>
                    (Trip #{tripId})
                </Link>
                <p className='text-muted-foreground text-sm'>{formatDateAndTime(createdDate, zipcode, 'MMM DD, YYYY, h:mm A')}</p>
            </div>
        </div>
    );
}
