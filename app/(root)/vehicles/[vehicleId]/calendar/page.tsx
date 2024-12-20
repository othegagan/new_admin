'use client';

import { Skeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import MonthPicker from '@/components/ui/month-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useChannels } from '@/hooks/useChannels';
import { useVehicleFeaturesById, useVehicleTripById } from '@/hooks/useVehicles';
import { convertToTimeZoneISO, formatDateAndTime } from '@/lib/utils';
import '@/styles/fullcalendar.css';
import { deleteUnavailabilityById } from '@/server/dynamicPricingAndUnavailability';
import type FullCalendar from '@fullcalendar/react';
import { useQueryClient } from '@tanstack/react-query';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import CalendarComponent from '../../_components/CalendarComponent';
import AddUnavailabilityForm from '../../_components/unavailability/AddUnavailabilityForm';
import UpdateUnavailabilityForm from '../../_components/unavailability/UpdateUnavailabilityForm';

export default function VehicleCalendarPage() {
    const { vehicleId } = useParams();
    const queryClient = useQueryClient();

    const [selectedChannel, setSelectedChannel] = useState('1');
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

    const { data: channelsResponse, isLoading: isLoadingChannels, error: errorChannels } = useChannels();

    const isLoading = isLoadingTrips || isLoadingFeatures || isLoadingChannels;
    const error = errorTrips || errorFeatures || errorChannels;

    const tripsData = tripsResponse?.data?.activetripresponse || [];

    const dynamicPricing =
        featuresResponse?.data?.vehicleAllDetails[0]?.hostPriceResponses?.filter((item: any) => item.isActive === true) || [];

    const unavailabilityData = featuresResponse?.data?.vehicleUnavaliblityDetails || [];

    const vehiclePricePerDay = featuresResponse?.data?.vehicleAllDetails[0]?.price_per_hr || 0;

    const channelsData = channelsResponse?.data?.channels || [];

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

                {isLoadingChannels ? (
                    <Skeleton className='h-9 w-[200px] rounded-md' />
                ) : (
                    <Select
                        onValueChange={(value) => {
                            setSelectedChannel(value);
                            refetchData();
                        }}
                        value={selectedChannel}
                        defaultValue={selectedChannel}>
                        <SelectTrigger className='max-w-[200px]'>
                            <SelectValue placeholder='Select channel' />
                        </SelectTrigger>
                        <SelectContent>
                            {channelsData.map((item: any) => (
                                <SelectItem key={item.id} value={String(item.id)} className='capitalize'>
                                    {item.channelName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {isLoading && <div className='flex h-full w-full items-center justify-center'>Loading...</div>}

            {error && <div className='flex h-full w-full items-center justify-center'>Error: {error?.message}</div>}

            <div className='flex flex-col gap-4'>
                {!isLoading && !error && (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-6'>
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
        <div className='flex w-full flex-col gap-4 md:pl-4 lg:border-l-2'>
            <div className='flex w-full items-center justify-between'>
                <h4 className='text-nowrap text-lg'> Vehicle Unavailability</h4>
                <AddUnavailabilityForm vin={vin} vehicleId={vehicleId} refetchData={refetchData} zipcode={zipcode} />
            </div>
            <div>
                {unavailabilityData.map((item: any) => (
                    <div key={item.vinunavailableid} className='my-2 flex items-center justify-between gap-4 border-b pb-1.5 text-14'>
                        <div className='whitespace-nowrap'>
                            {formatDateAndTime(item.startdate, zipcode, 'MMM DD, YYYY')} -{' '}
                            {formatDateAndTime(item.enddate, zipcode, 'MMM DD, YYYY')}
                        </div>
                        <div className='flex items-center gap-2'>
                            <UpdateUnavailabilityForm
                                refetchData={refetchData}
                                zipcode={zipcode}
                                hostId={item.hostId}
                                dbStartDate={item.startdate}
                                dbEndDate={item.enddate}
                                dbId={item.vinunavailableid}
                            />

                            <Button
                                variant='secondary'
                                size='icon'
                                className='h-auto w-auto p-1.5'
                                onClick={() => deleteUnavailability(item.vinunavailableid)}>
                                <Trash2 className='size-4' />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
