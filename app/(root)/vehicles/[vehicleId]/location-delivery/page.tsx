'use client';

import { AddressCombobox } from '@/components/extra/address-combo-box';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { FormDescription, FormError, Label } from '@/components/ui/extension/field';
import { JollyNumberField } from '@/components/ui/extension/numberfield';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { stateList, vehicleConfigTabsContent } from '@/constants';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
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

export default function LocationDeliveryPage() {
    const { vehicleId } = useParams();

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

    const vehicleDetails = response?.data?.vehicleAllDetails[0];

    const fullAddress = {
        address1: vehicleDetails?.address1,
        address2: vehicleDetails?.address2,
        city: vehicleDetails?.cityname,
        state: vehicleDetails?.state.toLowerCase(),
        zipcode: vehicleDetails?.zipcode,
        latitude: vehicleDetails?.latitude,
        longitude: vehicleDetails?.longitude
    };

    let deliveryEnabled = false;
    let deliveryToAirport = false;
    let deliveryRadius = 1;
    let airportDeliveryCost = 1;
    let nonAirportDeliveryCost = 1;

    const vehicleBusinessConstraints = response?.data?.vehicleBusinessConstraints;

    vehicleBusinessConstraints.map((value: any) => {
        if (value.constraintName === 'DeliveryDetails') {
            const constraint = JSON.parse(value.constraintValue);
            deliveryEnabled = true;
            deliveryRadius = Number(constraint?.deliveryRadius) || 1;
            airportDeliveryCost = Number(constraint?.airportDeliveryCost) || 0;
            nonAirportDeliveryCost = Number(constraint?.nonAirportDeliveryCost) || 0;
            deliveryToAirport = constraint?.deliveryToAirport || false;
        }
    });

    return (
        <div className='flex flex-col gap-4'>
            <SubHeader
                title={vehicleConfigTabsContent.location_delivery.title}
                description={vehicleConfigTabsContent.location_delivery.description}
            />

            <LocationDeliveryForm
                vechicleId={Number(vehicleId)}
                deliveryEnabled={deliveryEnabled}
                deliveryRadius={deliveryRadius}
                airportDeliveryCost={airportDeliveryCost}
                nonAirportDeliveryCost={nonAirportDeliveryCost}
                deliveryToAirport={deliveryToAirport}
                fullAddress={fullAddress}
                refetchData={refetchData}
            />
        </div>
    );
}

interface LocationDeliveryFormProps {
    vechicleId: number;
    deliveryEnabled: boolean;
    deliveryRadius: number;
    airportDeliveryCost: number;
    nonAirportDeliveryCost: number;
    deliveryToAirport: boolean;
    fullAddress: any;
    refetchData: () => void;
}

const schema = z.object({
    deliveryEnabled: z.boolean(),
    deliveryRadius: z.union([
        z.coerce
            .number({
                message: 'Must be a number'
            })
            .min(1, 'Delivery Radius must be greater than 0')
            .optional(),
        z.literal('').refine(() => false, {
            message: 'This field is required'
        })
    ]),
    airportDeliveryCost: z.union([
        z.coerce
            .number({
                message: 'Must be a number'
            })
            .optional(),
        z.literal('').refine(() => false, {
            message: 'This field is required'
        })
    ]),
    nonAirportDeliveryCost: z.union([
        z.coerce
            .number({
                message: 'Must be a number'
            })
            .optional(),
        z.literal('').refine(() => false, {
            message: 'This field is required'
        })
    ]),
    deliveryToAirport: z.boolean(),
    fullAddress: z.object({
        address1: z.string({ message: 'Address1 is required' }).trim(),
        address2: z.string().optional(),
        city: z.string({ message: 'City is required' }).trim(),
        state: z.string({ message: 'State is required' }).trim(),
        zipcode: z
            .string({ message: 'Zipcode is required' })
            .min(4, { message: 'Zipcode is required' })
            .max(6, { message: 'Max 6 digits' }),
        latitude: z.string(),
        longitude: z.string()
    })
});

type FormFields = z.infer<typeof schema>;

function LocationDeliveryForm({
    vechicleId,
    deliveryEnabled = false,
    deliveryRadius = 1,
    airportDeliveryCost = 0,
    nonAirportDeliveryCost = 0,
    deliveryToAirport = false,
    fullAddress,
    refetchData
}: LocationDeliveryFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        control,
        watch,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            deliveryEnabled,
            deliveryRadius,
            airportDeliveryCost,
            nonAirportDeliveryCost,
            deliveryToAirport,
            fullAddress
        }
    });

    const setFullAddress = (address: any) => {
        setValue('fullAddress.address1', address.address1, { shouldDirty: true });
        setValue('fullAddress.address2', address?.address2, { shouldDirty: true });
        setValue('fullAddress.city', address.city, { shouldDirty: true });
        setValue('fullAddress.state', address.state, { shouldDirty: true });
        setValue('fullAddress.zipcode', String(address.zipcode), { shouldDirty: true });
        setValue('fullAddress.latitude', String(address.latitude), { shouldDirty: true });
        setValue('fullAddress.longitude', String(address.longitude), { shouldDirty: true });
    };

    const deliveryEnabledState = watch('deliveryEnabled');

    useEffect(() => {
        reset({
            deliveryEnabled,
            deliveryRadius,
            airportDeliveryCost,
            nonAirportDeliveryCost,
            deliveryToAirport,
            fullAddress
        });
    }, [deliveryEnabled, deliveryRadius, airportDeliveryCost, nonAirportDeliveryCost, deliveryToAirport, fullAddress, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const session = await getSession();
            const { deliveryEnabled, deliveryRadius, airportDeliveryCost, nonAirportDeliveryCost, deliveryToAirport, fullAddress } =
                formData;

            const payload: any = {
                vehicleId: vechicleId,
                hostId: session?.iduser,
                address1: fullAddress.address1,
                address2: fullAddress.address2 || '',
                zipCode: fullAddress.zipcode,
                cityName: fullAddress.city,
                state: fullAddress.state,
                country: 'USA',
                latitude: fullAddress.latitude || '',
                longitude: fullAddress.longitude || '',
                hasDelivery: deliveryEnabled
            };

            if (deliveryEnabled) {
                if (deliveryToAirport) {
                    payload.deliveryToAirport = deliveryToAirport;
                }
                payload.deliveryRadius = deliveryRadius;
                payload.nonAirportDeliveryCost = nonAirportDeliveryCost;
                payload.airportDeliveryCost = airportDeliveryCost;
            }

            const response = await updateVehicleFeaturesById({
                type: 'upload_location_delivery',
                payload
            });

            if (response.success) {
                toast.success(response.message);

                reset({
                    ...formData
                });

                refetchData();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Error updating location & delivery:', error);
            toast.error(`Error in updating location & delivery: ${error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 pb-3 md:gap-10'>
            <div className='grid grid-cols-3 gap-2 md:grid-cols-12 md:gap-4'>
                <div className='col-span-3 flex flex-col gap-2 md:col-span-6'>
                    <Label> Address line 1</Label>
                    <AddressCombobox locationDetails={fullAddress.address1} setLocationDetails={setFullAddress} searchType='address' />
                    <FormError>{errors.fullAddress?.address1?.message}</FormError>
                </div>

                <div className='col-span-3 flex flex-col gap-2 md:col-span-6'>
                    <Label> Address line 2</Label>
                    <Input id='address2' defaultValue={fullAddress.address2} className='w-full' {...register('fullAddress.address2')} />
                    <FormError>{errors.fullAddress?.address2?.message}</FormError>
                </div>

                <div className='flex flex-col gap-2 md:col-span-2'>
                    <Label> City</Label>
                    <Input id='city' defaultValue={fullAddress.city} className='w-full' {...register('fullAddress.city')} />
                    <FormError>{errors.fullAddress?.city?.message}</FormError>
                </div>

                <div className='flex flex-col gap-2 md:col-span-2'>
                    <Label> State</Label>
                    <Controller
                        control={control}
                        name='fullAddress.state'
                        defaultValue='Texas'
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <>
                                <Select onValueChange={onChange} value={value.toLowerCase()} defaultValue={value.toLowerCase()}>
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
                                <FormError> {error?.message}</FormError>
                            </>
                        )}
                    />
                    <FormError>{errors.fullAddress?.state?.message}</FormError>
                </div>

                <div className='flex flex-col gap-2 md:col-span-2'>
                    <Label> Zipcode</Label>
                    <Input id='zipcode' defaultValue={fullAddress.zipcode} className='w-full' {...register('fullAddress.zipcode')} />
                    <FormError>{errors.fullAddress?.zipcode?.message}</FormError>
                </div>

                <div className='flex flex-col gap-2 md:col-span-2'>
                    <Label> Country</Label>
                    <Input id='country' readOnly defaultValue='USA' className='w-full' disabled />
                </div>

                <div className='flex flex-col gap-2 md:col-span-2'>
                    <Label> Latitude</Label>
                    <Input
                        id='latitude'
                        readOnly
                        defaultValue={fullAddress.latitude}
                        className='w-full'
                        disabled
                        {...register('fullAddress.latitude')}
                    />
                    <FormError>{errors.fullAddress?.latitude?.message}</FormError>
                </div>

                <div className='flex flex-col gap-2 md:col-span-2'>
                    <Label> Longitude</Label>
                    <Input
                        id='longitude'
                        readOnly
                        disabled
                        defaultValue={fullAddress.longitude}
                        className='w-full'
                        {...register('fullAddress.longitude')}
                    />
                    <FormError>{errors.fullAddress?.longitude?.message}</FormError>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-6'>
                <div className='md:col-span-3'>
                    <Controller
                        name='deliveryEnabled'
                        control={control}
                        render={({ field }) => {
                            return (
                                <div className='flex flex-col gap-2'>
                                    <div className='flex items-center gap-8'>
                                        <Label className='text-base'>Custom Delivery</Label>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </div>
                                    <FormDescription>
                                        Enable custom deliveries to allow renters to request specific pickup and return locations.
                                    </FormDescription>
                                </div>
                            );
                        }}
                    />
                </div>

                {deliveryEnabledState && (
                    <div className='md:col-span-3'>
                        <Controller
                            name='deliveryToAirport'
                            control={control}
                            render={({ field }) => {
                                return (
                                    <div className='flex items-center gap-8'>
                                        <Label className='text-base'>Allow Airport Deliveries</Label>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </div>
                                );
                            }}
                        />
                    </div>
                )}

                {deliveryEnabledState && (
                    <div className='grid max-w-3xl grid-cols-1 gap-4 md:col-span-6 md:grid-cols-3'>
                        <Controller
                            name='deliveryRadius'
                            control={control}
                            render={({ field }) => {
                                const value = field.value === '' ? undefined : Number(field.value);
                                return (
                                    // @ts-ignore
                                    <JollyNumberField
                                        id='deliveryRadius'
                                        label='Delivery Radius (miles)'
                                        defaultValue={value || 0}
                                        className=''
                                        isRequired
                                        {...field}
                                        onChange={field.onChange}
                                        errorMessage={errors.deliveryRadius?.message}
                                        isInvalid={!!errors.deliveryRadius?.message}
                                    />
                                );
                            }}
                        />

                        <Controller
                            name='airportDeliveryCost'
                            control={control}
                            render={({ field }) => {
                                const value = field.value === '' ? undefined : Number(field.value);
                                return (
                                    // @ts-ignore
                                    <JollyNumberField
                                        id='airportDeliveryCost'
                                        label='Airport Delivery Cost'
                                        defaultValue={value || 0}
                                        className=''
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
                                        errorMessage={errors.airportDeliveryCost?.message}
                                        isInvalid={!!errors.airportDeliveryCost?.message}
                                    />
                                );
                            }}
                        />
                        <Controller
                            name='nonAirportDeliveryCost'
                            control={control}
                            render={({ field }) => {
                                const value = field.value === '' ? undefined : Number(field.value);
                                return (
                                    // @ts-ignore
                                    <JollyNumberField
                                        id='nonAirportDeliveryCost'
                                        label='Non-Airport Delivery Cost'
                                        defaultValue={value || 0}
                                        className=''
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
                                        errorMessage={errors.nonAirportDeliveryCost?.message}
                                        isInvalid={!!errors.nonAirportDeliveryCost?.message}
                                    />
                                );
                            }}
                        />
                    </div>
                )}
            </div>
            <div className='mt-4 flex items-center justify-end gap-x-6 md:pr-10'>
                <Button type='submit' className='w-fit' loading={isSubmitting} loadingText='Saving...' disabled={!isDirty}>
                    Save
                </Button>
            </div>
        </form>
    );
}
