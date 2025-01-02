'use client';

import { CarLoadingSkeleton } from '@/components/skeletons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAllTrips } from '@/hooks/useTrips';
import { formatDateAndTime, getFullAddress, toTitleCase } from '@/lib/utils';
import type { Trip } from '@/types';
import { addMonths, format, subMonths } from 'date-fns';
import { CalendarDays, MapPin } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { ActionButtons, CarDetails, UserInfo } from '../_components/trip-card-components';
import { parseTrips, searchAndFilterTrips } from '../_components/trip-utils';

export default function AllTrips() {
    const startDate = `${format(subMonths(new Date(), 1), 'yyyy-MM-dd')}T05:00:00.362Z`;
    const endDate = `${format(addMonths(new Date(), 1), 'yyyy-MM-dd')}T04:59:59.362Z`;
    const { data: response, isLoading, error, isError } = useAllTrips(startDate, endDate);

    if (isLoading) {
        return <CarLoadingSkeleton />;
    }

    if (isError) {
        return <div>Error {error?.message}</div>;
    }

    if (!response?.success) {
        return <div>{response?.message}</div>;
    }

    const rawTripsData = response?.data?.activetripresponse || [];

    if (!isLoading && response?.success && rawTripsData?.length === 0) {
        return <div>No Trips</div>;
    }

    return <AllTripsSearch tripsData={rawTripsData} />;
}

function AllTripsSearch({ tripsData }: any) {
    const [searchTerm] = useQueryState('search', { defaultValue: '' });
    const [channelName] = useQueryState('channel', { defaultValue: '' });
    const [tripStatus] = useQueryState('status', { defaultValue: '' });

    const filteredData = searchAndFilterTrips(tripsData, searchTerm, channelName, tripStatus);

    const formattedTrips = parseTrips(filteredData);

    return (
        <ScrollArea className='flex h-[calc(100dvh_-_100px)] w-full flex-col px-4'>
            {Object.keys(formattedTrips).map((date: string) => (
                <div key={date} className='mx-auto mb-4 flex flex-col md:max-w-5xl'>
                    <div className='sticky top-0 z-20 mb-2 bg-background shadow-sm md:mb-0'>
                        <div className='mx-auto w-fit rounded-sm border border-black/20 bg-background p-3 py-1 text-center font-medium text-14'>
                            {format(new Date(date), 'PPP')}
                        </div>
                    </div>
                    {formattedTrips[date].map((trip: Trip) => (
                        <div key={trip.tripid}>
                            <TripCard tripData={trip} />
                        </div>
                    ))}
                </div>
            ))}
        </ScrollArea>
    );
}

function TripCard({ tripData }: { tripData: Trip }) {
    const tripId = tripData.tripid;
    const channel = tripData?.channelName;

    const carName = toTitleCase(`${tripData.vehmake} ${tripData.vehmodel} ${tripData.vehyear}`);
    const carImage = tripData?.vehicleImages[0]?.imagename || 'images/image_not_available.png';
    const licensePlate = tripData.vehicleNumber;
    const carAddress = getFullAddress({ tripDetails: tripData });

    const userId = tripData?.userid;
    const userName = toTitleCase(`${tripData?.userFirstName || ''} ${tripData?.userlastName || ''}`);
    const avatarSrc = tripData?.userImage || '/images/dummy_avatar.png';

    const isAirportDelivery = tripData.airportDelivery;
    const isCustomDelivery = tripData.delivery;
    const deliveryAddress = tripData?.deliveryLocations || '';

    const isLicenceVerified = tripData.isLicenseVerified;
    const isPhoneVerified = tripData.isPhoneVarified;
    const isRentalAgreed = tripData.isRentalAgreed;
    const isInsuranceVerified = tripData.isInsuranceVerified;
    const tripStatus = tripData.status;

    const startDate = formatDateAndTime(tripData.starttime, tripData.vehzipcode, 'MMM DD, YYYY | h:mm A ');
    const endDate = formatDateAndTime(tripData.endtime, tripData.vehzipcode, 'MMM DD, YYYY | h:mm A  ');
    const dateRange = `${startDate} - ${endDate}`;

    const location = isAirportDelivery || isCustomDelivery ? deliveryAddress : carAddress;

    return (
        <div className='flex w-full flex-col gap-1 text-nowrap border-b py-2.5 md:max-w-5xl lg:max-w-6xl xl:max-w-7xl'>
            <div className='flex items-center gap-4 lg:hidden'>
                <UserInfo className='text-[14px]' avatarSrc={avatarSrc} name={userName} tripId={tripId} userId={userId} />
                <ActionButtons
                    className='ml-auto pr-6'
                    isLicenceVerified={isLicenceVerified}
                    isPhoneVerified={isPhoneVerified}
                    isRentalAgreed={isRentalAgreed}
                    isInsuranceVerified={isInsuranceVerified}
                    tripStatus={tripStatus}
                    tripId={tripId}
                    userId={userId}
                    userName={userName}
                    avatarSrc={avatarSrc}
                />
            </div>

            <div className='flex gap-3'>
                <CarDetails
                    carImage={carImage}
                    carName={carName}
                    licensePlate={licensePlate}
                    channel={channel}
                    dateRange={dateRange}
                    location={location}
                    isAirportDelivery={isAirportDelivery}
                    isCustomDelivery={isCustomDelivery}
                    tripId={tripId}
                />

                <div className='ml-auto hidden flex-col items-end gap-2 lg:flex'>
                    <ActionButtons
                        isLicenceVerified={isLicenceVerified}
                        isPhoneVerified={isPhoneVerified}
                        isRentalAgreed={isRentalAgreed}
                        isInsuranceVerified={isInsuranceVerified}
                        tripStatus={tripStatus}
                        tripId={tripId}
                        userId={userId}
                        userName={userName}
                        avatarSrc={avatarSrc}
                    />
                    <UserInfo avatarSrc={avatarSrc} name={userName} tripId={tripId} className='mt-auto' userId={userId} />
                </div>
            </div>
            <div className='mt-2 flex w-full items-center gap-2 md:hidden'>
                <CalendarDays className='size-4 text-muted-foreground' />
                <div className='text-sm md:text-base dark:text-muted-foreground'>{dateRange}</div>
            </div>
            <div className=' flex w-full items-center gap-2 font-light md:hidden dark:text-muted-foreground'>
                <MapPin className='size-4' />
                <div className='text-sm md:text-base'>{location}</div>
            </div>
        </div>
    );
}
