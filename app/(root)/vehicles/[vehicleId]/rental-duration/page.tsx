'use client';

import { Button } from '@/components/ui/button';
import { JollyNumberField } from '@/components/ui/extension/numberfield';
import { vehicleConfigTabsContent } from '@/constants';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
import { updateVehicleFeaturesById } from '@/server/vehicles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import type { DateValue } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import SubHeader from '../../_components/layout/subheader';

export default function StatusPage() {
    const { vehicleId } = useParams();

    const queryClient = useQueryClient();
    const refetchData = () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.vehicleFeaturesById, Number(vehicleId)]
        });
    };

    const { data: response, isLoading, error } = useVehicleFeaturesById(Number(vehicleId));

    if (isLoading) {
        return <div>Loading...</div>;
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
            <SubHeader
                title={vehicleConfigTabsContent.rental_duration.title}
                description={vehicleConfigTabsContent.rental_duration.description}
            />
            <StatusForm
                vechicleId={Number(vehicleId)}
                minRentalDuration={minRentalDuration}
                maxRentalDuration={maxRentalDuration}
                refetchData={refetchData}
            />
        </div>
    );
}

interface MileageLimitsFormProps {
    vechicleId: number;
    minRentalDuration: number;
    maxRentalDuration: number;
    refetchData: () => void;
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
        .int('Please enter a whole number'),
    isActive: z.boolean(),
    endDate: z.custom<DateValue>().refine((value) => value !== null && value !== undefined, {
        message: 'Please select a date'
    })
});

type FormFields = z.infer<typeof schema>;

function StatusForm({ vechicleId, minRentalDuration = 1, maxRentalDuration = 30, refetchData }: MileageLimitsFormProps) {
    const {
        handleSubmit,

        control,
        reset,
        formState: { errors, isSubmitting, isDirty }
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
                refetchData();
                toast.success(response.message);
                reset({
                    minRentalDuration: minRentalDuration,
                    maxRentalDuration: maxRentalDuration
                });
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Error updating status:', error);
            toast.error('Error in updating status :', error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
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

            <div className='flex items-center justify-end gap-x-6'>
                <Button type='submit' loading={isSubmitting} disabled={!isDirty} loadingText='Saving...' className='w-fit'>
                    Save
                </Button>
            </div>
        </form>
    );
}
