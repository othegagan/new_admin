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

interface DescriptionProps {
    nextStep: () => void;
    previousStep: () => void;
}

export default function Description({ nextStep, previousStep }: DescriptionProps) {
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

    const description: string = response?.data?.vehicleAllDetails[0].desciption || '';

    return (
        <div className='flex flex-col'>
            <DescriptionTextForm
                vechicleId={Number(vehicleId)}
                description={description}
                refetchData={refetchData}
                nextStep={nextStep}
                previousStep={previousStep}
            />
        </div>
    );
}

interface DescriptionTextFormProps {
    vechicleId: number;
    description: string;
    refetchData: () => void;
    nextStep: () => void;
    previousStep: () => void;
}

const schema = z.object({
    description: z.string().trim().optional()
});

type FormFields = z.infer<typeof schema>;

function DescriptionTextForm({ vechicleId, description = '', refetchData, nextStep, previousStep }: DescriptionTextFormProps) {
    const {
        handleSubmit,
        setValue,
        control,
        formState: { isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            description: description
        }
    });

    useEffect(() => {
        setValue('description', description);
    }, [description, setValue]);

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const session = await getSession();
            const { description } = formData;

            const payload = {
                hostId: session?.iduser,
                vehicleId: vechicleId,
                vehicleDescription: description?.trim()
            };

            const response = await updateVehicleFeaturesById({
                type: 'description',
                payload
            });

            toast.success(response.message);
            nextStep();
            // if (response.success) {
            // } else {
            //     toast.error(response.message);
            // }
            refetchData();
        } catch (error: any) {
            console.error('Error updating description:', error);
            toast.error('Error in updating description :', error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <CardTitle>{vehicleConfigTabsContent.description.title}</CardTitle>
            <CardDescription> {vehicleConfigTabsContent.description.description}</CardDescription>
            <div className='flex flex-col gap-4 p-0.5'>
                <Controller
                    name='description'
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
