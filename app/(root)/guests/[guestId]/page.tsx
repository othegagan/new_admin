'use client';

import { Main } from '@/components/layout/main';
import { DriverProfileSkeleton, DrivingLicenseSkeleton } from '@/components/skeletons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import ImagePreview from '@/components/ui/image-preview';
import { useDriverLicenseDetails, useGuestsHistory } from '@/hooks/useGuests';
import { currencyFormatter } from '@/lib/utils';
import type { Channel } from '@/types';
import { format } from 'date-fns';
import { AlertCircle, BadgeCheck, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { driverBookingHistoryColumns } from '../_components/columns';

type params = Promise<{ [key: string]: string | string[] | undefined }>;

export default function Driver(props: {
    params: params;
}) {
    const router = useRouter();
    const { guestId } = use(props.params);

    const { data: response, isLoading, error } = useGuestsHistory(guestId as string);

    const bookingHistory = response?.data?.driverRentalDetails[0]?.driverTripDetails || [];

    const driverInfo = response?.data?.driverRentalDetails[0];

    const idScanRequestId = response?.data?.driverRentalDetails[0]?.idScanRequestID || null;
    const channelName: Channel = response?.data?.driverRentalDetails[0]?.channelName;

    return (
        <Main fixed className='overflow-y-auto pt-0'>
            <div className='mx-auto flex w-full max-w-5xl flex-col gap-4'>
                <button
                    type='button'
                    className='inline-flex w-fit items-center text-md text-muted-foreground hover:text-foreground'
                    onClick={() => router.back()}>
                    <ChevronLeft className='mr-1 h-4 w-4' />
                    Back
                </button>
                {isLoading && <DriverProfileSkeleton />}
                {error && <div>Error: {error?.message}</div>}
                {!isLoading && !response?.success && <div>Error: {response?.message}</div>}
                {!isLoading && !error && response?.success && (
                    <>
                        <DriverPersonalInfo driver={driverInfo} />
                        <hr />
                        <DriverLicenseDetails requestId={idScanRequestId} channel={channelName} />
                        <hr />
                        <DriverBookingHistory bookingHistory={bookingHistory} />
                    </>
                )}
            </div>
        </Main>
    );
}

function DriverPersonalInfo({ driver }: { driver: any }) {
    const fullAddress = [driver?.address1, driver?.address2, driver?.cityName, driver?.state, driver?.postCode, driver?.country]
        .filter(Boolean)
        .join(' ');
    return (
        <>
            <div className='mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
                <div className='flex items-center gap-4'>
                    <Avatar className='size-24 rounded-md lg:size-28'>
                        <AvatarImage src={driver?.userImage} className='h-full w-full' alt={`${driver?.firstName} ${driver?.lastName}`} />
                        <AvatarFallback className='rounded-md text-center font-semibold text-2xl uppercase'>
                            {driver?.firstName[0]}
                            {driver?.firstName[1]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className='font-bold text-2xl'>
                            {driver?.firstName} {driver?.lastName}
                        </h1>
                        <p className='text-muted-foreground text-sm'>Joined {format(driver?.createdDate, 'MMM yyyy')}</p>
                        <div className='mt-1 flex items-center gap-2'>
                            <Badge variant='secondary'>
                                {driver?.numberOfBookings > 0 ? driver?.numberOfBookings : 'No'}{' '}
                                {driver?.numberOfBookings > 1 ? 'Bookings' : 'Booking'}
                            </Badge>
                            <Badge variant='secondary'>Driver Score: -</Badge>
                        </div>
                        <Badge variant='outline' className='mt-2'>
                            Status: Active
                        </Badge>
                    </div>
                </div>
                <Card className='w-full md:w-auto'>
                    <CardContent className='p-4'>
                        <h4 className='font-semibold text-lg'>Revenue Generated</h4>
                        <p className='font-bold text-3xl'>{currencyFormatter(driver?.totalEarnings)}</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h4 className='mb-4 font-semibold text-lg'>Personal Information</h4>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div className='flex flex-col gap-1'>
                        <p className='flex items-center gap-2 text-sm'>
                            Contact Number
                            {driver?.isPhoneVarified ? <BadgeCheck className='size-6 text-green-500' /> : null}
                        </p>
                        <p className='font-semibold text-sm'>{driver?.phoneNumber || '-'}</p>
                        {driver?.isPhoneVarified && (
                            <p className='text-muted-foreground text-xs'>Verified On {format(new Date(driver?.updatedDate), 'PP')}</p>
                        )}
                    </div>
                    <div className='flex flex-col gap-1'>
                        <p className='flex items-center gap-2 text-sm'>
                            Email
                            {driver?.isEmailVarified ? <BadgeCheck className='size-6 text-green-500' /> : null}
                        </p>
                        <p className='font-semibold text-sm'>{driver?.emailId || '-'}</p>
                        {driver?.isEmailVarified && (
                            <p className='text-muted-foreground text-xs'>Verified On {format(new Date(driver?.updatedDate), 'PP')}</p>
                        )}
                    </div>
                    <div className='flex flex-col gap-1'>
                        <p className='text-sm'>Address</p>
                        <p className='font-semibold text-sm'>{fullAddress || '-'}</p>
                        {driver?.address1 && (
                            <p className='text-muted-foreground text-xs'>Verified On {format(new Date(driver?.updatedDate), 'PP')}</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function DriverLicenseDetails({ requestId, channel }: { requestId: string | null; channel: Channel }) {
    if (!requestId)
        return (
            <div>
                <h4 className='mb-4 font-semibold text-lg'>Driver's License</h4>
                <p className='text-muted-foreground text-sm'>No Driver's License Found</p>
            </div>
        );

    const { data: response, isLoading, error } = useDriverLicenseDetails(requestId, channel);

    if (isLoading) return <DrivingLicenseSkeleton />;

    if (error)
        return (
            <div>
                <h4 className='mb-4 font-semibold text-lg'>Driver's License</h4>
                <p className='text-muted-foreground text-sm'> {error?.message}</p>
            </div>
        );

    return (
        <>
            <h4 className='mb-4 font-semibold text-lg'>Driver's License</h4>

            <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-6'>
                <div className='grid grid-cols-2 gap-4 md:col-span-4 md:grid-cols-3'>
                    <div>
                        <p className='mb-2 font-medium text-sm'>Selfie</p>
                        <ImagePreview
                            url={response?.images.selfie ? `data:image/jpeg;base64,${response?.images.selfie}` : null}
                            alt='Selfie'
                            className='aspect-[3/2] rounded-lg border object-cover object-center'
                        />
                    </div>
                    <div>
                        <p className='mb-2 font-medium text-sm'>Driver's License Front</p>
                        <ImagePreview
                            url={response?.images.front ? `data:image/jpeg;base64,${response?.images.front}` : null}
                            alt='Front'
                            className='aspect-[3/2] rounded-lg border object-cover object-center'
                        />
                    </div>
                    <div>
                        <p className='mb-2 font-medium text-sm'>Driver's License Back</p>
                        <ImagePreview
                            url={response?.images.back ? `data:image/jpeg;base64,${response?.images.back}` : null}
                            alt='Back'
                            className='aspect-[3/2] rounded-lg border object-cover object-center'
                        />
                    </div>
                </div>

                <div className='gap-6 md:col-span-2'>
                    <p className='mb-2 font-medium text-sm'>Extracted Details</p>

                    <div className='space-y-1'>
                        <div className='text-sm'>
                            <span className='font-semibold text-muted-foreground'>Full Name :</span> {response?.personalInfo?.fullName}
                        </div>
                        <div className='text-sm'>
                            <span className='font-semibold text-muted-foreground'>Date of Birth :</span> {response?.personalInfo?.dob}
                        </div>
                        <div className='text-sm'>
                            <span className='font-semibold text-muted-foreground'>Full Address :</span>{' '}
                            {response?.personalInfo?.fullAddress}
                        </div>
                        <div className='text-sm'>
                            <span className='font-semibold text-muted-foreground'>Expires On :</span> {response?.personalInfo?.expires}
                        </div>
                        <div className='text-sm'>
                            <span className='font-semibold text-muted-foreground'>Driving Licence Number :</span>{' '}
                            {response?.personalInfo?.drivingLicenceNumber}
                        </div>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
                {response?.scores.map((score, index) => (
                    <Card key={index} className='flex gap-2 p-2 py-2.5'>
                        {score.status === 'success' ? (
                            <CheckCircle2 className='h-5 w-5 text-green-600' />
                        ) : (
                            <AlertCircle className='h-5 w-5 text-red-600' />
                        )}
                        <div className='flex flex-1 flex-col gap-2'>
                            <div className='flex items-center justify-between gap-2'>
                                <p className='font-medium text-sm'>{score.label}</p>
                                {score.actionLabel && (
                                    <p className='cursor-pointer text-muted-foreground text-xs underline'>{score.actionLabel}</p>
                                )}
                                {!score.actionLabel && <p className='font-medium text-sm'>Score: {score.score}</p>}
                            </div>
                            <p className='text-muted-foreground text-xs'>{score.description}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </>
    );
}

function DriverBookingHistory({ bookingHistory }: { bookingHistory: any[] }) {
    const bookingHistoryData = bookingHistory.map((booking: any, index: number) => ({
        ...booking,
        vin: booking?.vehicleDetails[0].vin,
        make: booking?.vehicleDetails[0].make,
        model: booking?.vehicleDetails[0].model,
        year: booking?.vehicleDetails[0].year,
        slNo: index + 1
    }));

    return (
        <>
            <h4 className='font-semibold text-lg'>Booking History</h4>

            <DataTable columns={driverBookingHistoryColumns} data={bookingHistoryData} sortBasedOn='slNo' />
        </>
    );
}
