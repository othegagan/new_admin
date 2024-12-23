'use client';

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
import AddressSearchBox from '../../_components/AddressSearchBox';
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
        return <div>Loading...</div>;
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
            airportDeliveryCost = Number(constraint?.airportDeliveryCost) || 1;
            nonAirportDeliveryCost = Number(constraint?.nonAirportDeliveryCost) || 1;
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
            .min(1, ' Cost must be greater than 0')
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
            .min(1, ' Cost must be greater than 0')
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
        zipcode: z.string({ message: 'Zipcode is required' }),
        latitude: z.string(),
        longitude: z.string()
    })
});

type FormFields = z.infer<typeof schema>;

function LocationDeliveryForm({
    vechicleId,
    deliveryEnabled = false,
    deliveryRadius = 1,
    airportDeliveryCost = 1,
    nonAirportDeliveryCost = 1,
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
        formState: { errors, isSubmitting }
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
        setValue('fullAddress.address1', address.address1);
        setValue('fullAddress.address2', address.address2);
        setValue('fullAddress.city', address.city);
        setValue('fullAddress.state', address.state);
        setValue('fullAddress.zipcode', String(address.zipcode));
        setValue('fullAddress.latitude', String(address.latitude));
        setValue('fullAddress.longitude', String(address.longitude));
    };

    const deliveryEnabledState = watch('deliveryEnabled');

    useEffect(() => {
        setValue('deliveryEnabled', deliveryEnabled);
        setValue('deliveryRadius', deliveryRadius);
        setValue('airportDeliveryCost', airportDeliveryCost);
        setValue('nonAirportDeliveryCost', nonAirportDeliveryCost);
        setValue('deliveryToAirport', deliveryToAirport);
        setValue('fullAddress', fullAddress);
    }, [setValue, deliveryEnabled, deliveryRadius, airportDeliveryCost, nonAirportDeliveryCost, deliveryToAirport, fullAddress]);

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const session = await getSession();
            const { deliveryEnabled, deliveryRadius, airportDeliveryCost, nonAirportDeliveryCost, deliveryToAirport } = formData;

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
                hasDelivery: deliveryEnabledState
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
        <form onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-10'>
            <div className='grid grid-cols-3 gap-2 md:col-span-1 md:grid-cols-6 md:gap-4'>
                <div className='col-span-3 flex flex-col gap-2'>
                    <Label> Address line 1</Label>
                    <AddressSearchBox address1={fullAddress.address1} setSavedData={setFullAddress} />
                    <FormError>{errors.fullAddress?.address1?.message}</FormError>
                </div>

                <div className='col-span-3 flex flex-col gap-2'>
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
                                <div className='flex flex-row items-center justify-between rounded-lg border p-4'>
                                    <div className='flex flex-col space-y-0.5'>
                                        <Label className='text-base'>Vehicle Delivery</Label>
                                        <FormDescription>
                                            {field.value ? 'The vehicle is delivable.' : 'Turn on to make the vehicle delivable.'}
                                        </FormDescription>
                                    </div>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                                    <div className='flex flex-col rounded-lg border p-4'>
                                        <div className='flex items-center justify-between space-y-0.5'>
                                            <Label className='text-base'>Delivery to Airport</Label>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </div>
                                        <FormDescription>
                                            {field.value
                                                ? 'The vehicle is delivable to airport.'
                                                : ' make the vehicle delivable to airport.'}
                                        </FormDescription>
                                    </div>
                                );
                            }}
                        />
                    </div>
                )}

                {deliveryEnabledState && (
                    <div className='grid grid-cols-1 gap-4 md:col-span-6 md:grid-cols-3'>
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
                <div className='mt-6 flex items-center justify-end gap-x-6'>
                    <Button type='submit' loading={isSubmitting} loadingText='Saving...'>
                        Save
                    </Button>
                </div>
            </div>
        </form>
    );
}
