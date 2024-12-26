import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { vehicleConfigTabsContent } from '@/constants';
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

interface GuestGuidelinesProps {
    nextStep: () => void;
    previousStep: () => void;
}

export default function GuestGuidelines({ nextStep, previousStep }: GuestGuidelinesProps) {
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
            <GuestInstructionsForm
                vechicleId={Number(vehicleId)}
                instructionsAndGuideLines={instructionsAndGuideLines}
                refetchData={refetchData}
                nextStep={nextStep}
                previousStep={previousStep}
            />
        </div>
    );
}

interface GuestInstructionsFormProps {
    vechicleId: number;
    instructionsAndGuideLines: string;
    refetchData: () => void;
    nextStep: () => void;
    previousStep: () => void;
}

const schema = z.object({
    instructionsAndGuideLines: z.string().trim().optional()
});

type FormFields = z.infer<typeof schema>;

function GuestInstructionsForm({
    vechicleId,
    instructionsAndGuideLines = '',
    refetchData,
    nextStep,
    previousStep
}: GuestInstructionsFormProps) {
    const {
        handleSubmit,
        setValue,
        control,
        formState: { isSubmitting }
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
                nextStep();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Error updating guidelines:', error);
            toast.error('Error in updating guidelines :', error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <CardTitle>{vehicleConfigTabsContent.guest_guidelines.title}</CardTitle>
            <CardDescription> {vehicleConfigTabsContent.guest_guidelines.description}</CardDescription>
            <div className='flex flex-col gap-4 p-0.5'>
                <Controller
                    name='instructionsAndGuideLines'
                    control={control}
                    render={({ field }) => {
                        return <Textarea {...field} rows={5} placeholder='' />;
                    }}
                />
            </div>

            <div className='mt-6 flex items-center justify-between gap-x-6'>
                <Button onClick={previousStep} variant='outline'>
                    <ArrowLeft className='size-4' /> Prev
                </Button>

                <Button type='submit' variant='black' loading={isSubmitting} suffix={<ArrowRight className='size-4' />}>
                    Next
                </Button>
            </div>
        </form>
    );
}
