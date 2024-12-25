'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import MonthPicker from '@/components/ui/month-picker';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useVehicleFeaturesById, useVehicleTripById } from '@/hooks/useVehicles';
import { convertToTimeZoneISO, formatDateAndTime } from '@/lib/utils';
import { deleteUnavailabilityById, insertUnavailability } from '@/server/dynamicPricingAndUnavailability';
import '@/styles/fullcalendar.css';
import type FullCalendar from '@fullcalendar/react';
import { useQueryClient } from '@tanstack/react-query';
import { addDays, endOfMonth, format, startOfMonth } from 'date-fns';
import { PlusCircle, Trash2 } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import CalendarComponent from '../../_components/CalendarComponent';
import { DateRangeCalendar } from '../../_components/DateRangeCalendar';

export default function VehicleCalendarPage() {
    const { vehicleId } = useParams();
    const queryClient = useQueryClient();

    // const [selectedChannel, setSelectedChannel] = useState('1');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [startDate, setStartDate] = useState(format(startOfMonth(currentMonth), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(currentMonth), 'yyyy-MM-dd'));
    const calendarRef = useRef<FullCalendar>(null);

    function refetchData() {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.vehicleTripById, { startDate, endDate, vehicleId }]
        });
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.vehicleFeaturesById, Number(vehicleId)]
        });
        refetchFeatures();
    }

    function handleMonthChange(newMonth: Date) {
        setCurrentMonth(newMonth);
        const newStartDate = format(startOfMonth(newMonth), 'yyyy-MM-dd');
        const newEndDate = format(endOfMonth(newMonth), 'yyyy-MM-dd');
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    }

    const {
        data: featuresResponse,
        isLoading: isLoadingFeatures,
        error: errorFeatures,
        refetch: refetchFeatures
    } = useVehicleFeaturesById(Number(vehicleId));
    const zipcode = featuresResponse?.data?.vehicleAllDetails[0]?.zipcode || '';

    const {
        data: tripsResponse,
        isLoading: isLoadingTrips,
        error: errorTrips
    } = useVehicleTripById(
        convertToTimeZoneISO(`${startDate}T00:00:00`, zipcode),
        convertToTimeZoneISO(`${endDate}T11:59:59`, zipcode),
        Number(vehicleId)
    );

    // const { data: channelsResponse, isLoading: isLoadingChannels, error: errorChannels } = useChannels();

    const isLoading = isLoadingTrips || isLoadingFeatures;
    const error = errorTrips || errorFeatures;

    const tripsData = tripsResponse?.data?.activetripresponse || [];

    const dynamicPricing =
        featuresResponse?.data?.vehicleAllDetails[0]?.hostPriceResponses?.filter((item: any) => item.isActive === true) || [];

    const unavailabilityData = featuresResponse?.data?.vehicleUnavaliblityDetails || [];

    const vehiclePricePerDay = featuresResponse?.data?.vehicleAllDetails[0]?.price_per_hr || 0;

    // const channelsData = channelsResponse?.data?.channels || [];

    const vin = featuresResponse?.data?.vehicleAllDetails[0]?.vin || '';

    return (
        <div className='flex flex-col'>
            <div className='mb-4 flex w-full gap-6 p-0.5'>
                <MonthPicker
                    currentMonth={currentMonth}
                    onMonthChange={handleMonthChange}
                    setCurrentMonth={setCurrentMonth}
                    // calendarRef={calendarRef}
                    className='w-[200px]'
                />
            </div>

            {isLoading && <div className='flex h-full w-full items-center justify-center'>Loading...</div>}

            {error && <div className='flex h-full w-full items-center justify-center'>Error: {error?.message}</div>}

            <div className='flex flex-col gap-4'>
                {!isLoading && !error && (
                    <div className='grid grid-cols-1 gap-10 md:grid-cols-6'>
                        <div className='lg:col-span-4'>
                            <CalendarComponent
                                trips={tripsData}
                                blockedDates={unavailabilityData}
                                dynamicPricies={dynamicPricing}
                                calendarRef={calendarRef}
                                currentMonth={currentMonth}
                                vehiclePricePerDay={vehiclePricePerDay}
                                zipcode={zipcode}
                            />
                        </div>

                        <div className='lg:col-span-2'>
                            <UnavailabilityComponent
                                vin={vin}
                                vehicleId={Number(vehicleId)}
                                refetchData={refetchData}
                                unavailabilityData={unavailabilityData}
                                zipcode={zipcode}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function UnavailabilityComponent({
    vin,
    vehicleId,
    refetchData,
    unavailabilityData,
    zipcode
}: {
    vin: string;
    vehicleId: number;
    refetchData: () => void;
    unavailabilityData: any[];
    zipcode: string;
}) {
    const [isAdding, setIsAdding] = useState(false);
    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));

    const {
        handleSubmit,
        reset,
        formState: { isSubmitting }
    } = useForm({
        mode: 'onChange'
    });

    function startAdding() {
        setIsAdding(true);
    }

    function cancelAdding() {
        setIsAdding(false);
        resetForm();
    }

    function resetForm() {
        setStartDate(format(new Date(), 'yyyy-MM-dd'));
        setEndDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
        reset();
    }

    async function onSubmit() {
        try {
            const session = await getSession();
            const payload = {
                day: 0,
                vin,
                vehicleid: vehicleId,
                hostid: session?.iduser,
                repeattype: 0,
                startdate: convertToTimeZoneISO(`${startDate}T00:00:00`, zipcode),
                enddate: convertToTimeZoneISO(`${endDate}T23:59:59`, zipcode)
            };

            const response = await insertUnavailability(payload);

            if (response.success) {
                refetchData();
                cancelAdding();
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error: unknown) {
            console.error('Error adding unavailability:', error);
        }
    }

    async function deleteUnavailability(id: number) {
        toast.promise(deleteUnavailabilityById(id), {
            loading: 'Deleting Unavailability...',
            success: (response) => {
                if (response.success) {
                    refetchData();
                }
                return response.message;
            },
            error: (error) => `Error: ${error.message}`
        });
    }

    return (
        <div className='flex w-full flex-col gap-4'>
            <div className='flex w-full items-center'>
                <h4 className='text-nowrap text-lg'>Vehicle Unavailability</h4>
                {!isAdding ? (
                    <Button className='h-10 w-fit border-none p-3' size='icon' variant='outline' onClick={startAdding}>
                        <PlusCircle className='size-6' />
                    </Button>
                ) : null}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4 rounded-md border p-4'>
                    <div className='flex max-w-full flex-col gap-2'>
                        <Label htmlFor='date-range' className='font-medium'>
                            Date Range
                        </Label>
                        <DateRangeCalendar startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
                    </div>
                    <div className='ml-auto flex gap-2'>
                        <Button variant='outline' onClick={cancelAdding}>
                            Cancel
                        </Button>
                        <Button type='submit' loading={isSubmitting} loadingText='Saving...'>
                            Save
                        </Button>
                    </div>
                </form>
            )}

            <div>
                {unavailabilityData.map((item: any) => (
                    <div key={item.vinunavailableid} className='my-2 flex items-center justify-between gap-4 border-b pb-1.5 text-14'>
                        <div className='whitespace-nowrap'>
                            {formatDateAndTime(item.startdate, zipcode, 'MMM DD, YYYY')} -{' '}
                            {formatDateAndTime(item.enddate, zipcode, 'MMM DD, YYYY')}
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button variant='secondary' onClick={() => deleteUnavailability(item.vinunavailableid)}>
                                <Trash2 className='size-4 text-destructive' />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
