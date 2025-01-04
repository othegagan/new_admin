'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { JollyNumberField } from '@/components/ui/extension/numberfield';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
import { convertToTimeZoneISO, currencyFormatter, formatDateAndTime } from '@/lib/utils';
import { deleteDynamicPricingById, insertDynamicPricing } from '@/server/dynamicPricingAndUnavailability';
import { useQueryClient } from '@tanstack/react-query';
import { addDays, endOfMonth, format, startOfMonth } from 'date-fns';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DateRangeCalendar } from '../../../_components/DateRangeCalendar';

export default function DynamicPricingComponent() {
    const { vehicleId } = useParams();
    const queryClient = useQueryClient();

    const selectedChannel = '1';
    const currentMonth = new Date();
    const defaultStartDate = format(new Date(), 'yyyy-MM-dd');
    const defaultEndDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    const [isAdding, setIsAdding] = useState(false);
    const [price, setPrice] = useState(1);
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);

    const resetAddForm = () => {
        setPrice(1);
        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);
        setIsAdding(false);
    };

    const refetchData = () => {
        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.vehicleTripById, { startDate: start, endDate: end, vehicleId }] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.vehicleFeaturesById, Number(vehicleId)] });
        refetchFeatures();
    };

    const {
        data: featuresResponse,
        isLoading: isLoadingFeatures,
        error: errorFeatures,
        refetch: refetchFeatures
    } = useVehicleFeaturesById(Number(vehicleId));

    if (isLoadingFeatures) return <div className='h-32 w-full flex-center '>Loading...</div>;
    if (errorFeatures) return <div className='h-32 w-full flex-center '>Error: {errorFeatures?.message}</div>;

    const zipcode = featuresResponse?.data?.vehicleAllDetails[0]?.zipcode || '';
    const dynamicPricing =
        featuresResponse?.data?.vehicleAllDetails[0]?.hostPriceResponses?.filter((item: any) => item.isActive === true) || [];

    const handleAddPrice = async () => {
        try {
            const payload = {
                configuration: 'per_day',
                vehicleId: Number(vehicleId),
                fromDate: convertToTimeZoneISO(`${startDate}T00:00:00`, zipcode),
                toDate: convertToTimeZoneISO(`${endDate}T23:59:59`, zipcode),
                channelId: selectedChannel,
                hostId: 123, // Replace with actual hostId from session/auth.
                price
            };

            const response = await insertDynamicPricing(payload);
            if (response.success) {
                toast.success(response.message);
                refetchData();
                resetAddForm();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error('Error adding dynamic pricing:', error);
            toast.error('Failed to add pricing. Please try again.');
        }
    };

    const handleDelete = async (id: number) => {
        toast.promise(deleteDynamicPricingById(id), {
            loading: 'Deleting pricing...',
            success: (response) => {
                if (response.success) {
                    refetchData();
                }
                return response.message;
            },
            error: (error) => `Error: ${error.message}`
        });
    };

    return (
        <div className='flex w-full flex-col gap-4'>
            <div className='flex flex-col'>
                <div className='flex w-full items-center '>
                    <h4>
                        Custom Pricing Configuration <span className='text-muted-foreground'>(Optional)</span>
                    </h4>
                    {!isAdding && (
                        <Button
                            toolTip='Add custom pricing'
                            className='h-10 w-fit border-none p-3'
                            size='icon'
                            variant='outline'
                            onClick={() => setIsAdding(true)}>
                            <PlusCircle className='size-6' />
                        </Button>
                    )}
                </div>
                <div className='text-muted-foreground text-sm'>Set custom prices for specific dates or periods.</div>
            </div>
            {isAdding && (
                <div className='flex flex-col gap-4'>
                    <div className='flex flex-col gap-4 md:flex-row'>
                        <JollyNumberField
                            id='price'
                            label='Price'
                            defaultValue={price}
                            isRequired
                            minValue={1}
                            formatOptions={{
                                style: 'currency',
                                currency: 'USD',
                                currencyDisplay: 'symbol',
                                currencySign: 'standard',
                                minimumFractionDigits: 0
                            }}
                            onChange={setPrice}
                        />
                        <div className='flex flex-col gap-2'>
                            <Label>Date Range</Label>
                            <DateRangeCalendar
                                startDate={startDate}
                                endDate={endDate}
                                setStartDate={setStartDate}
                                setEndDate={setEndDate}
                            />
                        </div>
                    </div>
                    <div className='flex justify-end gap-4'>
                        <Button variant='outline' onClick={resetAddForm}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddPrice}>Save</Button>
                    </div>
                </div>
            )}
            <div className='max-w-md'>
                {dynamicPricing.map((item: any) => (
                    <div key={item.id} className='my-2 flex items-center justify-between gap-2 border-b pb-1.5 text-14'>
                        <div className='whitespace-nowrap text-14'>
                            {formatDateAndTime(item.fromDate, zipcode, 'MMM DD, YYYY')} -{' '}
                            {formatDateAndTime(item.toDate, zipcode, 'MMM DD, YYYY')}
                        </div>
                        <div className='font-semibold'>{currencyFormatter({ value: item.price, roundTo: 0 })}/Day</div>
                        <Button variant='secondary' size='icon' className='h-auto w-auto p-1.5' onClick={() => handleDelete(item.id)}>
                            <Trash2 className='size-4' />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
