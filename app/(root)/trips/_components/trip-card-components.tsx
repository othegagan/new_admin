import DriverReadinessDialog from '@/components/extra/driver-readiness-dialog';
import { PAGE_ROUTES } from '@/constants/routes';
import { CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';

interface UserInfoProps {
    avatarSrc: string;
    name: string;
    className?: string;
    userId: number;
    tripId: number;
}

export function UserInfo({ avatarSrc, name, className = '', userId, tripId }: UserInfoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <Link href={`${PAGE_ROUTES.GUESTS}/${userId}`} className='relative size-9 overflow-hidden rounded-full border md:size-10'>
                <img src={avatarSrc} alt={name} className='h-full w-full object-cover object-center' />
            </Link>
            <div className='flex flex-col gap-1'>
                <Link
                    href={`${PAGE_ROUTES.GUESTS}/${userId}`}
                    className='max-w-20 truncate font-light hover:underline hover:underline-offset-2 md:max-w-fit md:font-medium md:text-base'>
                    {name}
                </Link>
                <Link
                    href={`${PAGE_ROUTES.TRIP_DETAILS}/${tripId}`}
                    className='hidden font-light hover:underline hover:underline-offset-2 md:block'>
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
        <Link href={`${PAGE_ROUTES.TRIP_DETAILS}/${tripId}`} className='flex flex-1 gap-3'>
            <div className='relative'>
                <div className='absolute top-0 w-fit rounded border bg-white px-2 font-bold text-black text-sm'>{channel}</div>
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
                <div className='mt-2 hidden w-full items-center gap-2 md:flex '>
                    <MapPin className='size-4 text-muted-foreground' />
                    <div className='max-w-md truncate text-sm md:text-base dark:text-muted-foreground'>
                        {isCustomDelivery && <span className='hidden font-medium lg:inline'>Custom Delivery :</span>}
                        {isAirportDelivery && <span className='hidden font-medium lg:inline'>Airport Delivery :</span>}
                        {location}
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
    avatarSrc
}: ActionButtonsProps) {
    return (
        <div className={`flex flex-wrap items-end justify-end gap-2 ${className}`}>
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
            <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>{tripStatus}</div>
        </div>
    );
}
