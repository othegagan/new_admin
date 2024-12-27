'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { cn, formatDateAndTime, getFullAddress, toTitleCase } from '@/lib/utils';
import { UserAlertIcon, UserCheckIcon } from '@/public/icons';
import type { Trip } from '@/types';
import { format } from 'date-fns';
import { CalendarDays, ChevronRight, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from 'react-responsive';

export default function TripCard({ tripsData }: { tripsData: any }) {
    if (Array.isArray(tripsData)) {
        // Handle array of bookings
        return (
            <ScrollArea className='flex h-[calc(100dvh_-_100px)] w-full flex-col'>
                {tripsData.map((bookingInfo: any) => (
                    <div key={bookingInfo.tripid} className='mx-auto mb-4 flex flex-col md:max-w-5xl'>
                        <BookingInfo bookingInfo={bookingInfo} />
                    </div>
                ))}
            </ScrollArea>
        );
    }
    // Handle object of bookings
    return (
        <ScrollArea className='flex h-[calc(100dvh_-_100px)] w-full flex-col'>
            {Object.keys(tripsData).map((date: string) => (
                <div key={date} className='mx-auto mb-4 flex flex-col md:max-w-5xl'>
                    <div className='sticky top-0 z-20 mb-2 bg-background shadow-sm md:mb-0'>
                        <div className='mx-auto w-fit rounded-sm border border-black/20 bg-background p-3 py-1 text-center font-medium text-14'>
                            {format(new Date(date), 'PPP')}
                        </div>
                    </div>
                    {Object.values(tripsData[date]).map((bookingInfo: any) => (
                        <div key={bookingInfo.tripid}>
                            <BookingInfo bookingInfo={bookingInfo} />
                        </div>
                    ))}
                </div>
            ))}
        </ScrollArea>
    );
}

export function BookingInfo({ bookingInfo }: { bookingInfo: Trip }) {
    const router = useRouter();
    const isTabletOrLarger = useMediaQuery({ query: '(min-width: 768px)' });

    const fullName = toTitleCase(`${bookingInfo.vehmake} ${bookingInfo.vehmodel} ${bookingInfo.vehyear}`);

    const address = getFullAddress({ tripDetails: bookingInfo });

    const vehicleImageURL = bookingInfo.vehicleImages[0]?.imagename || 'images/image_not_available.png';

    const driverActionsStatus =
        bookingInfo.isLicenseVerified && bookingInfo.isPhoneVarified && bookingInfo.isRentalAgreed ? 'complete' : 'pending';

    const startDate = formatDateAndTime(bookingInfo.starttime, bookingInfo.vehzipcode, 'MMM DD, YYYY | h:mm A ');
    const endDate = formatDateAndTime(bookingInfo.endtime, bookingInfo.vehzipcode, 'MMM DD, YYYY | h:mm A  ');

    function VehicleNameAndPlate({
        name = '',
        plate = ''
    }: {
        name: string;
        plate: string;
    }) {
        return (
            <div
                className={`truncate font-bold ${isTabletOrLarger ? 'max-w-[200px] text-[18px] md:max-w-sm' : 'max-w-[200px] text-16 md:max-w-sm'}`}>
                {name}
                <div className='mt-1 font-medium text-14 text-muted-foreground md:text-16'>{plate}</div>
            </div>
        );
    }

    function BookingDates({
        startDate = '',
        endDate = ''
    }: {
        startDate: string;
        endDate: string;
    }) {
        return (
            <div className='flex w-full items-center gap-2'>
                <CalendarDays className='size-4' />
                <div className='text-14'>
                    {startDate} - {endDate}
                </div>
            </div>
        );
    }

    function VehicleImage() {
        return (
            <div className='col-span-2 size-24 h-20 flex-center overflow-hidden rounded-md border md:h-32 md:w-full'>
                <img src={vehicleImageURL} alt='car' className='h-full w-full object-cover object-center' />
            </div>
        );
    }

    function Location() {
        return (
            <div className='flex-center justify-start gap-2 text-14'>
                <MapPin className='size-4' />
                <p className={`truncate capitalize ${isTabletOrLarger ? 'max-w-[300px] md:max-w-[400px]' : 'max-w-[280px]'}`}>{address}</p>
            </div>
        );
    }

    function BookingStatus({ status = '' }: { status: string }) {
        enum CategoryText {
            'Starts at' = 0,
            'Started at' = 1,
            'Ends at' = 2,
            'Ended at' = 3
        }
        if (bookingInfo.category !== undefined) {
            const date = bookingInfo.category === 0 || bookingInfo.category === 1 ? bookingInfo.starttime : bookingInfo.endtime;
            const time = formatDateAndTime(date, bookingInfo.vehzipcode, 'MMM DD, h:mm A');
            const text = `${CategoryText[bookingInfo.category]} ${time}`;

            return <div className='ml-auto w-fit bg-[#0A4AC620] px-2 py-1 font-bold text-14'>{text}</div>;
        }

        return <div className='ml-auto w-fit bg-[#0A4AC620] px-2 py-1 font-bold text-14'>{status}</div>;
    }

    function DriverDetails({
        name = '',
        image = ''
    }: {
        name: string;
        image: string | null;
    }) {
        return (
            <div className='flex-center justify-start gap-2'>
                <div className='text-14'>Booked By:</div>
                <div className='flex-center justify-start gap-2 text-14'>
                    <div className='relative size-7 overflow-hidden rounded-full border'>
                        <img src={image || '/images/dummy_avatar.png'} alt={name} className='h-full w-full object-cover object-center' />
                    </div>
                    <p className='font-semibold text-neutral-600'>{name}</p>
                </div>
            </div>
        );
    }

    const bookingDetailsLink = `/booking/${bookingInfo.tripid}/details`;

    if (isTabletOrLarger) {
        return (
            <div
                onClick={() => router.push(bookingDetailsLink)}
                className='grid w-full grid-cols-12 gap-4 border-b py-3 hover:cursor-pointer hover:rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700'>
                <VehicleImage />

                <div className='col-span-5 flex w-full flex-col gap-2'>
                    <VehicleNameAndPlate name={fullName} plate={bookingInfo.vehicleNumber} />

                    <div className='mt-auto space-y-3'>
                        <BookingDates startDate={startDate} endDate={endDate} />
                        <Location />
                    </div>
                </div>

                <div className='col-span-4 flex h-fit flex-col gap-2'>
                    <div className='flex-center justify-start gap-2 text-14'>
                        <ChannelName name={bookingInfo.channelName} />
                        <BookingStatus status={bookingInfo.status} />
                    </div>
                    <div className='flex flex-col gap-2 text-15'>
                        <div className='text-14'>Booking ID: {bookingInfo.tripid}</div>
                        <DriverDetails name={`${bookingInfo.userFirstName} ${bookingInfo.userlastName}`} image={bookingInfo.userImage} />
                    </div>

                    <DriverActionsStatus status={driverActionsStatus} variant='full' />
                </div>

                <div className='ml-[40px] flex w-[4px] flex-col items-center justify-center'>
                    <ChevronRight className='size-5 text-muted-foreground' />
                </div>
            </div>
        );
    }

    // Small Device Card
    return (
        <div
            onClick={() => router.push(bookingDetailsLink)}
            className='flex flex-1 flex-col text-nowrap border-b py-2.5 hover:cursor-pointer hover:rounded-md hover:bg-neutral-100'>
            <div className='mb-2 flex gap-3 md:gap-4'>
                <VehicleImage />

                <div className='flex flex-1 flex-col justify-between'>
                    <VehicleNameAndPlate name={fullName} plate={bookingInfo.vehicleNumber} />

                    <div className='mt-2 flex-center justify-between'>
                        <ChannelName name={bookingInfo.channelName} />
                        <BookingStatus status={bookingInfo.status} />
                    </div>
                </div>
            </div>

            <Location />

            <div className='mt-1.5 flex items-center justify-between pl-1.5'>
                <DriverDetails name={`${bookingInfo.userFirstName} ${bookingInfo.userlastName}`} image={bookingInfo.userImage} />
                <DriverActionsStatus status={driverActionsStatus} variant='icon' />
            </div>
        </div>
    );
}

function DriverActionsStatus({
    status,
    variant = 'icon'
}: {
    status: 'complete' | 'pending';
    variant?: 'icon' | 'full';
}) {
    return (
        <div className='flex-center justify-start gap-2 text-14'>
            {status === 'complete' && <UserCheckIcon />}
            {status === 'pending' && <UserAlertIcon />}
            <p
                className={cn(
                    'font-medium capitalize tracking-tight',
                    { 'text-[#5BAB0A]': status === 'complete' },
                    { 'text-[#E1AB09]': status === 'pending' },
                    { 'hidden md:flex': variant === 'icon' },
                    { flex: variant === 'full' }
                )}>
                Driver Actions {status}
            </p>
        </div>
    );
}

export function ChannelName({ name = '' }: { name: string }) {
    return <div className='w-fit rounded border px-2 font-bold text-14 text-[#707070]'>{name}</div>;
}
