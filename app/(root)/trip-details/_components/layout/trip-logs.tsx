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
    changedby: 'HOST' | 'SYSTEM' | 'USER' | 'Driver' | string | null;
    createddate: string;
    modificationId: number;
    initialStartTime?: string;
    initialEndTime?: string;
    updatedStartTime?: string;
    updatedEndTime?: string;
    metaData: string | null;
}

export default function TripLogs({ trip }: TripLogsProps) {
    const logs =
        trip.tripStatusTransactionResponses?.sort((a, b) => new Date(b.createddate).valueOf() - new Date(a.createddate).valueOf()) || [];

    const logCreatorRef: Record<string, string> = {
        USER: `${trip?.userFirstName} ${trip?.userlastName || ''}`,
        Driver: `${trip?.userFirstName} ${trip?.userlastName || ''}`,
        HOST: `${trip?.hostFirstName} ${trip?.hostLastName || ''}`,
        SYSTEM: 'SYSTEM',
        default: '-'
    };

    const renderMetaData = (metaData: string) => {
        const parsedMetaData = JSON.parse(metaData);
        return (
            <div className='mt-2 flex max-w-xl flex-col gap-2 text-sm'>
                <div className='text-muted-foreground'>
                    <div>
                        Original Dates :{' '}
                        <span className='mx-2 font-medium'>
                            {formatDateAndTime(parsedMetaData.oldStartDate ?? '', trip.vehzipcode, 'MMM DD, YYYY, h:mm A')}
                        </span>
                        to
                        <span className='mx-2 font-medium'>
                            {formatDateAndTime(parsedMetaData.oldEndDate ?? '', trip.vehzipcode, 'MMM DD, YYYY, h:mm A')}
                        </span>
                    </div>
                    <div>
                        Modified Dates :{' '}
                        <span className='mx-2 font-medium'>
                            {formatDateAndTime(parsedMetaData.newStartDate ?? '', trip.vehzipcode, 'MMM DD, YYYY, h:mm A')}
                        </span>
                        to
                        <span className='mx-2 font-medium'>
                            {formatDateAndTime(parsedMetaData.newEndDate ?? '', trip.vehzipcode, 'MMM DD, YYYY, h:mm A')}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className='flex flex-col gap-5'>
            <div>
                <h4>Logs</h4>
                <p className='text-[14px] text-muted-foreground'>Review all activity related to this trip.</p>
            </div>
            <div className='relative space-y-6 px-4 pb-6 pl-6'>
                <div className='before:-left-3 relative col-span-8 space-y-6 px-4 before:absolute before:top-2 before:bottom-0 before:w-0.5 before:bg-muted'>
                    {logs?.map((log: Log, index) => {
                        if (['VEHICLECONFIGEVENT', 'Pending', 'RENTALAGREEMENT'].includes(log.fromstatus)) {
                            return null;
                        }

                        return (
                            <div
                                key={index}
                                className='relative flex flex-col before:absolute before:top-2 before:left-[-33px] before:z-1 before:size-3 before:rounded-full before:bg-primary/70'>
                                <div className='font-medium'>{log.changedby ? logCreatorRef[log.changedby] : '-'}</div>
                                <div className='text-muted-foreground text-xs uppercase'>
                                    {formatDateAndTime(log.createddate ?? '', trip.vehzipcode, 'MMM DD, YYYY | h:mm A ')}
                                </div>
                                <p className='mt-3 text-md'>{log.comments}</p>
                                {log.tostatus === 'REQMODAPP' && log.metaData && renderMetaData(log.metaData)}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
