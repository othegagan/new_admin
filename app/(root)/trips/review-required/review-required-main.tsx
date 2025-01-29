'use client';

import DriverReadinessDialog from '@/components/extra/driver-readiness-dialog';
import AcceptTripCancellationDialog from '@/components/extra/trip-accept-calcellation';
import TripApproveDialog from '@/components/extra/trip-approve-dialog';
import TripDismissDialog from '@/components/extra/trip-dismiss-dialog';
import TripRejectDialog from '@/components/extra/trip-reject-dialog';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CHANNELS, DEFAULT_ZIPCODE } from '@/constants';
import { PAGE_ROUTES } from '@/constants/routes';
import { useReviewRequiredTrips } from '@/hooks/useTrips';
import { formatDateAndTime, toTitleCase } from '@/lib/utils';
import { ArrowLeftRight, CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';
import { CarDetails, UserInfo } from '../_components/trip-card-components';
import { type AllTrip, findUser, findVehicle, getFullLocation, sortByCreatedDate } from '../_components/trip-utils';

const flags = [
    'cardExtensionFailed',
    'cancellationRequested',
    'failedDriverVerification',
    'failedAutoTripExtension',
    'newRequest',
    'paymentFailed',
    'startFailed'
] as const;

type CategorizedTrips = Record<(typeof flags)[number], any[]>;

interface ReviewRequiredTrip extends AllTrip {
    newRequest: boolean;
    newRequestMessage: string | null;

    paymentFailed: boolean;
    paymentFailedReason: string | null;

    failedAutoTripExtension: boolean;
    failedTripExtensionMessage: string | null;

    startFailed: boolean;
    startFailedMessage: string | null;

    cardExtensionFailed: boolean;
    cardExtensionFailedReason: string | null;

    failedDriverVerification: boolean;
    failedDriverVerificationMessage: string | null;

    cancellationRequested: boolean;
    cancellationRequestedMessage: string | null;

    isDebitCard: boolean;
    depositToBeCollected: boolean;
}

export default function ReviewRequired() {
    const { data: response, isLoading, error, isError } = useReviewRequiredTrips();

    if (isLoading) {
        return <CarLoadingSkeleton />;
    }

    if (isError) {
        return <div>Error {error?.message}</div>;
    }

    if (!response?.success) {
        return <div>{response?.message}</div>;
    }

    const data = response.data;

    const trips = data?.trips || [];

    if (trips.length === 0) {
        return (
            <div className='flex h-[calc(100dvh_-_300px)] w-full flex-col items-center justify-center'>
                <img src='/images/car_loading_2.gif' className='h-auto w-48 opacity-50 dark:invert' alt='Loading...' />
                <h3 className='mt-6 text-center text-muted-foreground'>
                    No more bumps! <br /> You're all caught up.
                </h3>
            </div>
        );
    }

    // Mapping through trips and combining vehicle and user details
    const modifiedTrips = trips?.map((trip: ReviewRequiredTrip) => {
        const vehicle = findVehicle(data.vehicles, trip.vehicleId);
        const user = findUser(data.users, trip.userId);

        // Creating a new object with combined details
        return {
            ...trip,
            ...vehicle,
            ...user,
            vehicleAddress: vehicle?.address,
            channel: trip?.channelName
        };
    });

    // Initialize categorized trips
    const categorizedTrips: CategorizedTrips = flags.reduce((acc, flag) => {
        acc[flag] = [];
        return acc;
    }, {} as CategorizedTrips);

    // Categorize trips based on flags
    modifiedTrips?.forEach((trip: ReviewRequiredTrip) => {
        flags?.forEach((flag) => {
            if (trip[flag]) {
                categorizedTrips[flag].push(trip);
            }
        });
    });

    // Sort each category by `createdTime`
    Object.keys(categorizedTrips).forEach((flag) => {
        const key = flag as keyof CategorizedTrips;
        categorizedTrips[key] = sortByCreatedDate(categorizedTrips[key] || []);
    });

    const {
        cancellationRequested,
        cardExtensionFailed,
        failedAutoTripExtension,
        failedDriverVerification,
        newRequest,
        paymentFailed,
        startFailed
    } = categorizedTrips;

    return (
        <ScrollArea className='relative flex h-[calc(100dvh_-_100px)] w-full flex-col px-4'>
            <Accordion type='single' collapsible className='mx-auto mb-4 flex flex-col gap-5 md:max-w-5xl'>
                <NewTripRequests newTripRequests={newRequest} />
                <FailedPayments failedPayments={paymentFailed} />
                <FailedTripExtensions failedTripExtensions={failedAutoTripExtension} />
                <FailedDriverVerifications failedDriverVerifications={failedDriverVerification} />
                <FailedCardExtensions failedCardExtensions={cardExtensionFailed} />
                <StartFailedTrips startFailedTrips={startFailed} />
                <CancellationRequestedTrips cancellationRequestedTrips={cancellationRequested} />
            </Accordion>
        </ScrollArea>
    );
}

function NewTripRequests({ newTripRequests }: { newTripRequests: ReviewRequiredTrip[] }) {
    if (newTripRequests.length === 0) return null;
    return (
        <AccordionItem value='new-requests' className='border-0'>
            <div className='sticky top-0 z-20 w-full rounded-lg bg-[#ffba89] dark:bg-[#3d2718] '>
                <AccordionTrigger className='accordion-trigger hover:no-underline'>
                    <span className='font-medium text-sm hover:no-underline'>New Trip Requests ({newTripRequests.length})</span>
                </AccordionTrigger>
            </div>
            <AccordionContent className='overflow-y-auto pt-4 pb-2'>
                {newTripRequests.map((trip: ReviewRequiredTrip) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripId}
                        statusButton={
                            <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                                {trip.status}
                            </div>
                        }>
                        <div className='mt-6 ml-auto flex gap-3 md:gap-10'>
                            <Link
                                href={`${PAGE_ROUTES.TRIP_DETAILS}/${trip.tripId}${PAGE_ROUTES.TRIP_DETAILS_SWAP}`}
                                type='button'
                                className='ont-semibold flex h-9 items-center gap-2 rounded-full px-4 py-1 text-neutral-700 hover:bg-muted dark:text-neutral-300'>
                                <ArrowLeftRight className='size-5' />
                                Swap Vehicle
                            </Link>

                            <TripRejectDialog tripId={trip.tripId} />

                            <TripApproveDialog
                                tripId={trip.tripId}
                                debitOrCreditCard={trip?.isDebitCard ? 'debit' : 'credit'}
                                defaultDepositToBeCollectedFlag={trip?.depositToBeCollected}
                            />
                        </div>
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function FailedPayments({ failedPayments }: { failedPayments: ReviewRequiredTrip[] }) {
    if (failedPayments.length === 0) return null;
    return (
        <AccordionItem value='failed-payments' className='border-0'>
            <div className='sticky top-0 z-20 w-full rounded-lg bg-[#ffba89] dark:bg-[#3d2718] '>
                <AccordionTrigger className='accordion-trigger hover:no-underline'>
                    <span className='font-medium text-sm hover:no-underline'>Failed Payments ({failedPayments.length})</span>
                </AccordionTrigger>
            </div>
            <AccordionContent className='overflow-y-auto pt-4 pb-2'>
                {failedPayments.map((trip: ReviewRequiredTrip) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripId}
                        statusButton={
                            <Popover>
                                <PopoverTrigger>
                                    <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 font-medium text-red-600 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                                        Payment Failed
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className='font-normal text-sm'>{trip.paymentFailedReason}</PopoverContent>
                            </Popover>
                        }>
                        <div className='mt-6 ml-auto flex gap-3 md:gap-10'>
                            <TripDismissDialog tripId={trip.tripId} dismissalKey='paymentFailed' />
                        </div>
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function FailedTripExtensions({ failedTripExtensions }: { failedTripExtensions: ReviewRequiredTrip[] }) {
    if (failedTripExtensions.length === 0) return null;
    return (
        <AccordionItem value='failed-trip-extensions' className='border-0'>
            <div className='sticky top-0 z-20 w-full rounded-lg bg-[#ffba89] dark:bg-[#3d2718] '>
                <AccordionTrigger className='accordion-trigger hover:no-underline'>
                    <span className='font-medium text-sm hover:no-underline'>Failed Trip Extensions ({failedTripExtensions.length})</span>
                </AccordionTrigger>
            </div>
            <AccordionContent className='overflow-y-auto pt-4 pb-2'>
                {failedTripExtensions.map((trip: ReviewRequiredTrip) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripId}
                        statusButton={
                            <Popover>
                                <PopoverTrigger>
                                    <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 font-medium text-red-600 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                                        Extension Failed
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className='font-normal text-sm'>{trip.failedTripExtensionMessage}</PopoverContent>
                            </Popover>
                        }>
                        <div className='mt-6 ml-auto flex gap-3 md:gap-10'>
                            <TripDismissDialog tripId={trip.tripId} dismissalKey='failedautotripExtension' />
                        </div>
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function FailedDriverVerifications({ failedDriverVerifications }: { failedDriverVerifications: ReviewRequiredTrip[] }) {
    if (failedDriverVerifications.length === 0) return null;
    return (
        <AccordionItem value='failed-driving-verifications' className='border-0'>
            <div className='sticky top-0 z-20 w-full rounded-lg bg-[#ffba89] dark:bg-[#3d2718] '>
                <AccordionTrigger className='accordion-trigger hover:no-underline'>
                    <span className='font-medium text-sm hover:no-underline'>
                        Failed Verifications ({failedDriverVerifications.length})
                    </span>
                </AccordionTrigger>
            </div>
            <AccordionContent className='overflow-y-auto pt-4 pb-2'>
                {failedDriverVerifications.map((trip: ReviewRequiredTrip) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripId}
                        statusButton={
                            <Popover>
                                <PopoverTrigger>
                                    <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 font-medium text-red-600 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                                        Verification Failed
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className='font-normal text-sm'>{trip.failedDriverVerificationMessage}</PopoverContent>
                            </Popover>
                        }>
                        <div className='mt-6 ml-auto flex gap-3 md:gap-10'>
                            <TripDismissDialog tripId={trip.tripId} dismissalKey='failedDriverVerifications' />
                        </div>
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function FailedCardExtensions({ failedCardExtensions }: { failedCardExtensions: ReviewRequiredTrip[] }) {
    if (failedCardExtensions.length === 0) return null;
    return (
        <AccordionItem value='failed-card-extensions' className='border-0'>
            <div className='sticky top-0 z-20 w-full rounded-lg bg-[#ffba89] dark:bg-[#3d2718] '>
                <AccordionTrigger className='accordion-trigger hover:no-underline'>
                    <span className='font-medium text-sm hover:no-underline'>Failed Extensions ({failedCardExtensions.length})</span>
                </AccordionTrigger>
            </div>
            <AccordionContent className='overflow-y-auto pt-4 pb-2'>
                {failedCardExtensions.map((trip: ReviewRequiredTrip) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripId}
                        statusButton={
                            <Popover>
                                <PopoverTrigger>
                                    <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 font-medium text-red-600 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                                        Failed Extension
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className='font-normal text-sm'>{trip.cardExtensionFailedReason}</PopoverContent>
                            </Popover>
                        }>
                        <div className='mt-6 ml-auto flex gap-3 md:gap-10'>
                            <TripDismissDialog tripId={trip.tripId} dismissalKey='isCardExtensionFailed' />
                        </div>
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function CancellationRequestedTrips({ cancellationRequestedTrips }: { cancellationRequestedTrips: ReviewRequiredTrip[] }) {
    if (cancellationRequestedTrips.length === 0) return null;
    return (
        <AccordionItem value='cancellation-requested-trips' className='border-0'>
            <div className='sticky top-0 z-20 w-full rounded-lg bg-[#ffba89] dark:bg-[#3d2718] '>
                <AccordionTrigger className='accordion-trigger hover:no-underline'>
                    <span className='font-medium text-sm hover:no-underline'>
                        Cancellation Requested ({cancellationRequestedTrips.length})
                    </span>
                </AccordionTrigger>
            </div>
            <AccordionContent className='overflow-y-auto pt-4 pb-2'>
                {cancellationRequestedTrips.map((trip: ReviewRequiredTrip) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripId}
                        statusButton={
                            <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 font-medium text-red-600 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                                {trip.status}
                            </div>
                        }>
                        <div className='mt-6 ml-auto flex gap-3 md:gap-10'>
                            <AcceptTripCancellationDialog tripId={trip.tripId} />
                        </div>
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function StartFailedTrips({ startFailedTrips }: { startFailedTrips: ReviewRequiredTrip[] }) {
    if (startFailedTrips.length === 0) return null;
    return (
        <AccordionItem value='failed-start' className='border-0'>
            <div className='sticky top-0 z-20 w-full rounded-lg bg-[#ffba89] dark:bg-[#3d2718] '>
                <AccordionTrigger className='accordion-trigger hover:no-underline'>
                    <span className='font-medium text-sm hover:no-underline'>Trip Start Failed ({startFailedTrips.length})</span>
                </AccordionTrigger>
            </div>
            <AccordionContent className='overflow-y-auto pt-4 pb-2'>
                {startFailedTrips.map((trip: ReviewRequiredTrip) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripId}
                        statusButton={
                            <Popover>
                                <PopoverTrigger>
                                    <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 font-medium text-red-600 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                                        Trip Start Failed
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className='font-normal text-sm'>{trip.startFailedMessage}</PopoverContent>
                            </Popover>
                        }>
                        <div className='mt-6 ml-auto flex gap-3 md:gap-10'>
                            <TripDismissDialog tripId={trip.tripId} dismissalKey='startFailed' />
                        </div>
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function TripCard({
    tripData,
    children,
    statusButton
}: { tripData: ReviewRequiredTrip; children?: React.ReactNode; statusButton?: React.ReactNode }) {
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

    return (
        <div className='flex w-full flex-col gap-1 text-nowrap border-b py-2.5 md:max-w-5xl lg:max-w-6xl xl:max-w-7xl'>
            <div className='flex items-center gap-4 lg:hidden'>
                <UserInfo className='text-[14px]' avatarSrc={avatarSrc} name={userName} tripId={tripId} userId={userId} />
                <div className='ml-auto flex flex-wrap items-end justify-end gap-2'>
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
                    {statusButton}
                </div>
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
                    <div className='flex flex-wrap items-end justify-end gap-2'>
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
                        {statusButton}
                    </div>
                    <UserInfo avatarSrc={avatarSrc} name={userName} tripId={tripId} className='mt-auto' userId={userId} />
                </div>
            </div>
            <div className='mt-2 flex w-full items-center gap-2 md:hidden'>
                <CalendarDays className='size-4 text-muted-foreground' />
                <div className='text-sm md:text-sm dark:text-muted-foreground'>{dateRange}</div>
            </div>
            <div className=' flex w-full items-center gap-2 md:hidden dark:text-muted-foreground'>
                <MapPin className='size-4' />
                <div className='text-sm md:text-sm'>{location}</div>
            </div>
            {children}
        </div>
    );
}
