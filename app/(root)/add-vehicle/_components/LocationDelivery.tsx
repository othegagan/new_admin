import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
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
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import AddressSearchBox from '../../vehicles/_components/AddressSearchBox';

interface LocationDeliveryProps {
    nextStep: () => void;
    previousStep: () => void;
}

export default function LocationDelivery({ nextStep, previousStep }: LocationDeliveryProps) {
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
    let airportDeliveryCost = 0;
    let nonAirportDeliveryCost = 0;

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
            <CardTitle>{vehicleConfigTabsContent.location_delivery.title}</CardTitle>
            <CardDescription> {vehicleConfigTabsContent.location_delivery.description}</CardDescription>

            <LocationDeliveryForm
                vechicleId={Number(vehicleId)}
                deliveryEnabled={deliveryEnabled}
                deliveryRadius={deliveryRadius}
                airportDeliveryCost={airportDeliveryCost}
                nonAirportDeliveryCost={nonAirportDeliveryCost}
                deliveryToAirport={deliveryToAirport}
                fullAddress={fullAddress}
                refetchData={refetchData}
                nextStep={nextStep}
                previousStep={previousStep}
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
    nextStep: () => void;
    previousStep: () => void;
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
            .min(0, ' Cost must be greater than 0')
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
            .min(0, ' Cost must be greater than 0')
            .optional(),
        z.literal('').refine(() => false, {
            message: 'This field is required'
        })
    ]),
    deliveryToAirport: z.boolean(),
    fullAddress: z.object({
        address1: z.string({ message: 'Address1 is required' }).trim().min(1, { message: 'Address1 is required' }),
        address2: z.string().optional(),
        city: z.string({ message: 'City is required' }).trim().min(1, { message: 'City is required' }),
        state: z.string({ message: 'State is required' }).trim().min(1, { message: 'State is required' }),
        zipcode: z
            .string({ message: 'Zipcode is required' })
            .min(4, { message: 'Zipcode is required' })
            .max(6, { message: 'Max 6 digits' }),
        latitude: z.string().min(1, { message: 'Latitude is required' }),
        longitude: z.string().min(1, { message: 'Longitude is required' })
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
    refetchData,
    nextStep,
    previousStep
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
    const lat_lng = watch('fullAddress.latitude');

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
            // Validate the form data against the schema
            await schema.parseAsync(formData);

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
                nextStep();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                // Handle Zod validation errors
                console.error('Validation error:', error.errors);
                error.errors.forEach((err) => {
                    toast.error(`${err.path.join('.')} - ${err.message}`);
                });
            } else {
                console.error('Error updating location & delivery:', error);
                toast.error(`Error in updating location & delivery: ${error.message}`);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-2'>
            <div className='grid grid-cols-3 gap-2 md:grid-cols-12 md:gap-4'>
                <div className='col-span-3 flex flex-col gap-2 md:col-span-6'>
                    <Label> Address line 1</Label>
                    <AddressSearchBox address1={fullAddress.address1} setSavedData={setFullAddress} />
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

            <div className='mt-6 flex items-center justify-between gap-x-6'>
                <Button onClick={previousStep} variant='outline'>
                    <ArrowLeft className='size-4' /> Prev
                </Button>

                <Button type='submit' variant='black' loading={isSubmitting} disabled={!lat_lng} suffix={<ArrowRight className='size-4' />}>
                    Next
                </Button>
            </div>
        </form>
    );
}
