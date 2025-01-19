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
import { CHANNELS } from '@/constants';
import { PAGE_ROUTES } from '@/constants/routes';
import { useReviewRequiredTrips } from '@/hooks/useTrips';
import { formatDateAndTime, getFullAddress, toTitleCase } from '@/lib/utils';
import type { Trip } from '@/types';
import { ArrowLeftRight, CalendarDays, MapPin } from 'lucide-react';
import Link from 'next/link';
import { ActionButtons, CarDetails, UserInfo } from '../_components/trip-card-components';
import { getDeliveryLocation } from '../_components/trip-utils';

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

    const newTripRequests = sortByCreatedDate(data?.newRequests || []);
    const failedPayments = sortByCreatedDate(data?.failedPayments || []);
    const failedTripExtensions = sortByCreatedDate(data?.failedTripExtensions || []);
    const failedDriverVerifications = sortByCreatedDate(data?.failedDriverVerifications || []);
    const failedCardExtensions = sortByCreatedDate(data?.failedCardExtensions || []);
    const cancellationRequestedTrips = sortByCreatedDate(data?.cancellationRequestedTrips || []);

    if (
        !newTripRequests ||
        !failedPayments ||
        !failedTripExtensions ||
        !failedDriverVerifications ||
        !failedCardExtensions ||
        !cancellationRequestedTrips
    ) {
        return <div>No Trips</div>;
    }

    return (
        <ScrollArea className='relative flex h-[calc(100dvh_-_100px)] w-full flex-col px-4'>
            <Accordion type='single' collapsible className='mx-auto mb-4 flex flex-col gap-5 md:max-w-5xl'>
                <NewTripRequests newTripRequests={newTripRequests} />
                <FailedPayments failedPayments={failedPayments} />
                <FailedTripExtensions failedTripExtensions={failedTripExtensions} />
                <FailedDriverVerifications failedDriverVerifications={failedDriverVerifications} />
                <FailedCardExtensions failedCardExtensions={failedCardExtensions} />
                <CancellationRequestedTrips cancellationRequestedTrips={cancellationRequestedTrips} />
            </Accordion>
        </ScrollArea>
    );
}

function NewTripRequests({ newTripRequests }: { newTripRequests: any[] }) {
    if (newTripRequests.length === 0) return null;
    return (
        <AccordionItem value='new-requests' className='border-0'>
            <div className='sticky top-0 z-20 w-full rounded-lg bg-[#ffba89] dark:bg-[#3d2718] '>
                <AccordionTrigger className='accordion-trigger hover:no-underline'>
                    <span className='font-medium text-sm hover:no-underline'>New Trip Requests ({newTripRequests.length})</span>
                </AccordionTrigger>
            </div>
            <AccordionContent className='overflow-y-auto pt-4 pb-2'>
                {newTripRequests.map((trip: any) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripid}
                        statusButton={
                            <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                                {trip.status}
                            </div>
                        }>
                        <div className='mt-6 ml-auto flex gap-3 md:gap-10'>
                            <Link
                                href={`${PAGE_ROUTES.TRIP_DETAILS}/${trip.tripid}${PAGE_ROUTES.TRIP_DETAILS_SWAP}`}
                                type='button'
                                className='ont-semibold flex h-9 items-center gap-2 rounded-full px-4 py-1 text-neutral-700 hover:bg-muted dark:text-neutral-300'>
                                <ArrowLeftRight className='size-5' />
                                Swap Vehicle
                            </Link>

                            <TripRejectDialog tripId={trip.tripid} />

                            <TripApproveDialog
                                tripId={trip.tripid}
                                debitOrCreditCard={trip.isDebitCard ? 'debit' : 'credit'}
                                defaultDepositToBeCollectedFlag={trip.depositToBeCollected}
                            />
                        </div>
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function FailedPayments({ failedPayments }: { failedPayments: any[] }) {
    if (failedPayments.length === 0) return null;
    return (
        <AccordionItem value='failed-payments' className='border-0'>
            <div className='sticky top-0 z-20 w-full rounded-lg bg-[#ffba89] dark:bg-[#3d2718] '>
                <AccordionTrigger className='accordion-trigger hover:no-underline'>
                    <span className='font-medium text-sm hover:no-underline'>Failed Payments ({failedPayments.length})</span>
                </AccordionTrigger>
            </div>
            <AccordionContent className='overflow-y-auto pt-4 pb-2'>
                {failedPayments.map((trip: any) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripid}
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
                            <TripDismissDialog tripId={trip.tripid} dismissalKey='paymentFailed' />
                        </div>
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function FailedTripExtensions({ failedTripExtensions }: { failedTripExtensions: any[] }) {
    if (failedTripExtensions.length === 0) return null;
    return (
        <AccordionItem value='failed-trip-extensions' className='border-0'>
            <div className='sticky top-0 z-20 w-full rounded-lg bg-[#ffba89] dark:bg-[#3d2718] '>
                <AccordionTrigger className='accordion-trigger hover:no-underline'>
                    <span className='font-medium text-sm hover:no-underline'>Failed Trip Extensions ({failedTripExtensions.length})</span>
                </AccordionTrigger>
            </div>
            <AccordionContent className='overflow-y-auto pt-4 pb-2'>
                {failedTripExtensions.map((trip: any) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripid}
                        statusButton={
                            <Popover>
                                <PopoverTrigger>
                                    <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 font-medium text-red-600 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                                        Extension Failed
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className='font-normal text-sm'>{trip.failedtripextensionmessage}</PopoverContent>
                            </Popover>
                        }>
                        <div className='mt-6 ml-auto flex gap-3 md:gap-10'>
                            <TripDismissDialog tripId={trip.tripid} dismissalKey='failedautotripExtension' />
                        </div>
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function FailedDriverVerifications({ failedDriverVerifications }: { failedDriverVerifications: any[] }) {
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
                {failedDriverVerifications.map((trip: any) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripid}
                        statusButton={
                            <Popover>
                                <PopoverTrigger>
                                    <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 font-medium text-red-600 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                                        Verification Failed
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className='font-normal text-sm'>{trip.failedDriverVerificationsMessage}</PopoverContent>
                            </Popover>
                        }>
                        <div className='mt-6 ml-auto flex gap-3 md:gap-10'>
                            <TripDismissDialog tripId={trip.tripid} dismissalKey='failedDriverVerifications' />
                        </div>
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function FailedCardExtensions({ failedCardExtensions }: { failedCardExtensions: any[] }) {
    if (failedCardExtensions.length === 0) return null;
    return (
        <AccordionItem value='failed-card-extensions' className='border-0'>
            <div className='sticky top-0 z-20 w-full rounded-lg bg-[#ffba89] dark:bg-[#3d2718] '>
                <AccordionTrigger className='accordion-trigger hover:no-underline'>
                    <span className='font-medium text-sm hover:no-underline'>Failed Extensions ({failedCardExtensions.length})</span>
                </AccordionTrigger>
            </div>
            <AccordionContent className='overflow-y-auto pt-4 pb-2'>
                {failedCardExtensions.map((trip: any) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripid}
                        statusButton={
                            <Popover>
                                <PopoverTrigger>
                                    <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 font-medium text-red-600 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                                        Verification Failed
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className='font-normal text-sm'>{trip.cardExtensionFailedReason}</PopoverContent>
                            </Popover>
                        }>
                        {/* <div className='mt-6 ml-auto flex gap-3 md:gap-10'>
                            <TripDismissDialog tripId={trip.tripid} dismissalKey='' />
                        </div> */}
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function CancellationRequestedTrips({ cancellationRequestedTrips }: { cancellationRequestedTrips: any[] }) {
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
                {cancellationRequestedTrips.map((trip: any) => (
                    <TripCard
                        tripData={trip}
                        key={trip.tripid}
                        statusButton={
                            <div className='w-fit rounded bg-[#d1d1d1] px-2 py-1 font-medium text-red-600 text-xs md:px-5 lg:text-[14px] dark:bg-accent'>
                                {trip.status}
                            </div>
                        }>
                        <div className='mt-6 ml-auto flex gap-3 md:gap-10'>
                            <AcceptTripCancellationDialog tripId={trip.tripid} />
                        </div>
                    </TripCard>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
}

function TripCard({ tripData, children, statusButton }: { tripData: Trip; children?: React.ReactNode; statusButton?: React.ReactNode }) {
    const tripId = tripData.tripid;
    const channel = tripData?.channelName;
    const isTuroTrip = channel.toLowerCase() === CHANNELS.TURO.toLowerCase();

    const carName = toTitleCase(`${tripData.vehmake} ${tripData.vehmodel} ${tripData.vehyear}`);
    const carImage = tripData?.vehicleImages[0]?.imagename || 'images/image_not_available.png';
    const licensePlate = tripData.vehicleNumber;
    const carAddress = getFullAddress({ tripDetails: tripData });

    const userId = tripData?.userid;
    const userName = toTitleCase(`${tripData?.userFirstName || ''} ${tripData?.userlastName || ''}`);
    const avatarSrc = tripData?.userImage || '/images/dummy_avatar.png';

    const isAirportDelivery = tripData.airportDelivery;
    const isCustomDelivery = tripData.delivery;
    const deliveryAddress = getDeliveryLocation(tripData?.deliveryLocations) || '';

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

function sortByCreatedDate(array: any[]): any[] {
    return array.sort((a, b) => new Date(b.createddate).getTime() - new Date(a.createddate).getTime());
}
