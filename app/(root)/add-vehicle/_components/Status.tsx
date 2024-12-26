import { Button } from '@/components/ui/button';
import {
    Calendar,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    CalendarHeading
} from '@/components/ui/extension/calendar';
import { DatePicker, DatePickerButton, DatePickerContent } from '@/components/ui/extension/date-picker';
import { FieldError, FormDescription, FormError, Label } from '@/components/ui/extension/field';
import { Switch } from '@/components/ui/switch';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
import { cn } from '@/lib/utils';
import { updateVehicleFeaturesById } from '@/server/vehicles';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { DateValue } from 'react-aria-components';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface StatusProps {
    previousStep: () => void;
    alreadyUploaded: boolean;
}

export default function Status({ previousStep, alreadyUploaded }: StatusProps) {
    const searchParams = useSearchParams();
    const vin = searchParams.get('vin');
    const vehicleId = searchParams.get('vehicleId');

    if (!vehicleId || !vin) {
        return <div>Error: Invalid vehicle ID or VIN</div>;
    }

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

    const vehicleUnavaliblityDetails = response?.data?.vehicleUnavaliblityDetails[0] || {};

    const endDate: any = vehicleUnavaliblityDetails?.enddate
        ? parseDate(format(new Date(vehicleUnavaliblityDetails?.enddate), 'yyyy-MM-dd'))
        : null;

    const isActive = response?.data?.vehicleAllDetails[0]?.isActive;

    return (
        <div className='flex flex-col'>
            <StatusForm
                vechicleId={Number(vehicleId)}
                endDate={endDate}
                isActive={isActive}
                refetchData={refetchData}
                previousStep={previousStep}
                alreadyUploaded={alreadyUploaded}
            />
        </div>
    );
}

interface MileageLimitsFormProps {
    vechicleId: number;
    endDate?: DateValue;
    isActive: boolean;
    refetchData: () => void;
    previousStep: () => void;
    alreadyUploaded: boolean;
}

const schema = z.object({
    isActive: z.boolean(),
    endDate: z.custom<DateValue>().refine((value) => value !== null && value !== undefined, {
        message: 'Please select a date'
    })
});

type FormFields = z.infer<typeof schema>;

function StatusForm({ vechicleId, endDate, isActive = false, refetchData, previousStep, alreadyUploaded }: MileageLimitsFormProps) {
    const router = useRouter();
    const {
        handleSubmit,
        control,
        formState: { isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            endDate: endDate,
            isActive: isActive
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const session = await getSession();
            const { endDate, isActive } = formData;

            const formattedEndDate = endDate ? format(endDate.toDate(getLocalTimeZone()), 'yyyy-MM-dd') : '';

            const payload = {
                vehicleId: vechicleId,
                hostId: session?.iduser,
                vehicleActivateDate: new Date(formattedEndDate).toISOString(),
                isActive: isActive
            };

            const response = await updateVehicleFeaturesById({
                type: alreadyUploaded ? 'update_status' : 'upload_status',
                payload
            });

            if (response.success) {
                refetchData();
                toast.success(response.message);
                router.replace('/vehicles');
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
            <div className='grid grid-cols-1 gap-4 md:my-4 md:grid-cols-2 md:gap-8'>
                <Controller
                    name='endDate'
                    control={control}
                    render={({ field, fieldState: { error } }) => {
                        return (
                            <DatePicker isRequired className='group flex max-w-56 flex-col gap-2' shouldCloseOnSelect={true}>
                                <Label>Vehicle Activation Date</Label>
                                <DatePickerButton date={field.value} className={cn('w-full rounded-md')} />
                                <FieldError />
                                <FormError>{error?.message}</FormError>
                                <DatePickerContent>
                                    <Calendar value={field.value} onChange={field.onChange} minValue={today(getLocalTimeZone())}>
                                        <CalendarHeading />
                                        <CalendarGrid>
                                            <CalendarGridHeader>
                                                {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
                                            </CalendarGridHeader>
                                            <CalendarGridBody>{(date) => <CalendarCell date={date} />}</CalendarGridBody>
                                        </CalendarGrid>
                                    </Calendar>
                                </DatePickerContent>
                            </DatePicker>
                        );
                    }}
                />
            </div>

            <Controller
                name='isActive'
                control={control}
                render={({ field }) => {
                    return (
                        <div className='flex flex-row items-center justify-between rounded-lg border p-4'>
                            <div className='flex flex-col space-y-0.5'>
                                <Label className='text-base'>Vehicle Activation Status</Label>
                                <FormDescription>
                                    {field.value
                                        ? 'The vehicle is active and available for booking.'
                                        : 'Turn on to make the vehicle active and available for booking.'}
                                </FormDescription>
                            </div>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                    );
                }}
            />

            <div className='mt-6 flex items-center justify-between gap-x-6'>
                <Button onClick={previousStep} variant='outline'>
                    <ArrowLeft className='size-4' /> Prev
                </Button>

                <Button type='submit' variant='black' loading={isSubmitting} suffix={<ArrowRight className='size-4' />}>
                    Finish
                </Button>
            </div>
        </form>
    );
}
