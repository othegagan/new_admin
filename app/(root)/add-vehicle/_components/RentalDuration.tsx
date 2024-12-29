import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { JollyNumberField } from '@/components/ui/extension/numberfield';
import { vehicleConfigTabsContent } from '@/constants';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
import { updateVehicleFeaturesById } from '@/server/vehicles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface RentalDurationProps {
    nextStep: () => void;
    previousStep: () => void;
}

export default function RentalDuration({ nextStep, previousStep }: RentalDurationProps) {
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

    let minRentalDuration = 1;
    let maxRentalDuration = 30;

    const vehicleBusinessConstraints = response?.data?.vehicleBusinessConstraints;

    vehicleBusinessConstraints.map((value: any) => {
        if (value.constraintName === 'MinimumMaximumDays') {
            const constraint = JSON.parse(value.constraintValue);
            minRentalDuration = Number(constraint?.minimumDays);
            maxRentalDuration = Number(constraint?.maximumDays);
        }
    });

    return (
        <div className='flex flex-col'>
            <RentalDurationForm
                vechicleId={Number(vehicleId)}
                minRentalDuration={minRentalDuration}
                maxRentalDuration={maxRentalDuration}
                refetchData={refetchData}
                nextStep={nextStep}
                previousStep={previousStep}
            />
        </div>
    );
}

interface RentalDurationFormProps {
    vechicleId: number;
    minRentalDuration: number;
    maxRentalDuration: number;
    refetchData: () => void;
    nextStep: () => void;
    previousStep: () => void;
}

const schema = z.object({
    minRentalDuration: z.coerce
        .number({
            message: 'Must be a number'
        })
        .int('Please enter a whole number')
        .min(1),
    maxRentalDuration: z.coerce
        .number({
            message: 'Must be a number'
        })
        .int('Please enter a whole number')
});

type FormFields = z.infer<typeof schema>;

function RentalDurationForm({
    vechicleId,
    minRentalDuration = 1,
    maxRentalDuration = 30,
    refetchData,
    nextStep,
    previousStep
}: RentalDurationFormProps) {
    const {
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            minRentalDuration: minRentalDuration,
            maxRentalDuration: maxRentalDuration
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const session = await getSession();
            const { minRentalDuration, maxRentalDuration } = formData;

            const payload = {
                vehicleId: vechicleId,
                hostId: session?.iduser,
                minimumDays: minRentalDuration,
                maximumDays: maxRentalDuration
            };

            const response = await updateVehicleFeaturesById({
                type: 'mix_max_rental_duration',
                payload
            });

            if (response.success) {
                toast.success(response.message);
                reset({
                    minRentalDuration: minRentalDuration,
                    maxRentalDuration: maxRentalDuration
                });
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
            <CardTitle>{vehicleConfigTabsContent.rental_duration.title}</CardTitle>
            <CardDescription> {vehicleConfigTabsContent.rental_duration.description}</CardDescription>
            <div className='grid grid-cols-1 gap-4 md:my-10 md:grid-cols-2 md:gap-10'>
                <Controller
                    name='minRentalDuration'
                    control={control}
                    render={({ field }) => {
                        return (
                            // @ts-ignore
                            <JollyNumberField
                                id='mileageLimit'
                                label='Minimum Rental Duration (days)'
                                description='Specify the minimum number of days for a rental.'
                                minValue={1}
                                defaultValue={field.value || 1}
                                className='mt-1 sm:mt-0'
                                isRequired
                                {...field}
                                formatOptions={{
                                    minimumFractionDigits: 0
                                }}
                                onChange={field.onChange}
                                errorMessage={errors.minRentalDuration?.message}
                                isInvalid={!!errors.minRentalDuration?.message}
                            />
                        );
                    }}
                />
                <Controller
                    name='maxRentalDuration'
                    control={control}
                    render={({ field }) => {
                        return (
                            // @ts-ignore
                            <JollyNumberField
                                id='maxRentalDuration'
                                label='Maximum Rental Duration (days)'
                                description='Specify the maximum number of days for a rental.'
                                defaultValue={field.value || 30}
                                className='mt-1 sm:mt-0'
                                minValue={1}
                                isRequired
                                formatOptions={{
                                    minimumFractionDigits: 0
                                }}
                                {...field}
                                onChange={field.onChange}
                                errorMessage={errors.maxRentalDuration?.message}
                                isInvalid={!!errors.maxRentalDuration?.message}
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
