'use client';

import DriverReadinessDialog from '@/components/extra/driver-readiness-dialog';
import { Main } from '@/components/layout/main';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTripDetails } from '@/hooks/useTrips';
import { checkForTuroTrip, cn } from '@/lib/utils';
import type { Trip } from '@/types';
import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import MainMessageComponent from '../../messages/_components/MainMessage';
import { getDeliveryLocation } from '../../trips/_components/trip-utils';
import { TripActions } from '../_components/layout/trip-actions';
import TripChecklist from '../_components/layout/trip-checklist';
import TripDriverDetails from '../_components/layout/trip-driver-details';
import TripLogs from '../_components/layout/trip-logs';
import TripSummary from '../_components/layout/trip-summary';
import TripPayments from '../_components/payments/trip-payments';

const VALID_TABS = ['summary', 'chat', 'payments', 'checklist', 'logs'] as const;
type TabType = (typeof VALID_TABS)[number];

export default function TripDetails() {
    const params = useParams<{ tripId: string }>();
    const tripId = params.tripId;
    const router = useRouter();

    const [activeTab, setActiveTab] = useQueryState('tab', {
        defaultValue: 'summary',
        parse: (value): TabType => (VALID_TABS.includes(value as TabType) ? (value as TabType) : 'summary'),
        serialize: (value) => value
    });

    const { data: response, isLoading, isError, error } = useTripDetails(tripId);

    if (isLoading) return <CarLoadingSkeleton />;

    if (isError) return <div>Error: {error.message}</div>;

    if (!response?.success) return <div>Error: {response?.message}</div>;

    if (response.data.activetripresponse.length === 0) return <div>{response.message}</div>;

    //@ts-ignore
    const fullTripResponse = response.data;
    const trip: Trip = response.data.activetripresponse[0];
    const checklist = response.data.checkLists ? response.data.checkLists[0] : [];
    const isTuroTrip = checkForTuroTrip(trip.channelName);

    const customDelivery = trip?.delivery || trip?.airportDelivery;
    const deliveryLocation = getDeliveryLocation(trip?.deliveryLocations);

    return (
        <Main fixed className='mx-auto h-full w-full max-w-[1600px] py-4'>
            {/* Header */}
            <header className='border-b pb-2'>
                <div className='flex items-center'>
                    <button
                        type='button'
                        onClick={() => router.back()}
                        className='flex items-center font-medium text-muted-foreground text-sm'>
                        <ChevronLeft className='mr-2 h-4 w-4' /> Back
                    </button>

                    {!isTuroTrip && <TripActions className='ml-auto' trip={trip} />}
                </div>
            </header>

            {/* Main Content */}
            <div className='px-0'>
                <div className='grid lg:grid-cols-[1fr,400px]'>
                    {/* Left Column - Trip Details */}
                    <div className='h-[calc(100dvh-8rem)] space-y-6 overflow-y-auto md:border-r md:pr-2'>
                        {/* User Info */}
                        <div className='flex items-start justify-between gap-4 pt-4'>
                            <TripDriverDetails
                                tripId={trip.tripid}
                                name={`${trip.userFirstName || ''} ${trip.userlastName || ''}`}
                                avatarSrc={trip.userImage}
                                userId={trip.userid}
                                createdDate={trip.createddate}
                                zipcode={trip.vehzipcode}
                            />

                            <DriverReadinessDialog
                                tripId={trip.tripid}
                                isLicenceVerified={trip.isLicenseVerified}
                                isPhoneVerified={trip.isPhoneVarified}
                                isRentalAgreed={trip.isRentalAgreed}
                                isInsuranceVerified={trip.isInsuranceVerified}
                                userId={trip.userid}
                                userName={`${trip.userFirstName || ''} ${trip.userlastName || ''}`}
                                avatarSrc={trip.userImage}
                            />
                        </div>

                        {/* Custom Delivery Required */}
                        {customDelivery && (
                            <Card className='bg-accent p-2.5 pl-4 shadow-none '>
                                <p className='text-sm'>
                                    <span className='font-semibold'>
                                        {trip?.delivery ? 'Custom' : trip?.airportDelivery && 'Airport'} Delivery Required :
                                    </span>{' '}
                                    {deliveryLocation}
                                </p>
                            </Card>
                        )}

                        <Tabs
                            value={activeTab}
                            onValueChange={(value) => setActiveTab(value)}
                            defaultValue='summary'
                            className='w-full rounded-none'>
                            <TabsList className='sticky top-0 z-10 flex h-auto w-full justify-start gap-6 overflow-x-auto overflow-y-hidden rounded-none border-b bg-background px-4'>
                                <TabsTrigger
                                    value='summary'
                                    className=' rounded-full data-[state=active]:border-primary data-[state=active]:bg-primary/30 data-[state=active]:shadow-none sm:w-fit '>
                                    Summary
                                </TabsTrigger>
                                <TabsTrigger
                                    value='chat'
                                    className=' rounded-full data-[state=active]:border-primary data-[state=active]:bg-primary/30 data-[state=active]:shadow-none sm:w-fit md:hidden'>
                                    Trip Chat
                                </TabsTrigger>
                                {!isTuroTrip && (
                                    <>
                                        <TabsTrigger
                                            value='payments'
                                            className=' rounded-full data-[state=active]:border-primary data-[state=active]:bg-primary/30 data-[state=active]:shadow-none sm:w-fit '>
                                            Payments
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value='checklist'
                                            className=' rounded-full data-[state=active]:border-primary data-[state=active]:bg-primary/30 data-[state=active]:shadow-none sm:w-fit '>
                                            <span className='hidden sm:inline'>Checklist & Media</span>
                                            <span className='sm:hidden'>Checklist</span>
                                        </TabsTrigger>
                                    </>
                                )}

                                <TabsTrigger
                                    value='logs'
                                    className=' rounded-full data-[state=active]:border-primary data-[state=active]:bg-primary/30 data-[state=active]:shadow-none sm:w-fit '>
                                    Logs
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value='summary' className='mt-4 pl-0.5'>
                                <TripSummary trip={trip} />
                            </TabsContent>
                            <TabsContent
                                value='chat'
                                className={cn('mt-4 pr-4 pl-0.5', customDelivery ? 'h-[calc(100dvh-25rem)]' : 'h-[calc(100dvh-19rem)]')}>
                                <ChatInterface tripId={Number(tripId)} />
                            </TabsContent>
                            <TabsContent value='payments' className='mt-4 pr-4 pl-0.5'>
                                <TripPayments fullTripResponse={fullTripResponse} />
                            </TabsContent>
                            <TabsContent value='checklist' className='mt-4 pr-4 pl-0.5'>
                                <TripChecklist trip={trip} checklist={checklist} />
                            </TabsContent>
                            <TabsContent value='logs' className='mt-4 pr-4 pl-0.5'>
                                <TripLogs trip={trip} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column - Chat (Desktop Only) */}
                    <div className='hidden h-[calc(100dvh-8rem)] overflow-y-auto pt-4 lg:block'>
                        <div className='inset-0 left-full z-50 flex h-full w-full flex-1 flex-col rounded-md bg-background shadow-sm sm:static sm:z-auto'>
                            <h5 className='pl-5'>Messages</h5>
                            <MainMessageComponent tripId={Number(tripId)} className='h-full lg:h-full' />
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    );
}

function ChatInterface({ tripId }: { tripId: number }) {
    return (
        <div className='flex h-full flex-1 flex-col'>
            <div className='inset-0 left-full z-50 flex h-full w-full flex-1 flex-col rounded-md bg-background shadow-sm sm:static sm:z-auto'>
                <MainMessageComponent tripId={tripId} className='h-full lg:h-full' />
            </div>
        </div>
    );
}
