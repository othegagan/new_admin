'use client';

import { Skeleton } from '@/components/skeletons';
import { DEFAULT_ZIPCODE } from '@/constants';
import { useTelematicsEvents } from '@/hooks/useVehicles';
import { formatDateAndTime } from '@/lib/utils';
import type { TelematicsData } from '@/types';
import { Car, ClockIcon as IoSpeedometer, CarIcon as MdCarCrash } from 'lucide-react';
import TelematicsMap from './telematics-map';

export function TripDetails({ selectedTrip, zipcode }: { selectedTrip: TelematicsData | null; zipcode: string }) {
    const { data: response, isLoading, isError, error } = useTelematicsEvents(Number(selectedTrip?.tripId));

    if (!selectedTrip) {
        return (
            <div className='flex h-full w-full border-spacing-3 items-center justify-center rounded-sm border-4 border-primary/50 border-dotted bg-primary/10'>
                Select a trip to see more details
            </div>
        );
    }

    const events = response?.data?.telematicsMessageLogs?.sort(
        (a: any, b: any) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
    );

    return (
        <div className='h-full space-y-5 overflow-y-auto'>
            <div className='border-b bg-background pb-3'>
                <h1 className='sticky font-bold text-xl'>Overview</h1>
                <div className='mt-4 flex flex-col gap-6'>
                    <div className='flex w-fit items-center gap-10 '>
                        <div className='rounded bg-blue-400 px-4 py-1 text-black'>
                            Booking ID : <b>{selectedTrip.bundeeBookingId ? selectedTrip.bundeeBookingId : 'Off Rental'}</b>
                        </div>
                        <div>
                            Trip ID : <b>{selectedTrip.tripId}</b>
                        </div>
                    </div>
                    <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                            <div className='h-2 w-2 rounded-full bg-red-500' />
                            <div>Ended at {formatDateAndTime(selectedTrip.tripEnd, DEFAULT_ZIPCODE)}</div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className='h-2 w-2 rounded-full bg-green-500' />
                            <div>Started at {formatDateAndTime(selectedTrip.tripStart, DEFAULT_ZIPCODE)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <Skeleton className='h-full max-h-[350px]' />
            ) : isError ? (
                <div>Map Error: {error.message}</div>
            ) : !response?.success ? (
                <div>Map Error: {response?.message}</div>
            ) : (
                <div className='h-full max-h-[350px]'>
                    <TelematicsMap tripRoutes={response?.data?.tripRoutes} />
                </div>
            )}

            <TripDetailSection
                icon={<Car className='size-5' />}
                title='Drive'
                details={[
                    { label: 'Distance', value: `${selectedTrip.tripDistance.toFixed(2)} mi` },
                    { label: 'Odometer Start', value: selectedTrip.odometerStart },
                    { label: 'Odometer End', value: selectedTrip.odometerEnd }
                ]}
            />

            <TripDetailSection
                icon={<IoSpeedometer className='size-4' />}
                title='Speed'
                details={[
                    { label: 'Max Speed', value: `${selectedTrip.tripMaxSpeed} MPH` },
                    { label: 'Avg Speed', value: `${selectedTrip.tripAverageSpeed} MPH` }
                ]}
            />

            <TripDetailSection
                icon={<MdCarCrash className='size-5' />}
                title='Incidents'
                details={[
                    { label: 'Hard Acceleration Count', value: `${selectedTrip.hardAccelerationCount} Times` },
                    { label: 'Hard Braking Count', value: `${selectedTrip.hardBrakingCount} Times` },
                    { label: 'Over Speeding Count', value: `${selectedTrip.overSpeedingCount} Times` },
                    { label: 'Impact Count', value: `${selectedTrip.impactCount} Times` },
                    { label: 'Late Night Driven', value: selectedTrip.isLateNightDriven ? 'Yes' : 'No' },
                    { label: 'Early Morning Driven', value: selectedTrip.isEarlyMorningDriven ? 'Yes' : 'No' }
                ]}
            />

            {isLoading ? (
                <div>Loading Events ...</div>
            ) : isError ? (
                <div>Events Error: {error.message}</div>
            ) : !response?.success ? (
                <div>Events Error: {response?.message}</div>
            ) : (
                <TelematicsEvents events={events} zipcode={zipcode} />
            )}
        </div>
    );
}

interface TripDetailsSectionProps {
    icon: any;
    title: string;
    details: any[];
}

function TripDetailSection({ icon, title, details }: TripDetailsSectionProps) {
    return (
        <div className='rounded-lg bg-primary/10 dark:border dark:bg-background'>
            <div className='flex items-center gap-2 p-4 font-semibold'>
                {icon}
                {title}
            </div>
            <div className='p-4 pt-0'>
                <div className='grid '>
                    {details.map((detail, index) => (
                        <div key={index} className='flex justify-between py-1'>
                            <div className='text-sm dark:text-muted-foreground'>{detail.label}</div>
                            <div className='font-medium text-sm'>
                                <b>{detail.value}</b>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function TelematicsEvents({ events, zipcode }: { events: any[]; zipcode: string }) {
    if (events?.length === 0) return null;

    // const tripNote: any = {
    //     TRIP_START: 'Trip started.',
    //     TRIP_END: 'Trip ended.',
    //     OVER_SPEEDING: 'Over speeding',
    //     HARD_ACCELERATION: 'Hard acceleration'
    // };

    return (
        <div className='space-y-3'>
            <h4>Events</h4>
            <div>
                {events.map((event, index) => (
                    <div key={index} className='group relative flex w-full rounded-lg hover:bg-muted'>
                        <div className='after:-translate-x-[0.5px] relative after:absolute after:start-3.5 after:top-0 after:bottom-0 after:w-px after:bg-neutral-300 last:after:hidden after:dark:bg-neutral-600'>
                            <div className='relative z-10 flex size-7 items-center justify-center'>
                                <div className='size-2.5 rounded-full border-2 border-primary bg-primary group-hover:bg-background' />
                            </div>
                        </div>

                        <div className='grow p-2 pb-4'>
                            <div className='flex gap-x-1.5 font-semibold capitalize'>{event.eventType}</div>
                            <p className='mt-1 text-muted-foreground text-sm'>
                                At{' '}
                                <span className='mx-1 font-semibold uppercase'>
                                    {formatDateAndTime(event.eventTime, zipcode, 'MMM DD, YYYY ,  h:mm:ss A ')}
                                </span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
