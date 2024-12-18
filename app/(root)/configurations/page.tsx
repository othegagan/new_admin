'use client';

import { Main } from '@/components/layout/main';
import PageHeader from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { FormDescription } from '@/components/ui/extension/field';
import { JollyNumberField } from '@/components/ui/extension/numberfield';
import { Label } from '@/components/ui/label';
import { useHostConfigutations } from '@/hooks/useHostConfigutations';
import { requiredNumberSchema, requiredWholeNumberSchema } from '@/schemas/validationSchemas';
import { insertHostConfigurations, updateHostConfigurations } from '@/server/configurations';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
    averageRentaDays: requiredWholeNumberSchema,
    concessionFee: requiredNumberSchema,
    concessionPercentage: requiredNumberSchema,
    registrationFee: requiredNumberSchema,
    stateTax: requiredNumberSchema,
    upCharge: requiredNumberSchema
});

type FormFields = z.infer<typeof schema>;

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
        <Main>
            <PageHeader
                title='Tax Configurations'
                description='Configure your tax calculations to ensure accurate earnings and tax compliance.'
            />

            <div className='my-4'>
                {loading && <div>Loading...</div>}
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
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            ...data,
            concessionPercentage: data.concessionPercentage / 100
        } // Convert to percentage only because of the UI
    });

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const payload = {
                averageRentaDays: formData.averageRentaDays,
                concessionFee: formData.concessionFee,
                //@ts-ignore
                concessionPercentage: formData.concessionPercentage * 100, // Convert to percentage only because of the UI
                registrationFee: formData.registrationFee,
                stateTax: formData.stateTax,
                upCharge: formData.upCharge,
                constraintName: 'PriceConstraint'
            };

            if (isUpdate) {
                const response = await updateHostConfigurations(payload);
                if (response.success) {
                    toast.success(response.message);
                } else {
                    toast.error(`Error in updating configurations ${response.message}`);
                }
            } else {
                const response = await insertHostConfigurations(payload);
                if (response.success) {
                    toast.success(response.message);
                } else {
                    toast.error(`Error in inserting configurations ${response.message}`);
                }
            }
            refetch();
        } catch (error: any) {
            console.error('Error updating configurations:', error);
            toast.error('Error in updating configurations', error.message);
        }
    };

    return (
        <form className='mt-6 max-w-5xl' onSubmit={handleSubmit(onSubmit)}>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10'>
                <div className=' flex flex-col gap-1'>
                    <Label htmlFor='averageRentaDays'>Average rental days</Label>
                    <FormDescription>Enter the average number of days your vehicle can be rented out in a year.</FormDescription>
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
                    <Label htmlFor='concessionFee'>Concession Fee</Label>
                    <FormDescription>Concessions that can be offered to guests.</FormDescription>

                    <Controller
                        name='concessionFee'
                        control={control}
                        render={({ field }) => {
                            const value = field.value === '' ? undefined : Number(field.value);
                            return (
                                // @ts-ignore
                                <JollyNumberField
                                    defaultValue={value || 0}
                                    className='mt-1 max-w-44 sm:mt-0'
                                    id='concessionFee'
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
                                    errorMessage={errors.concessionFee?.message}
                                    isInvalid={!!errors.concessionFee?.message}
                                />
                            );
                        }}
                    />
                </div>

                <div className='flex flex-col gap-1'>
                    <Label htmlFor='concessionPercentage'>Concession Percentage</Label>
                    <FormDescription>Specify any applicable discounts or concessions that can be offered to guests.</FormDescription>
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
                                    className='mt-1 max-w-44 sm:mt-0'
                                    id='concessionPercentage'
                                    isRequired
                                    formatOptions={{
                                        style: 'percent',
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
                </div>

                <div className='flex flex-col gap-1'>
                    <Label htmlFor='upCharge'>Short Notice Fee</Label>
                    <FormDescription>Enter the amount of fees that will be charged to the host for the short notice.</FormDescription>
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

                <div className='flex flex-col gap-1'>
                    <Label htmlFor='stateTax'>State Rental Tax</Label>
                    <FormDescription>Enter the applicable state rental tax rate for your vehicle.</FormDescription>
                    <Controller
                        name='stateTax'
                        control={control}
                        render={({ field }) => {
                            const value = field.value === '' ? undefined : Number(field.value);
                            return (
                                // @ts-ignore
                                <JollyNumberField
                                    defaultValue={value || 0}
                                    className='mt-1 max-w-44 sm:mt-0'
                                    id='stateTax'
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
                                    errorMessage={errors.stateTax?.message}
                                    isInvalid={!!errors.stateTax?.message}
                                />
                            );
                        }}
                    />
                </div>

                <div className='flex flex-col gap-1'>
                    <Label htmlFor='registrationFee'>Registration Fee</Label>
                    <FormDescription>Enter any registration fees or licensing costs associated with your vehicle.</FormDescription>
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
            </div>

            {errors.root?.message && <div className='text-red-500'>{errors.root?.message}</div>}

            <div className='mt-6 flex items-center justify-end gap-x-6'>
                <Button type='submit' variant='black' loading={isSubmitting} disabled={!isDirty}>
                    {isSubmitting ? (isUpdate ? 'Updating...' : 'Saving...') : isUpdate ? 'Update' : 'Save Configuration'}
                </Button>
            </div>
        </form>
    );
}
