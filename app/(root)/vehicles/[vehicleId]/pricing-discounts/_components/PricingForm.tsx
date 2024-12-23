'use client';

import { Button } from '@/components/ui/button';
import { JollyNumberField } from '@/components/ui/extension/numberfield';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
import { requiredNumberSchema } from '@/schemas/validationSchemas';
import { updateVehicleFeaturesById } from '@/server/vehicles';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { getSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function Pricing() {
    const { vehicleId } = useParams();

    const queryClient = useQueryClient();
    const refetchData = () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.vehicleFeaturesById, Number(vehicleId)]
        });
    };

    const { data: response, isLoading, error } = useVehicleFeaturesById(Number(vehicleId));

    if (isLoading) {
        return <div className='h-32 w-full flex-center text-xl'>Loading...</div>;
    }

    if (error) {
        return <div className='h-32 w-full flex-center text-xl'>Error: {error.message}</div>;
    }

    if (!response?.success) {
        return <div className='h-32 w-full flex-center text-xl'>Error: {response?.message}</div>;
    }

    const vehiclePricePerDay: number = response?.data?.vehicleAllDetails[0].price_per_hr || 0;

    const numberOfDiscountDays = [3, 7, 30];

    // biome-ignore lint/style/useConst: <explanation>
    let discountPercentage = [0, 0, 0];

    const vehicleBusinessConstraints = response?.data?.vehicleBusinessConstraints;

    function extractDiscounts(constraints: any[], daysArray: number[]) {
        if (constraints) {
            for (let i = 0; i < constraints.length; i++) {
                const element = constraints[i];
                if (element.constraintName === 'Discounts') {
                    const discounts = JSON.parse(element.constraintValue).constraintValue;
                    if (daysArray.includes(3)) discountPercentage[0] = Number(discounts[0].discountPercentage); // Converting to percentage only because of the input number field
                    if (daysArray.includes(7)) discountPercentage[1] = Number(discounts[1].discountPercentage);
                    if (daysArray.includes(30)) discountPercentage[2] = Number(discounts[2].discountPercentage);
                }
            }
        }
    }

    extractDiscounts(vehicleBusinessConstraints, numberOfDiscountDays);

    return (
        <PricingForm
            vechicleId={Number(vehicleId)}
            vehiclePricePerDay={vehiclePricePerDay}
            discountPercentage={discountPercentage}
            refetchData={refetchData}
        />
    );
}

interface PricingFormProps {
    vechicleId: number;
    vehiclePricePerDay: number;
    discountPercentage: number[];
    refetchData: () => void;
}

const schema = z.object({
    pricePerDay: requiredNumberSchema,
    discount3Days: requiredNumberSchema,
    discount7Days: requiredNumberSchema,
    discount30Days: requiredNumberSchema
});

type FormFields = z.infer<typeof schema>;

function PricingForm({ vechicleId, vehiclePricePerDay = 0, discountPercentage = [0, 0, 0] }: PricingFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        control,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            pricePerDay: vehiclePricePerDay,
            discount3Days: discountPercentage[0] / 100, // Converting to percentage only because of the input number field
            discount7Days: discountPercentage[1] / 100,
            discount30Days: discountPercentage[2] / 100
        }
    });

    useEffect(() => {
        setValue('pricePerDay', vehiclePricePerDay);
        setValue('discount3Days', discountPercentage[0] / 100); // Converting to percentage only because of the input number field
        setValue('discount7Days', discountPercentage[1] / 100);
        setValue('discount30Days', discountPercentage[2] / 100);
    }, [setValue, vehiclePricePerDay, discountPercentage]);

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const session = await getSession();
            const { pricePerDay, discount3Days, discount7Days, discount30Days } = formData;

            //@ts-ignore
            const discountsArray = [discount3Days * 100, discount7Days * 100, discount30Days * 100];

            const payload = {
                constraintName: 'Discounts',
                vehicleId: vechicleId,
                numberOfDays: [3, 7, 30],
                discountPercentage: discountsArray,
                hostId: session?.iduser,
                pricePerDay: pricePerDay
            };

            const response = await updateVehicleFeaturesById({
                type: 'update_pricing_discounts',
                payload
            });
            if (response.success) {
                // refetchData();
                toast.success(response.message);
                reset({
                    pricePerDay: pricePerDay,
                    discount3Days: discountsArray[0] / 100, // Converting to percentage only because of the input number field
                    discount7Days: discountsArray[1] / 100,
                    discount30Days: discountsArray[2] / 100
                });
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Error updating pricing:', error);
            toast.error('Error in updating pricing :', error.message);
        } finally {
            reset();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4'>
                <input id='pricePerDay' type='hidden' {...register('pricePerDay')} />
            </div>

            <div className='flex flex-col gap-6'>
                <h3>Pricing </h3>

                <Controller
                    name='pricePerDay'
                    control={control}
                    render={({ field }) => {
                        const value = field.value === '' ? undefined : Number(field.value);
                        return (
                            // @ts-ignore
                            <JollyNumberField
                                id='pricePerDay'
                                label='Vehicle Price/Day Amount'
                                defaultValue={value || 0}
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
                                errorMessage={errors.pricePerDay?.message}
                                isInvalid={!!errors.pricePerDay?.message}
                            />
                        );
                    }}
                />

                <input id='discount3Days' type='hidden' {...register('discount3Days')} />
                <input id='discount7Days' type='hidden' {...register('discount7Days')} />
                <input id='discount30Days' type='hidden' {...register('discount30Days')} />
            </div>
            {isDirty && (
                <div className=' flex items-center justify-end gap-x-6'>
                    <Button type='submit' loading={isSubmitting} loadingText='Saving...'>
                        Save
                    </Button>
                </div>
            )}
        </form>
    );
}
