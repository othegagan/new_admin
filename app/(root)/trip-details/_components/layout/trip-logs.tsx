'use client';

import { formatDateAndTime } from '@/lib/utils';
import type { Trip } from '@/types';

interface TripLogsProps {
    trip: Trip;
}

interface Log {
    fromstatus: string;
    tostatus: string;
    comments: string;
    changedby: 'HOST' | 'SYSTEM' | 'USER' | string | null;
    createddate: string;
    modificationId: number;
    initialStartTime?: string;
    initialEndTime?: string;
    updatedStartTime?: string;
    updatedEndTime?: string;
}

export default function TripLogs({ trip }: TripLogsProps) {
    const transactions = trip.tripStatusTransactionResponses;
    const modificationHistories = trip.tripModificationHistories;
    // Initialize log creator references
    const logCreatorRef: any = {
        USER: `${trip?.userFirstName} ${trip?.userlastName || ''}`,
        HOST: `${trip?.hostFirstName} ${trip?.hostLastName || ''}`,
        SYSTEM: 'SYSTEM',
        default: '-'
    };

    // Process logs with modification histories and sort them
    const logs = transactions
        .map((log) => {
            const modHistory = modificationHistories?.find((hist) => hist.modificationId === log.modificationId);

            return modHistory
                ? {
                      ...log,
                      initialStartTime: modHistory.initialStartTime,
                      initialEndTime: modHistory.initialEndTime,
                      updatedStartTime: modHistory.updatedStartTime,
                      updatedEndTime: modHistory.updatedEndTime
                  }
                : log;
        })
        .sort((a, b) => new Date(b.createddate).valueOf() - new Date(a.createddate).valueOf());

    return (
        <div className='flex flex-col gap-5'>
            <div>
                <h4>Logs</h4>
                <p className='text-[14px] text-muted-foreground'>Review all activity related to this trip.</p>
            </div>
            <div className='relative space-y-6 px-4 pb-6 pl-6'>
                <div className='before:-left-3 relative col-span-8 space-y-6 px-4 before:absolute before:top-2 before:bottom-0 before:w-0.5 before:bg-muted'>
                    {logs.map((log: Log, index) => (
                        <div
                            key={index}
                            className={` ${['VEHICLECONFIGEVENT', 'Pending', 'RENTALAGREEMENT'].includes(log.fromstatus) ? 'hidden' : ''}`}>
                            <div className='relative flex flex-col before:absolute before:top-2 before:left-[-33px] before:z-[1] before:size-3 before:rounded-full before:bg-primary/70'>
                                <div>{log.changedby ? logCreatorRef[log.changedby] : '-'}</div>
                                <div className='text-muted-foreground text-sm uppercase'>
                                    {formatDateAndTime(log.createddate ?? '', trip.vehzipcode, 'MMM DD, YYYY | h:mm A ')}
                                </div>
                                <p className='mt-3 font-light text-md'>{log.comments}</p>

                                {log.tostatus === 'REQMODAPP' && (
                                    <div className='mt-2 flex flex-col gap-2 text-sm'>
                                        {/* Initial Trip */}
                                        <div>
                                            <span className='text-muted-foreground'>
                                                The initial trip was scheduled from
                                                <span className='mx-2 font-medium'>
                                                    {formatDateAndTime(log.initialStartTime ?? '', trip.vehzipcode, 'MMM DD, YYYY, h:mm A')}
                                                </span>
                                                to
                                                <span className='mx-2 font-medium'>
                                                    {formatDateAndTime(log.initialEndTime ?? '', trip.vehzipcode, 'MMM DD, YYYY, h:mm A')}
                                                </span>
                                                .
                                            </span>
                                        </div>

                                        {/* Modified Trip */}
                                        <div>
                                            <span className='text-muted-foreground'>
                                                The modified trip is now scheduled from
                                                <span className='mx-2 font-medium'>
                                                    {formatDateAndTime(log.updatedStartTime ?? '', trip.vehzipcode, 'MMM DD, YYYY, h:mm A')}
                                                </span>
                                                to
                                                <span className='mx-2 font-medium'>
                                                    {formatDateAndTime(log.updatedEndTime ?? '', trip.vehzipcode, 'MMM DD, YYYY, h:mm A')}
                                                </span>
                                                .
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
