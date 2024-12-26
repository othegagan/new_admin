'use client';

import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { vehicleConfigTabsContent } from '@/constants';
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

export default function GuestInstructionsPage() {
    const { vehicleId } = useParams();

    const queryClient = useQueryClient();
    const refetchData = () => {
        queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.vehicleFeaturesById, Number(vehicleId)]
        });
    };

    const { data: response, isLoading, error } = useVehicleFeaturesById(Number(vehicleId));

    if (isLoading) {
        return <CarLoadingSkeleton />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!response?.success) {
        return <div>Error: {response?.message}</div>;
    }

    const instructionsAndGuideLines: string = response?.data?.vehicleAllDetails[0].GuestInstructionsAndGuideLines || '';

    return (
        <div className='flex flex-col'>
            <SubHeader
                title={vehicleConfigTabsContent.guest_guidelines.title}
                description={vehicleConfigTabsContent.guest_guidelines.description}
            />
            <GuestInstructionsForm
                vechicleId={Number(vehicleId)}
                instructionsAndGuideLines={instructionsAndGuideLines}
                refetchData={refetchData}
            />
        </div>
    );
}

interface GuestInstructionsFormProps {
    vechicleId: number;
    instructionsAndGuideLines: string;
    refetchData: () => void;
}

const schema = z.object({
    instructionsAndGuideLines: z.string().trim().optional()
});

type FormFields = z.infer<typeof schema>;

function GuestInstructionsForm({ vechicleId, instructionsAndGuideLines = '', refetchData }: GuestInstructionsFormProps) {
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
            instructionsAndGuideLines: instructionsAndGuideLines
        }
    });

    useEffect(() => {
        setValue('instructionsAndGuideLines', instructionsAndGuideLines);
    }, [setValue, instructionsAndGuideLines]);

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const session = await getSession();
            const { instructionsAndGuideLines } = formData;

            const payload = {
                hostId: session?.iduser,
                vehicleId: vechicleId,
                vehicleFeatureName: 'Guest Instructions and Guidelines',
                vehicleFeatureDescription: instructionsAndGuideLines || '',
                isEditable: true,
                tobeDisplayed: true
            };

            const response = await updateVehicleFeaturesById({
                type: 'update_guest_instructions',
                payload
            });

            if (response.success) {
                toast.success(response.message);
                refetchData();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Error updating instructions:', error);
            toast.error('Error in updating instructions :', error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4 p-0.5'>
                <Controller
                    name='instructionsAndGuideLines'
                    control={control}
                    render={({ field }) => {
                        return <Textarea {...field} rows={5} placeholder='' />;
                    }}
                />
            </div>

            <div className='mt-6 flex items-center justify-end gap-x-6'>
                <Button type='submit' className='w-fit' loading={isSubmitting} loadingText='Saving...'>
                    Save
                </Button>
            </div>
        </form>
    );
}
