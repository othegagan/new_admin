import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { stateList } from '@/constants';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useVehicleMasterDataByVIN } from '@/hooks/useVehicles';
import { cn } from '@/lib/utils';
import { updateVehicleFeaturesById } from '@/server/vehicles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function MasterDataForm({
    nextStep,
    alreadyUploaded
}: {
    nextStep: () => void;
    alreadyUploaded: boolean;
}) {
    const searchParams = useSearchParams();
    const vin = searchParams.get('vin');
    const vehicleId = searchParams.get('vehicleId');

    if (!vehicleId || !vin) {
        return <div>Error: Invalid vehicle ID or VIN</div>;
    }

    const queryClient = useQueryClient();
    const refetchData = () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.vehicleFeaturesById, Number(vehicleId)]
        });
    };

    const { data: vinDBResponse, isLoading: vinDBLoading, error: vinDBError } = useVehicleMasterDataByVIN(String(vin));

    if (vinDBLoading) {
        return <CarLoadingSkeleton />;
    }

    if (vinDBError) {
        return <div>Error: {vinDBError?.message}</div>;
    }

    if (!vinDBResponse?.success) {
        return <div>Error: {vinDBResponse?.message}</div>;
    }

    const vinDBData = vinDBResponse?.data?.vinDetails[0];
    const vehicleData = vinDBResponse?.data?.vehicles[0];

    return (
        <main>
            <div className='flex flex-col gap-4'>
                <h5 className='font-semibold'>Vehicle Details</h5>
                <AdditionalDataForm
                    vehicleData={vehicleData}
                    vinDBData={vinDBData}
                    refetchData={refetchData}
                    nextStep={nextStep}
                    alreadyUploaded={alreadyUploaded}
                />
                <hr />
                <h5 className='font-semibold'>Make/Model</h5>
                <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
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
        </main>
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
            <div className='font-medium capitalize'>{title}</div>
            <div className={cn('text-muted-foreground text-sm', dataClassName)}>{data || '-'}</div>
        </div>
    );
}
const schema = z.object({
    number: z
        .string({ message: 'Vehicle Number is required' })
        .trim()
        .min(3, { message: 'Vehicle Number is required' })
        .max(10, { message: 'Vehicle Number is required' }),
    color: z.string().trim().min(3, { message: 'Vehicle Color is required' }).max(10, { message: 'Vehicle Color is required' }),
    vehicleState: z.string({ message: 'Vehicle State is required' })
});

type FormFields = z.infer<typeof schema>;

function AdditionalDataForm({ vehicleData, vinDBData, refetchData, nextStep, alreadyUploaded }: any) {
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            number: vehicleData.number || '',
            color: vehicleData.color || '',
            vehicleState: vehicleData.vehicleState || ''
        }
    });

    useEffect(() => {
        setValue('number', vehicleData?.number);
        setValue('color', vehicleData?.color);
        setValue('vehicleState', vehicleData?.vehicleState);
    }, [setValue, vehicleData?.number, vehicleData?.color, vehicleData?.vehicleState]);

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const session = await getSession();
            const { number, color, vehicleState } = formData;

            const updatePayload = {
                vehicleId: vehicleData.id,
                year: vinDBData['Model Year'],
                vNumber: number,
                vehicleState: vehicleState.toLowerCase() || 'Texas',
                vehicleColor: color
            };

            const uploadPayload = {
                vehicleId: vehicleData.id,
                featureNamesList: ['No of Doors', 'Seating Capacity'],
                featureDescription: ['4', 5],
                userId: session?.iduser,
                editable: true,
                make: vinDBData.Make,
                model: vinDBData.Model,
                year: vinDBData['Model Year'],
                vNumber: number,
                vehicleState: vehicleState.toLowerCase() || 'Texas',
                vehicleTypeId: 0,
                vehicleColor: color,
                tobeDisplayed: true,
                fuelType: vinDBData['Fuel Type - Primary'],
                hostId: session?.iduser
            };

            // console.log(alreadyUploaded ? `update : ${JSON.stringify(updatePayload)}` : `upload : ${JSON.stringify(uploadPayload)}`);

            const response = await updateVehicleFeaturesById({
                type: alreadyUploaded ? 'update_master_data' : 'upload_master_data',
                payload: alreadyUploaded ? updatePayload : uploadPayload
            });

            // console.log('response', response);

            if (response.success) {
                refetchData();
                toast.success(response.message);
                nextStep();
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
            <div className='grid grid-cols-1 gap-4 p-0.5 md:grid-cols-3'>
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
                                    <SelectContent className='max-h-64'>
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

            <div className='mt-6 flex items-center justify-end gap-x-6'>
                <Button type='submit' variant='black' loading={isSubmitting} suffix={<ArrowRight className='size-4' />}>
                    Next
                </Button>
            </div>
        </form>
    );
}
