'use client';

import { Main } from '@/components/layout/main';
import PageHeader from '@/components/layout/page-header';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { FormDescription } from '@/components/ui/extension/field';
import { JollyNumberField } from '@/components/ui/extension/numberfield';
import { Label } from '@/components/ui/label';
import { useHostConfigutations } from '@/hooks/useHostConfigutations';
import { currencyFormatter } from '@/lib/utils';
import { configurationsSchema } from '@/schemas';
import { updateHostConfigurations } from '@/server/configurations';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof configurationsSchema>;

export default function ConfigurationPage() {
    const { data: response, isLoading: loading, error, refetch } = useHostConfigutations();

    const data = response?.data.hostBusinessConstraints[0]?.constraintValueObject[0] || {
        averageRentaDays: 0,
        concessionFee: 0,
        concessionPercentage: 0,
        registrationFee: 0,
        stateTax: 0,
        upCharge: 0
    };

    const isUpdate: boolean = !!response?.data.hostBusinessConstraints[0]?.constraintValueObject[0];

    return (
        <Main className='h-full'>
            <PageHeader
                title='Tax & Fee Configurations'
                description='Configure your tax and fee calculations to ensure accurate earnings and compliance.'
            />

            <div className='my-4 h-full'>
                {loading && <CarLoadingSkeleton />}
                {error && <div>Error: {error.message}</div>}
                {!loading && !error && <ConstraintForm data={data} isUpdate={isUpdate} refetch={refetch} />}
            </div>
        </Main>
    );
}

function ConstraintForm({
    data,
    isUpdate,
    refetch
}: {
    data: any;
    isUpdate: boolean;
    refetch: any;
}) {
    const {
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(configurationsSchema),
        mode: 'all',
        defaultValues: {
            ...data
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const payload = {
                averageRentaDays: formData.averageRentaDays,
                registrationFee: formData.registrationFee,
                upCharge: formData.upCharge,
                concessionPercentage: formData.concessionPercentage,
                concessionFee: formData.concessionFee, // Not in use and not in ui
                stateTax: formData.stateTax,
                constraintName: 'PriceConstraint'
            };

            const response = await updateHostConfigurations(payload);
            if (response.success) {
                toast.success(response.message);
                refetch();
                reset({ ...formData });
            } else {
                toast.error(`Error in ${isUpdate ? 'updating' : 'inserting'} configurations ${response.message}`);
            }
        } catch (error: any) {
            console.error('Error updating configurations:', error);
            toast.error(`Error in ${isUpdate ? 'updating' : 'inserting'} configurations ${error.message}`);
        }
    };

    const registrationFee = watch('registrationFee');
    const averageRentaDays = watch('averageRentaDays');
    const [perDayRegistrationFee, setPerDayRegistrationFee] = useState(0);

    useEffect(() => {
        const fee = Number(averageRentaDays) > 0 ? Number(registrationFee) / Number(averageRentaDays) : 0;
        setPerDayRegistrationFee(fee);
    }, [registrationFee, averageRentaDays]);

    return (
        <form className=' flex max-w-5xl flex-col gap-5' onSubmit={handleSubmit(onSubmit)}>
            <div className='flex w-full flex-col gap-5 rounded-md border p-4'>
                <h5>Registration Configuration</h5>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-10'>
                    <div className=' flex flex-col gap-1'>
                        <Label htmlFor='averageRentaDays'>Average rental days</Label>
                        <FormDescription className='text-balance'>
                            The average number of days your vehicle can be rented out in a year.
                        </FormDescription>
                        <div className='flex items-center gap-2'>
                            <Controller
                                name='averageRentaDays'
                                control={control}
                                render={({ field }) => {
                                    const value = field.value === '' ? undefined : Number(field.value);
                                    return (
                                        // @ts-ignore
                                        <JollyNumberField
                                            defaultValue={value || 0}
                                            className='mt-1 max-w-44 sm:mt-0'
                                            id='averageRentaDays'
                                            isRequired
                                            formatOptions={{
                                                minimumFractionDigits: 0
                                            }}
                                            errorMessage={errors.averageRentaDays?.message}
                                            isInvalid={!!errors.averageRentaDays?.message}
                                            {...field}
                                            onChange={field.onChange}
                                        />
                                    );
                                }}
                            />
                            Day(s)
                        </div>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <Label htmlFor='registrationFee'>Registration Fee</Label>
                        <FormDescription className='text-balance'>
                            Any registration fees or licensing costs associated with your vehicle.
                        </FormDescription>
                        <Controller
                            name='registrationFee'
                            control={control}
                            render={({ field }) => {
                                const value = field.value === '' ? undefined : Number(field.value);
                                return (
                                    // @ts-ignore
                                    <JollyNumberField
                                        defaultValue={value || 0}
                                        className='mt-1 max-w-44 sm:mt-0'
                                        id='registrationFee'
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
                                        errorMessage={errors.registrationFee?.message}
                                        isInvalid={!!errors.registrationFee?.message}
                                    />
                                );
                            }}
                        />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <Label htmlFor='perDayRegistrationFee'>Pre Day Registration Fee</Label>
                        <FormDescription className='text-balance'>
                            The registration fee applied per rental day. (Auto-calculated)
                        </FormDescription>
                        <div className='relative mt-2 flex h-9 w-full items-center overflow-hidden rounded-md border border-input bg-transparent px-3 py-1 text-sm opacity-50 shadow-sm transition-colors md:max-w-44'>
                            {currencyFormatter(perDayRegistrationFee)}
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex w-full flex-col gap-5 rounded-md border p-4'>
                <h5>Additional Fees</h5>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-10'>
                    <div className='flex flex-col gap-1'>
                        <Label htmlFor='upCharge'>Short Notice Fee</Label>
                        <FormDescription className='text-balance'>The fee charged for short-notice rentals.</FormDescription>
                        <Controller
                            name='upCharge'
                            control={control}
                            render={({ field }) => {
                                const value = field.value === '' ? undefined : Number(field.value);
                                return (
                                    // @ts-ignore
                                    <JollyNumberField
                                        defaultValue={value || 0}
                                        className='mt-1 max-w-44 sm:mt-0'
                                        id='upCharge'
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
                                        errorMessage={errors.upCharge?.message}
                                        isInvalid={!!errors.upCharge?.message}
                                    />
                                );
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className='flex w-full flex-col gap-5 rounded-md border p-4'>
                <h5>Tax & Concession Configuration</h5>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-10'>
                    <div className='flex flex-col gap-1'>
                        <Label htmlFor='concessionPercentage'>Concession Percentage</Label>
                        <FormDescription className='text-balance'>The percentage discount offered for concessions.</FormDescription>
                        <div className='flex items-center gap-2'>
                            <Controller
                                name='concessionPercentage'
                                control={control}
                                render={({ field }) => {
                                    // Ensure field.value is a number or undefined
                                    const value = field.value === '' ? undefined : Number(field.value);
                                    return (
                                        // @ts-ignore
                                        <JollyNumberField
                                            defaultValue={value || 0}
                                            maxValue={100}
                                            className='mt-1 max-w-44 sm:mt-0'
                                            id='concessionPercentage'
                                            isRequired
                                            formatOptions={{
                                                style: 'decimal',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            }}
                                            {...field}
                                            errorMessage={errors.concessionPercentage?.message}
                                            isInvalid={!!errors.concessionPercentage?.message}
                                        />
                                    );
                                }}
                            />
                            <div className='mt-2 text-lg'>%</div>
                        </div>
                    </div>

                    <div className='flex flex-col gap-1'>
                        <Label htmlFor='stateTax'>State Tax Percentage</Label>
                        <FormDescription className='text-balance'>The applicable state rental tax percentage.</FormDescription>
                        <div className='flex items-center gap-2'>
                            <Controller
                                name='stateTax'
                                control={control}
                                render={({ field }) => {
                                    const value = field.value === '' ? undefined : Number(field.value);
                                    return (
                                        // @ts-ignore
                                        <JollyNumberField
                                            defaultValue={value || 0}
                                            maxValue={100}
                                            className='mt-1 max-w-44 sm:mt-0'
                                            id='stateTax'
                                            isRequired
                                            formatOptions={{
                                                style: 'decimal',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            }}
                                            {...field}
                                            onChange={field.onChange}
                                            errorMessage={errors.stateTax?.message}
                                            isInvalid={!!errors.stateTax?.message}
                                        />
                                    );
                                }}
                            />
                            <div className='mt-2 text-lg'>%</div>
                        </div>
                    </div>
                </div>
            </div>

            {errors.root?.message && <div className='text-red-500'>{errors.root?.message}</div>}

            <div className='my-6 flex items-center justify-end gap-x-6'>
                <Button type='submit' className='w-fit' loading={isSubmitting} disabled={!isDirty}>
                    {isSubmitting ? (isUpdate ? 'Updating...' : 'Saving...') : isUpdate ? 'Update' : 'Save Configuration'}
                </Button>
            </div>
        </form>
    );
}
