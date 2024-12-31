'use client';

import ImagePreview from '@/components/ui/image-preview';
import { PAGE_ROUTES } from '@/constants/routes';
import { checkForTuroTrip, formatDateAndTime, getFullAddress, toTitleCase } from '@/lib/utils';
import type { Trip } from '@/types';
import { MapPin } from 'lucide-react';
import Link from 'next/link';

export default function TripSummary({ trip }: { trip: Trip }) {
    const channel = trip.channelName;
    const carName = toTitleCase(`${trip.vehmake} ${trip.vehmodel} ${trip.vehyear}`);
    const carImage = trip.vehicleImages[0]?.imagename || '/images/image_not_available.png';
    const vehicleId = trip.vehicleId;
    const licensePlate = trip.vehzipcode;
    const perDayAmount = trip.tripPaymentTokens[0]?.perdayamount;

    const status = trip.status;

    const tripStart = {
        date: formatDateAndTime(trip.starttime, trip.vehzipcode, 'MMM DD, YYYY'),
        time: formatDateAndTime(trip.starttime, trip.vehzipcode, 'h:mm A ')
    };
    const tripEnd = {
        date: formatDateAndTime(trip.endtime, trip.vehzipcode, 'MMM DD, YYYY'),
        time: formatDateAndTime(trip.endtime, trip.vehzipcode, 'h:mm A ')
    };
    const location = getFullAddress({ tripDetails: trip });

    // const isCustomDelivery = trip.isCustomDelivery;
    // const isAirportDelivery = trip.isAirportDelivery;

    const totaldays = `${trip?.tripPaymentTokens[0]?.totaldays} ${trip?.tripPaymentTokens[0]?.totaldays > 1 ? 'Days' : 'Day'} `;

    const isTuroTrip = checkForTuroTrip(trip.channelName);

    return (
        <div className='flex flex-col gap-5'>
            <div className='flex-between gap-4'>
                <h4>Trip Summary</h4>
                <div className='w-fit rounded bg-[#d1d1d1] p-1.5 font-medium text-xs md:px-5 lg:text-[14px] dark:bg-accent'>{status}</div>
            </div>

            <div className='flex w-full flex-1 gap-3'>
                <div className='relative'>
                    <div className='absolute top-0 z-10 w-fit rounded border bg-white px-2 font-bold text-black text-sm capitalize'>
                        {channel}
                    </div>
                    <ImagePreview
                        url={carImage}
                        alt={carName}
                        className='col-span-2 h-20 w-32 flex-center overflow-hidden rounded-md border md:h-32 md:w-44'
                    />
                    {/* <Avatar className='col-span-2 h-20 w-32 flex-center overflow-hidden rounded-md border md:h-32 md:w-44'>
                        <AvatarImage className='h-full w-full object-cover object-center' src={carImage} alt={carName} />
                    </Avatar> */}
                </div>
                <div className='flex flex-1 flex-col gap-2'>
                    <div className='flex flex-col md:flex-row '>
                        <div className='flex w-fit flex-col'>
                            <Link
                                href={`${PAGE_ROUTES.VEHICLES}/${vehicleId}${PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR}`}
                                className='font-semibold text-lg underline hover:underline-offset-2 md:max-w-sm md:text-xl'>
                                {carName}
                            </Link>
                            <div className='flex-start gap-5 text-md text-muted-foreground tracking-wider'>{licensePlate}</div>
                            <div className='mt-3 flex-start gap-5 text-md text-muted-foreground tracking-wider'>ID :{vehicleId}</div>
                        </div>
                        {!isTuroTrip && <div className='-mt-2 ml-auto font-bold text-orange-600 text-xl md:mt-2'>$ {perDayAmount}/day</div>}
                    </div>

                    <div className='mt-auto hidden gap-4 md:flex'>
                        <div className='flex items-center gap-2'>
                            <MapPin className='h-4 w-4 ' />
                            <p className='font-medium'>
                                Vehicle Location: <span className='font-normal text-muted-foreground'>{location}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='-mt-3 flex w-full items-start gap-2 md:hidden'>
                <MapPin className='mt-1 size-4' />
                <div className='text-sm md:text-base '>
                    <span className='font-semibold'>Vehicle Location : </span> {location}
                </div>
            </div>

            <div className=' rounded-md bg-primary/10 p-4'>
                <div className='mx-auto max-w-lg'>
                    <div className='flex items-center justify-between text-center'>
                        <div>
                            <p>{tripStart.date}</p>
                            <p>{tripStart.time}</p>
                        </div>
                        <div className='size-12 flex-center whitespace-nowrap rounded-full bg-primary/60 font-semibold text-white'>To</div>
                        <div>
                            <p>{tripEnd.date}</p>
                            <p>{tripEnd.time}</p>
                        </div>
                    </div>
                </div>
                {!isTuroTrip && (
                    <>
                        <hr className='border-foreground/20' />
                        <div className='text-center'>
                            <span className='font-semibold'>Trip duration:</span> {totaldays}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
