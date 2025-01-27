import DriverReadinessDialog from '@/components/extra/driver-readiness-dialog';
import { CHANNELS, DEFAULT_ZIPCODE } from '@/constants';
import { PAGE_ROUTES } from '@/constants/routes';
import { formatDateAndTime, toTitleCase } from '@/lib/utils';
import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';
import { type AllTrip, getFullLocation } from '../_components/trip-utils';

export function TripCard({ tripData }: { tripData: AllTrip }) {
    const tripId = tripData.tripId;
    const zipCode = tripData.vehicleAddress.zipcode || DEFAULT_ZIPCODE;
    const channel = tripData?.channel;
    const isTuroTrip = channel?.toLowerCase() === CHANNELS.TURO.toLowerCase();

    const carName = toTitleCase(`${tripData.make} ${tripData.model} ${tripData.year}`);
    const carImage = tripData?.imagename || 'images/image_not_available.png';
    const licensePlate = tripData.vnumber;
    const carAddress = getFullLocation(tripData.vehicleAddress);

    const userId = tripData?.userId;
    const userName = toTitleCase(`${tripData?.firstName || ''} ${tripData?.lastName || ''}`);
    const avatarSrc = tripData?.userImage || '/images/dummy_avatar.png';

    const isAirportDelivery = tripData.airportDelivery;
    const isCustomDelivery = tripData.delivery;
    const deliveryAddress = getFullLocation(tripData?.metaData?.DeliveryLocation) || '';

    const isLicenceVerified = tripData.isLicenseVerified;
    const isPhoneVerified = tripData.isPhoneVerified;
    const isRentalAgreed = tripData.rentalAgreement;
    const isInsuranceVerified = tripData.isInsuranceVerified;

    const startDate = formatDateAndTime(tripData.startTime, zipCode, 'MMM DD, YYYY | h:mm A ');
    const endDate = formatDateAndTime(tripData.endTime, zipCode, 'MMM DD, YYYY | h:mm A  ');
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
        const date = tripData.category === 0 || tripData.category === 1 ? tripData.startTime : tripData.endTime;
        const time = formatDateAndTime(date, zipCode, 'MMM DD, h:mm A');
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
                    isTuroTrip={isTuroTrip}
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
                        isTuroTrip={isTuroTrip}
                    />
                    <UserInfo avatarSrc={avatarSrc} name={userName} tripId={tripId} className='mt-auto' userId={userId} />
                </div>
            </div>
            <div className='mt-2 flex items-center gap-2 md:hidden'>
                <CalendarDays className='size-4 text-muted-foreground' />
                <div className='text-sm md:text-base dark:text-muted-foreground'>{dateRange}</div>
            </div>
            <div className=' flex w-full max-w-md items-center gap-2 text-wrap md:hidden dark:text-muted-foreground'>
                <MapPin className='size-4' />
                <div className='line-clamp-1 text-sm md:text-base'>{location}</div>
            </div>
        </div>
    );
}

interface UserInfoProps {
    avatarSrc: string;
    name: string;
    className?: string;
    userId: number;
    tripId: number;
}

export function UserInfo({ avatarSrc, name, className = '', userId, tripId }: UserInfoProps) {
    return (
        <div className={`flex items-start gap-3 ${className}`}>
            <Link
                href={`${PAGE_ROUTES.GUESTS}/${userId}`}
                prefetch={false}
                className='relative size-9 overflow-hidden rounded-full border md:size-10'>
                <img src={avatarSrc} alt={name} className='h-full w-full object-cover object-center' />
            </Link>
            <div className='flex flex-col gap-1'>
                <Link
                    prefetch={false}
                    href={`${PAGE_ROUTES.GUESTS}/${userId}`}
                    className='max-w-28 truncate font-light hover:underline hover:underline-offset-2 md:max-w-fit md:font-medium md:text-base'>
                    {name}
                </Link>
                <Link
                    prefetch={false}
                    href={`${PAGE_ROUTES.TRIP_DETAILS}/${tripId}`}
                    className=' font-light hover:underline hover:underline-offset-2'>
                    (Trip #{tripId})
                </Link>
            </div>
        </div>
    );
}

interface CarDetailsProps {
    carImage: string;
    carName: string;
    licensePlate: string;
    dateRange: string;
    location: string;
    channel: string;
    isCustomDelivery: boolean;
    isAirportDelivery: boolean;
    tripId: number;
}

export function CarDetails({
    carImage,
    carName,
    licensePlate,
    dateRange,
    location,
    channel,
    isCustomDelivery,
    isAirportDelivery,
    tripId
}: CarDetailsProps) {
    return (
        <Link href={`${PAGE_ROUTES.TRIP_DETAILS}/${tripId}`} className='flex w-fit gap-3'>
            <div className='relative'>
                <div className='absolute top-0 w-fit rounded border bg-white px-2 font-bold text-black text-sm capitalize'>{channel}</div>
                <div className='col-span-2 h-20 w-32 flex-center overflow-hidden rounded-md border md:h-32 md:w-44'>
                    <img src={carImage} alt={carName} className='h-full w-full object-cover object-center' />
                </div>
            </div>
            <div className='flex w-fit flex-col'>
                <h1 className='font-semibold text-lg md:max-w-sm md:text-xl'>{carName}</h1>
                <div className='flex-start gap-5 text-md'>
                    <span className='text-muted-foreground tracking-wider'>{licensePlate}</span>
                </div>
                <div className='block font-light hover:underline hover:underline-offset-2 md:hidden'>(Trip #{tripId})</div>
                <div className='mt-auto hidden w-full items-center gap-2 md:flex'>
                    <CalendarDays className='size-4 text-muted-foreground' />
                    <div className='text-sm md:text-base dark:text-muted-foreground'>{dateRange}</div>
                </div>
                <div className='mt-2 hidden w-full items-start gap-2 md:flex '>
                    <MapPin className='mt-1 size-4 text-muted-foreground' />
                    <div className='max-w-md truncate text-sm md:text-base dark:text-muted-foreground'>
                        {isCustomDelivery && <span className='hidden font-medium lg:inline'>Custom Delivery: </span>}
                        {isAirportDelivery && <span className='hidden font-medium lg:inline'>Airport Delivery: </span>}
                        <span>{location}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

interface ActionButtonsProps {
    className?: string;
    isLicenceVerified: boolean;
    isPhoneVerified: boolean;
    isRentalAgreed: boolean;
    isInsuranceVerified: boolean;
    tripStatus: string;
    tripId: number;
    userId: number;
    userName: string;
    avatarSrc: string;
    isTuroTrip: boolean;
}

export function ActionButtons({
    className,
    isLicenceVerified,
    isPhoneVerified,
    isRentalAgreed,
    isInsuranceVerified,
    tripStatus,
    tripId,
    userId,
    userName,
    avatarSrc,
    isTuroTrip
}: ActionButtonsProps) {
    return (
        <div className={`flex flex-wrap items-end justify-end gap-2 ${className}`}>
            {/* Turo Trip dont have driver readiness */}
            {!isTuroTrip && (
                <DriverReadinessDialog
                    tripId={tripId}
                    isLicenceVerified={isLicenceVerified}
                    isPhoneVerified={isPhoneVerified}
                    isRentalAgreed={isRentalAgreed}
                    isInsuranceVerified={isInsuranceVerified}
                    userId={userId}
                    userName={userName}
                    avatarSrc={avatarSrc}
                />
            )}
            <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>{tripStatus}</div>
        </div>
    );
}
