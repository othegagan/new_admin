'use client';

import { Button } from '@/components/ui/button';
import { JollyNumberField } from '@/components/ui/extension/numberfield';
import { vehicleConfigTabsContent } from '@/constants';
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
import SubHeader from '../../_components/layout/subheader';

export default function PricingDiscountsPage() {
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
        <div className='flex flex-col'>
            <SubHeader title={vehicleConfigTabsContent.pricing.title} description={vehicleConfigTabsContent.pricing.description} />
            <PricingAndDiscountsForm
                vechicleId={Number(vehicleId)}
                vehiclePricePerDay={vehiclePricePerDay}
                discountPercentage={discountPercentage}
                refetchData={refetchData}
            />
        </div>
    );
}

interface PricingAndDiscountsFormProps {
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

function PricingAndDiscountsForm({
    vechicleId,
    vehiclePricePerDay = 0,
    discountPercentage = [0, 0, 0],
    refetchData
}: PricingAndDiscountsFormProps) {
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
                refetchData();
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Error updating pricing:', error);
            toast.error('Error in updating pricing :', error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4'>
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
            </div>

            <div className='flex flex-col gap-4'>
                <div>
                    <h4>Discounts </h4>
                    <p className='text-sm'>The selected discount will be applied to the reservation.</p>
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <Controller
                        name='discount3Days'
                        control={control}
                        render={({ field }) => {
                            const value = field.value === '' ? undefined : Number(field.value);
                            return (
                                // @ts-ignore
                                <JollyNumberField
                                    id='discount3Days'
                                    label='3 Days Rental Discount'
                                    defaultValue={value || 0}
                                    isRequired
                                    formatOptions={{
                                        style: 'percent',
                                        minimumFractionDigits: 0
                                    }}
                                    {...field}
                                    onChange={field.onChange}
                                    errorMessage={errors.discount3Days?.message}
                                    isInvalid={!!errors.discount3Days?.message}
                                />
                            );
                        }}
                    />
                    <Controller
                        name='discount7Days'
                        control={control}
                        render={({ field }) => {
                            const value = field.value === '' ? undefined : Number(field.value);
                            return (
                                // @ts-ignore
                                <JollyNumberField
                                    id='discount7Days'
                                    label='7 Days Rental Discount'
                                    defaultValue={value || 0}
                                    isRequired
                                    formatOptions={{
                                        style: 'percent',
                                        minimumFractionDigits: 0
                                    }}
                                    {...field}
                                    onChange={field.onChange}
                                    errorMessage={errors.discount7Days?.message}
                                    isInvalid={!!errors.discount7Days?.message}
                                />
                            );
                        }}
                    />
                    <Controller
                        name='discount30Days'
                        control={control}
                        render={({ field }) => {
                            const value = field.value === '' ? undefined : Number(field.value);
                            return (
                                // @ts-ignore
                                <JollyNumberField
                                    id='discount30Days'
                                    label='30 Days Rental Discount'
                                    defaultValue={value || 0}
                                    isRequired
                                    formatOptions={{
                                        style: 'percent',
                                        minimumFractionDigits: 0
                                    }}
                                    {...field}
                                    onChange={field.onChange}
                                    errorMessage={errors.discount30Days?.message}
                                    isInvalid={!!errors.discount30Days?.message}
                                />
                            );
                        }}
                    />
                </div>
            </div>

            <div className='mt-6 flex items-center justify-end gap-x-6'>
                <Button type='submit' loading={isSubmitting} loadingText='Saving...'>
                    Save
                </Button>
            </div>
        </form>
    );
}
