'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { FormError, Label } from '@/components/ui/extension/field';
import { JollyNumberField } from '@/components/ui/extension/numberfield';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { env } from '@/env';
import { ServiceIcon } from '@/public/icons';
import { requiredNumberSchema } from '@/schemas/validationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { format } from 'date-fns';
import { Paperclip } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const serviceFormSchema = z.object({
    serviceType: z.string().nonempty({ message: 'Please select a service type' }),
    date: z.string().nonempty({ message: 'Please select a date' }),
    time: z.string().nonempty({ message: 'Please select a time' }),
    odometerReading: requiredNumberSchema,
    cost: requiredNumberSchema,
    paymentMethod: z.string().nonempty({ message: 'Please select a payment method' }),
    files: z.array(z.custom<File>((value) => value instanceof File, { message: 'Invalid file type' })).optional(),
    additionalNotes: z.string().max(500, { message: 'Notes must be 500 characters or less' }).optional()
});

const serviceTypes = [
    'Air Conditioning',
    'Air Filter',
    'Battery',
    'Brake Fluid',
    'Brake Pads',
    'Car Wash',
    'Fuel Filter',
    'Inspection',
    'New Tires',
    'Oil Change',
    'Oil Filter',
    'Rotate Tires',
    'Suspension',
    'Transmission',
    'Wheel Alignment',
    'Tire Pressure',
    'Other'
];

type FormFields = z.infer<typeof serviceFormSchema>;

export default function AddServiceForm({ vehicleId, refechServiceLogs }: { vehicleId: number; refechServiceLogs: any }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(serviceFormSchema),
        mode: 'onChange',
        defaultValues: {
            serviceType: '',
            date: format(new Date(), 'yyyy-MM-dd'),
            time: format(new Date(), 'HH:mm'),
            odometerReading: 0,
            cost: 0,
            paymentMethod: '',
            additionalNotes: ''
        }
    });

    const openDialog = () => setIsDialogOpen(true);

    const closeDialog = () => {
        setIsDialogOpen(false);
        reset();
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const { serviceType, date, time, odometerReading, cost, paymentMethod, files, additionalNotes } = data;

            const dateTime = new Date(`${date}T${time}`).toISOString();

            const formData = new FormData();

            const images = files && files.length > 0 ? files[0] : null;

            formData.append('vehicleId', vehicleId.toString());
            formData.append('dateTime', dateTime);
            formData.append('odometer', odometerReading.toString());
            formData.append('typeOfService', serviceType);
            formData.append('cost', cost.toString());
            formData.append('paymentMethod', paymentMethod);
            formData.append('notes', additionalNotes || '');
            //@ts-ignore
            formData.append('imageName', images);

            const session = await getSession();

            const url = `${env.NEXT_PUBLIC_HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/insertVehicleRepairLog`;

            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    bundee_auth_token: session?.bundeeToken
                }
            });

            const responseData = response.data;

            if (responseData.errorCode === '0') {
                toast.success(responseData.errorMessage);
                reset();
                refechServiceLogs();
                closeDialog();
            } else {
                toast.error(responseData.errorMessage);
            }

            // closeDialog();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(selectedFiles);
            setValue('files', selectedFiles); // Update the form state
        }
    };

    return (
        <>
            <div onClick={openDialog} className='dropdown-item gapp-3 flex-start '>
                <ServiceIcon className='size-6' />
                Service
            </div>

            <AdaptiveDialog title='Add Service' isOpen={isDialogOpen} onClose={closeDialog} className='sm:max-w-[70%]'>
                <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                    <AdaptiveBody className='flex flex-col gap-5'>
                        <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
                            <div className='group flex flex-col gap-1.5'>
                                <Label htmlFor='serviceType'>Service Type</Label>
                                <Controller
                                    name='serviceType'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                            <SelectContent className='max-h-44 w-full'>
                                                {serviceTypes.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.serviceType && <FormError>{errors.serviceType.message}</FormError>}
                            </div>

                            <div className='group flex flex-col gap-1.5'>
                                <Label htmlFor='date'>Date</Label>
                                <input
                                    type='date'
                                    {...register('date')}
                                    className='h-9 rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
                                />
                                {errors.date && <FormError>{errors.date.message}</FormError>}
                            </div>

                            <div className='group flex flex-col gap-1.5'>
                                <Label htmlFor='time'>Time</Label>
                                <input
                                    type='time'
                                    {...register('time')}
                                    className='h-9 rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary'
                                />
                                {errors.time && <FormError>{errors.time.message}</FormError>}
                            </div>

                            <Controller
                                name='odometerReading'
                                control={control}
                                render={({ field }) => {
                                    const value = field.value === '' ? undefined : Number(field.value);
                                    return (
                                        // @ts-ignore
                                        <JollyNumberField
                                            id='extraMileageCost'
                                            label='Odometer Reading'
                                            description=''
                                            defaultValue={value}
                                            className='mt-1 sm:mt-0'
                                            isRequired
                                            {...field}
                                            onChange={field.onChange}
                                            errorMessage={errors.odometerReading?.message}
                                            isInvalid={!!errors.odometerReading?.message}
                                        />
                                    );
                                }}
                            />

                            <Controller
                                name='cost'
                                control={control}
                                render={({ field }) => {
                                    const value = field.value === '' ? undefined : Number(field.value);
                                    return (
                                        // @ts-ignore
                                        <JollyNumberField
                                            id='extraMileageCost'
                                            label='Cost'
                                            description=''
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
                                            errorMessage={errors.cost?.message}
                                            isInvalid={!!errors.cost?.message}
                                        />
                                    );
                                }}
                            />

                            <div className='group flex flex-col gap-1.5'>
                                <Label htmlFor='paymentMethod'>Payment Method</Label>
                                <Controller
                                    name='paymentMethod'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                            <SelectContent className='max-h-44 w-full'>
                                                {['Credit Card', 'Debit Card', 'Cash', 'Other'].map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.paymentMethod && <FormError>{errors.paymentMethod.message}</FormError>}
                            </div>
                        </div>

                        <div className='flex-start gap-5'>
                            <Input type='file' multiple id='files' className='hidden' onChange={handleFileChange} />
                            <Button
                                type='button'
                                variant='outline'
                                className='text-orange-700'
                                onClick={() => document.getElementById('files')?.click()}>
                                <Paperclip className='mr-2 h-4 w-4' />
                                Attach File
                            </Button>
                            {files.length > 0 && <div className='mt-2 text-muted-foreground text-sm'>{files.length} file(s) selected</div>}
                        </div>

                        <div className='group flex flex-col gap-1.5'>
                            <Label htmlFor='additionalNotes'>Notes</Label>
                            <Textarea id='additionalNotes' {...register('additionalNotes')} />
                            {errors.additionalNotes && <FormError>{errors.additionalNotes.message}</FormError>}
                        </div>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='secondary' onClick={closeDialog}>
                            Cancel
                        </Button>
                        <Button type='submit' loading={isSubmitting} loadingText='Saving...'>
                            Save
                        </Button>
                    </AdaptiveFooter>
                </form>
            </AdaptiveDialog>
        </>
    );
}
