'use client';

import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { stateList, vehicleConfigTabsContent } from '@/constants';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useVehicleFeaturesById, useVehicleMasterDataByVIN } from '@/hooks/useVehicles';
import { cn } from '@/lib/utils';
import { updateVehicleFeaturesById } from '@/server/vehicles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import SubHeader from '../../_components/layout/subheader';

export default function MasterDataPage() {
    const { vehicleId } = useParams();

    const queryClient = useQueryClient();
    const refetchData = () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.vehicleFeaturesById, Number(vehicleId)]
        });
    };

    const { data: response, isLoading, error } = useVehicleFeaturesById(Number(vehicleId));

    const vin = response?.data?.vehicleAllDetails[0].vin;

    const { data: vinDBResponse, isLoading: vinDBLoading, error: vinDBError } = useVehicleMasterDataByVIN(vin);

    if (vinDBLoading || isLoading) {
        return <CarLoadingSkeleton />;
    }

    if (error || vinDBError) {
        return <div>Error: {error?.message || vinDBError?.message}</div>;
    }

    if (!response?.success || !vinDBResponse?.success) {
        return <div>Error: {response?.message}</div>;
    }

    const vinDBData = vinDBResponse?.data?.vinDetails[0];
    const vehicleData = vinDBResponse?.data?.vehicles[0];

    return (
        <div className=' flex flex-col gap-4'>
            <SubHeader title={vehicleConfigTabsContent.master_data.title} description={vehicleConfigTabsContent.master_data.description} />
            <AdditionalDataForm vehicleData={vehicleData} vinDBData={vinDBData} refetchData={refetchData} />
            <hr />
            <h5 className='font-semibold'>Make/Model</h5>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
                <DataBlock title='VIN' data={vinDBData?.VIN} dataClassName='uppercase' />
                <DataBlock title='Make' data={vinDBData?.Make} />
                <DataBlock title='Model' data={vinDBData?.Model} />
                <DataBlock title='Year' data={vinDBData['Model Year']} />
                <DataBlock title='Series' data={vinDBData?.Series} />
                <DataBlock title='Trim' data={vinDBData?.Trim} />
            </div>
            <hr />
            <h5 className='font-semibold'>Vehicle Features</h5>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                <DataBlock title='Vehicle Type' data={vinDBData['Vehicle Type']} />
                <DataBlock title='Body Class' data={vinDBData['Body Class']} />
                <DataBlock title='Number of Doors' data={vinDBData?.Doors} />
                <DataBlock title='Primary Fuel Type' data={vinDBData['Fuel Type - Primary']} />
                <DataBlock title='Drive Type' data={vinDBData['Drive Type']} />
                <DataBlock title='Transmission Type' data={vinDBData['Transmission Style']} />
                <DataBlock title='Electrification Level' data={vinDBData['Electrification Level']} />
                <DataBlock title='Number of Seats' data={vinDBData['Number of Seats']} />
                <DataBlock title='Backup Camera' data={vinDBData['Backup Camera']} />
            </div>
        </div>
    );
}

function DataBlock({
    title,
    data,
    classNmae,
    dataClassName
}: {
    title: string;
    data: any;
    classNmae?: string;
    dataClassName?: string;
}) {
    // check if data is null or undefined or empty string
    // if(data === null || data === undefined || data === ''){
    //     return null;
    // }

    return (
        <div className={cn('flex flex-col gap-2', classNmae)}>
            <div className='truncate font-medium capitalize'>{title}</div>
            <div className={cn('truncate text-muted-foreground text-sm', dataClassName)}>{data || '-'}</div>
        </div>
    );
}

const schema = z.object({
    number: z.string({ message: 'Vehicle Number is required' }).trim(),
    color: z.string().trim().optional(),
    vehicleState: z.string({ message: 'Vehicle State is required' })
});

type FormFields = z.infer<typeof schema>;

function AdditionalDataForm({ vehicleData, vinDBData, refetchData }: any) {
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
        watch
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            number: vehicleData?.number,
            color: vehicleData?.color,
            vehicleState: vehicleData?.vehicleState
        }
    });

    // Watch for changes
    const watchedValues = watch();
    const initialValues = {
        number: vehicleData?.number || '',
        color: vehicleData?.color || '',
        vehicleState: vehicleData?.vehicleState?.toLowerCase() || ''
    };

    const hasChanges =
        watchedValues.number !== initialValues.number ||
        watchedValues.color !== initialValues.color ||
        watchedValues.vehicleState?.toLowerCase() !== initialValues.vehicleState;

    useEffect(() => {
        setValue('number', vehicleData?.number);
        setValue('color', vehicleData?.color);
        setValue('vehicleState', vehicleData?.vehicleState);
    }, [setValue, vehicleData?.number, vehicleData?.color, vehicleData?.vehicleState]);

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const { number, color, vehicleState } = formData;

            const payload = {
                vehicleId: vehicleData.id,
                year: vinDBData['Model Year'],
                vNumber: number,
                vehicleState: vehicleState.toLowerCase() || 'Texas',
                vehicleColor: color
            };

            const response = await updateVehicleFeaturesById({
                type: 'update_master_data',
                payload
            });

            if (response.success) {
                refetchData();
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Error updating master data:', error);
            toast.error('Error in updating master data:', error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <div className='grid grid-cols-2 gap-4 p-0.5 md:grid-cols-3 lg:grid-cols-4'>
                <div className='flex flex-col gap-2'>
                    <Label>Licence Plate Number</Label>
                    <Input {...register('number')} placeholder='Vehicle Number' />
                    {errors.number && <FormError>{errors.number.message}</FormError>}
                </div>

                <div className='flex flex-col gap-2'>
                    <Label>Registered State</Label>
                    <Controller
                        control={control}
                        name='vehicleState'
                        render={({ field }) => (
                            <>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value?.toLowerCase() || ''}
                                    defaultValue={field.value?.toLowerCase() || ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select state' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stateList.map((state) => (
                                            <SelectItem key={state.id} value={state.value.toLowerCase()}>
                                                {state.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.vehicleState && <FormError>{errors.vehicleState.message}</FormError>}
                            </>
                        )}
                    />
                </div>

                <div className='flex flex-col gap-2'>
                    <Label>Vehicle Color</Label>
                    <Input {...register('color')} placeholder='Vehicle Color' />
                    {errors.color && <FormError>{errors.color.message}</FormError>}
                </div>
            </div>

            <div className='flex items-center justify-end gap-x-6'>
                {hasChanges && (
                    <Button type='submit' loading={isSubmitting} loadingText='Saving...'>
                        Save
                    </Button>
                )}
            </div>
        </form>
    );
}
