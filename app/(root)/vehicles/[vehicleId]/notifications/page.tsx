'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Textarea } from '@/components/ui/textarea';
import { vehicleConfigTabsContent } from '@/constants';
import { useVehicleConfigurationEvents, useVehicleFeaturesById } from '@/hooks/useVehicles';
import { insertVehicleConfigurationEvent } from '@/server/vehicles';
import { useParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import SubHeader from '../../_components/layout/subheader';

interface MasterEvent {
    id?: number;
    statusCode: string;
    description: string;
    createdDate?: string;
    updatedDate?: string;
}

interface VehicleMessageContentResponse {
    id: number;
    statusCode: string;
    scheduleTime: string;
    messageContent: string;
    vehicleId: number;
    isActive: boolean;
}

interface FormValues {
    messageContent: string;
}

export default function NotificationConfigurationPage() {
    const { vehicleId } = useParams();

    const {
        data: eventsResponse,
        isLoading: isLoadingEvents,
        error: errorEvents,
        refetch: refetchEvents
    } = useVehicleConfigurationEvents();

    const {
        data: featuresResponse,
        isLoading: isLoadingFeatures,
        error: errorFeatures,
        refetch: refetchFeatures
    } = useVehicleFeaturesById(Number(vehicleId));

    if (isLoadingFeatures || isLoadingEvents) {
        return <div className='h-32 w-full flex-center text-xl'>Loading...</div>;
    }

    if (errorFeatures || errorEvents) {
        return <div>Error: {errorFeatures?.message || errorEvents?.message}</div>;
    }

    if (!featuresResponse?.success) {
        return <div>Error: {featuresResponse?.message}</div>;
    }

    const masterEventsList: MasterEvent[] = eventsResponse?.data?.vehicleConfigurationStatusList || [];
    const alreadySavedEvents: VehicleMessageContentResponse[] = featuresResponse?.data?.vehicleMessageContentResponse || [];

    return (
        <div className='flex flex-col gap-4'>
            <SubHeader title={vehicleConfigTabsContent.notifications.title} description='' />
            <div>
                Use code <b>DRIVER_NAME</b> to indicate driver name and <b>TRIP_END</b> to indicate trip ending time, and{' '}
                <b>VEHICLE_LOCATION</b> to indicate vehicle location.
            </div>
            <MessageContentForm
                vehicleId={Number(vehicleId)}
                masterEventsList={masterEventsList}
                alreadySavedEvents={alreadySavedEvents}
                refetchFeatures={refetchFeatures}
                refetchEvents={refetchEvents}
            />
        </div>
    );
}

interface MessageContentFormProps {
    vehicleId: number;
    masterEventsList: MasterEvent[];
    alreadySavedEvents: VehicleMessageContentResponse[];
    refetchFeatures: () => void;
    refetchEvents: () => void;
}

import { useEffect } from 'react';

function MessageContentForm({ vehicleId, masterEventsList, alreadySavedEvents, refetchFeatures }: MessageContentFormProps) {
    const handleSave = async (statusCode: string, data: FormValues) => {
        try {
            const trimmedContent = data.messageContent.trim();
            const existingMessage = alreadySavedEvents.find((msg) => msg.statusCode === statusCode);

            if (existingMessage?.messageContent === trimmedContent) {
                toast('No changes to save.');
                return;
            }

            const payload = {
                messageContent: trimmedContent,
                vehicleId: Number(vehicleId),
                statusCode: statusCode
            };

            const response = await insertVehicleConfigurationEvent(payload);

            if (response.success) {
                toast.success(response.message);
                refetchFeatures(); // Trigger refetch after saving
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error('Error saving message:', error);
            toast.error(`Failed to save message for ${statusCode}.`);
        }
    };

    return (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8'>
            {masterEventsList.map((event) => {
                const existingMessage = alreadySavedEvents.find((msg) => msg.statusCode === event.statusCode);
                const defaultValue = existingMessage?.messageContent || '';

                const {
                    control,
                    handleSubmit,
                    reset,
                    watch,
                    formState: { isSubmitting, isDirty }
                } = useForm<FormValues>({
                    defaultValues: { messageContent: defaultValue },
                    mode: 'onChange'
                });

                // Reset form when `alreadySavedEvents` changes
                useEffect(() => {
                    reset({ messageContent: defaultValue });
                }, [alreadySavedEvents, event.statusCode, defaultValue, reset]);

                const trimmedValue = watch('messageContent').trim();

                return (
                    <form
                        key={event.statusCode}
                        onSubmit={handleSubmit((data) => handleSave(event.statusCode, data))}
                        className='flex flex-col gap-4 p-0.5'>
                        <Label htmlFor={event.description} className='font-semibold'>
                            {event.description}
                        </Label>
                        <Controller
                            name='messageContent'
                            control={control}
                            render={({ field }) => <Textarea {...field} className='w-full' />}
                        />
                        {isDirty && trimmedValue !== defaultValue.trim() && (
                            <Button type='submit' className='ml-auto' variant='black' loading={isSubmitting} loadingText='Saving...'>
                                Save
                            </Button>
                        )}
                    </form>
                );
            })}
        </div>
    );
}
