import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { JollyNumberField } from '@/components/ui/extension/numberfield';
import { vehicleConfigTabsContent } from '@/constants';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
import { requiredNumberSchema } from '@/schemas/validationSchemas';
import { updateVehicleFeaturesById } from '@/server/vehicles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface MileageLimitsProps {
    nextStep: () => void;
    previousStep: () => void;
}

export default function MileageLimits({ nextStep, previousStep }: MileageLimitsProps) {
    const searchParams = useSearchParams();
    const vin = searchParams.get('vin');
    const vehicleId = searchParams.get('vehicleId');

    if (!vehicleId || !vin) {
        return <div>Error: Invalid vehicle ID or VIN</div>;
    }

    const { data: response, isLoading, error } = useVehicleFeaturesById(Number(vehicleId));

    const queryClient = useQueryClient();
    const refetchData = () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.vehicleFeaturesById, Number(vehicleId)]
        });
    };

    if (isLoading) {
        return <CarLoadingSkeleton />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!response?.success) {
        return <div>Error: {response?.message}</div>;
    }

    let mileageLimit = 0;

    let extraMileageCost = 0;

    const vehicleBusinessConstraints = response?.data?.vehicleBusinessConstraints;

    vehicleBusinessConstraints.map((value: any) => {
        if (value.constraintName === 'MileageConstraint') {
            const constraint = JSON.parse(value.constraintValue);
            mileageLimit = Number(constraint?.mileageLimit) || 0;
            extraMileageCost = Number(constraint?.extraMileageCost) || 0;
        }
    });

    return (
        <div className='flex flex-col'>
            <MileageLimitsForm
                vechicleId={Number(vehicleId)}
                mileageLimit={mileageLimit}
                extraMileageCost={extraMileageCost}
                refetchData={refetchData}
                nextStep={nextStep}
                previousStep={previousStep}
            />
        </div>
    );
}

interface MileageLimitsFormProps {
    mileageLimit: number;
    extraMileageCost: number;
    vechicleId: number;
    refetchData: () => void;
    nextStep: () => void;
    previousStep: () => void;
}

const schema = z.object({
    mileageLimit: requiredNumberSchema,
    extraMileageCost: requiredNumberSchema
});

type FormFields = z.infer<typeof schema>;

function MileageLimitsForm({
    vechicleId,
    mileageLimit = 0,
    extraMileageCost = 0,
    refetchData,
    nextStep,
    previousStep
}: MileageLimitsFormProps) {
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
            mileageLimit: mileageLimit,
            extraMileageCost: extraMileageCost
        }
    });

    useEffect(() => {
        setValue('mileageLimit', mileageLimit);
        setValue('extraMileageCost', extraMileageCost);
    }, [setValue, mileageLimit, extraMileageCost]);

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const session = await getSession();
            const { mileageLimit, extraMileageCost } = formData;

            const payload = {
                constraintName: 'Discounts',
                vehicleId: vechicleId,
                hostId: session?.iduser,
                dailyMileageLimit: mileageLimit,
                extraMileageCost: extraMileageCost
            };

            const response = await updateVehicleFeaturesById({
                type: 'upload_mileage_limits',
                payload
            });
            if (response.success) {
                toast.success(response.message);
                refetchData();
                nextStep();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Error updating mileage:', error);
            toast.error('Error in updating mileage :', error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <CardTitle>{vehicleConfigTabsContent.mileage_limits.title}</CardTitle>
            <CardDescription> {vehicleConfigTabsContent.mileage_limits.description}</CardDescription>
            <div className='grid grid-cols-1 gap-4 md:my-10 md:grid-cols-2'>
                <Controller
                    name='mileageLimit'
                    control={control}
                    render={({ field }) => {
                        const value = field.value === '' ? undefined : Number(field.value);
                        return (
                            // @ts-ignore
                            <JollyNumberField
                                id='mileageLimit'
                                label='Daily Mileage Limit (miles)'
                                description='Set a daily limit on the number of miles a guest can drive.'
                                defaultValue={value || 0}
                                className='mt-1 sm:mt-0'
                                isRequired
                                {...field}
                                onChange={field.onChange}
                                errorMessage={errors.mileageLimit?.message}
                                isInvalid={!!errors.mileageLimit?.message}
                            />
                        );
                    }}
                />
                <Controller
                    name='extraMileageCost'
                    control={control}
                    render={({ field }) => {
                        const value = field.value === '' ? undefined : Number(field.value);
                        return (
                            // @ts-ignore
                            <JollyNumberField
                                id='extraMileageCost'
                                label='Extra Mileage Cost Per Mile'
                                description='Set a charge for each mile driven over the daily limit.'
                                defaultValue={value || 0}
                                className='mt-1 sm:mt-0'
                                isRequired
                                formatOptions={{
                                    style: 'currency',
                                    currency: 'USD',
                                    currencyDisplay: 'symbol',
                                    currencySign: 'standard',
                                    minimumFractionDigits: 0
                                }}
                                {...field}
                                onChange={field.onChange}
                                errorMessage={errors.extraMileageCost?.message}
                                isInvalid={!!errors.extraMileageCost?.message}
                            />
                        );
                    }}
                />
            </div>

            <div className='mt-6 flex items-center justify-between gap-x-6'>
                <Button onClick={previousStep} variant='outline'>
                    <ArrowLeft className='size-4' /> Prev
                </Button>

                <Button type='submit' variant='black' loading={isSubmitting} suffix={<ArrowRight className='size-4' />}>
                    Next
                </Button>
            </div>
        </form>
    );
}
