'use client';

import { CarLoadingSkeleton } from '@/components/skeletons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDailyViewTrips } from '@/hooks/useTrips';
import { formatDateAndTime, getFullAddress, toTitleCase } from '@/lib/utils';
import type { Trip } from '@/types';
import { addMonths, format } from 'date-fns';
import { CalendarDays, MapPin } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { ActionButtons, CarDetails, UserInfo } from '../_components/trip-card-components';
import { getCategory, searchAndFilterTrips } from '../_components/trip-utils';

const startDate = `${format(new Date(), 'yyyy-MM-dd')}T06:00:00.362Z`;
const endDate = `${format(addMonths(new Date(), 1), 'yyyy-MM-dd')}T05:59:59.362Z`;

export default function DailayView() {
    const { data: response, isLoading, isError, error } = useDailyViewTrips(startDate, endDate);

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

    return (
        <>
            <DailyTripsSearch tripsData={rawTripsData} />
        </>
    );
}

function DailyTripsSearch({ tripsData }: any) {
    const [searchTerm] = useQueryState('search', { defaultValue: '' });
    const [channelName] = useQueryState('channel', { defaultValue: '' });
    const [tripStatus] = useQueryState('status', { defaultValue: '' });

    //search and filter trips
    const filteredData = useMemo(() => {
        return searchAndFilterTrips(tripsData, searchTerm, channelName, tripStatus);
    }, [tripsData, searchTerm, channelName, tripStatus]);

    const dailyViewObjects = useMemo(() => {
        const rawBookingData = filteredData || [];
        const startDate = `${format(new Date(), 'yyyy-MM-dd')}T06:00:00.362Z`;
        const endDate = `${format(addMonths(new Date(), 1), 'yyyy-MM-dd')}T05:59:59.362Z`;

        const dailyViewObjects: Record<string, any[]> = {};
        const currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);

        while (currentDate <= endDateObj) {
            const key = format(currentDate, 'yyyy-MM-dd');
            dailyViewObjects[key] = [];
            currentDate.setDate(currentDate.getDate() + 1);
        }

        rawBookingData.forEach((trip: Trip) => {
            const zipcode = trip.vehzipcode;
            const startKey = formatDateAndTime(trip.starttime, zipcode, 'yyyy-MM-DD');
            const endKey = formatDateAndTime(trip.endtime, zipcode, 'yyyy-MM-DD');

            if (dailyViewObjects[startKey]) {
                const tripCopy = {
                    ...trip,
                    actionDate: trip.starttime,
                    category: getCategory(trip.statusCode, 'start')
                };
                dailyViewObjects[startKey].push(tripCopy);
            }

            if (dailyViewObjects[endKey]) {
                const tripCopy = {
                    ...trip,
                    actionDate: trip.endtime,
                    category: getCategory(trip.statusCode, 'end')
                };
                dailyViewObjects[endKey].push(tripCopy);
            }
        });

        return Object.fromEntries(
            Object.entries(dailyViewObjects)
                .filter(([, bookings]) => bookings.length > 0)
                .map(([date, bookings]) => [
                    date,
                    bookings.sort((a, b) => new Date(a.starttime).getTime() - new Date(b.starttime).getTime())
                ])
        );
    }, [filteredData]);

    // Handle object of trips
    return (
        <ScrollArea className='flex h-[calc(100dvh_-_100px)] w-full flex-col px-4'>
            {Object.entries(dailyViewObjects).map(([date, trips]) => (
                <div key={date} className='mx-auto mb-4 flex flex-col md:max-w-5xl'>
                    <div className='sticky top-0 z-20 mb-2 bg-background shadow-sm md:mb-0'>
                        <div className='mx-auto w-fit rounded-sm border border-black/20 bg-background p-3 py-1 text-center font-medium text-14'>
                            {format(new Date(date), 'PPP')}
                        </div>
                    </div>
                    {trips.map((tripData) => (
                        <div key={tripData.tripid}>
                            <TripCard tripData={tripData} />
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

    const startDate = formatDateAndTime(tripData.starttime, tripData.vehzipcode, 'MMM DD, YYYY | h:mm A ');
    const endDate = formatDateAndTime(tripData.endtime, tripData.vehzipcode, 'MMM DD, YYYY | h:mm A  ');
    const dateRange = `${startDate} - ${endDate}`;

    const location = isAirportDelivery || isCustomDelivery ? deliveryAddress : carAddress;

    let tripStatusText = tripData.status;

    enum CategoryText {
        'Starts at' = 0,
        'Started at' = 1,
        'Ends at' = 2,
        'Ended on' = 3
    }

    if (tripData.category !== undefined) {
        const date = tripData.category === 0 || tripData.category === 1 ? tripData.starttime : tripData.endtime;
        const time = formatDateAndTime(date, tripData.vehzipcode, 'MMM DD, h:mm A');
        const text = `${CategoryText[tripData.category]} ${time}`;

        tripStatusText = text;
    }

    return (
        <div className='flex w-full flex-col gap-1 text-nowrap border-b py-2.5 md:max-w-5xl lg:max-w-6xl xl:max-w-7xl'>
            <div className='flex items-start justify-between gap-4 lg:hidden'>
                <UserInfo avatarSrc={avatarSrc} name={userName} tripId={tripId} userId={userId} />
                <ActionButtons
                    isLicenceVerified={isLicenceVerified}
                    isPhoneVerified={isPhoneVerified}
                    isRentalAgreed={isRentalAgreed}
                    isInsuranceVerified={isInsuranceVerified}
                    tripStatus={tripStatusText}
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
                        tripStatus={tripStatusText}
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
