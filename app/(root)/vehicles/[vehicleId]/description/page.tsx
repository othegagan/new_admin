'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { QUERY_KEYS } from '@/constants/query-keys';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';

import { CarLoadingSkeleton } from '@/components/skeletons';
import { vehicleConfigTabsContent } from '@/constants';
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

export default function DescriptionPage() {
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

    const description: string = response?.data?.vehicleAllDetails[0].desciption || '';

    return (
        <div className='flex flex-col'>
            <SubHeader title={vehicleConfigTabsContent.description.title} description={vehicleConfigTabsContent.description.description} />
            <DescriptionForm vechicleId={Number(vehicleId)} description={description} refetchData={refetchData} />
        </div>
    );
}

interface DescriptionFormProps {
    vechicleId: number;
    description: string;
    refetchData: () => void;
}

const schema = z.object({
    description: z.string().trim().optional()
});

type FormFields = z.infer<typeof schema>;

function DescriptionForm({ vechicleId, description = '', refetchData }: DescriptionFormProps) {
    const {
        handleSubmit,
        setValue,
        control,
        reset,
        formState: { isSubmitting, isDirty }
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
                vehicleDescription: description
            };

            const response = await updateVehicleFeaturesById({
                type: 'description',
                payload
            });

            if (response.success) {
                toast.success(response.message);
                reset({
                    description: description
                });
            } else {
                toast.error(response.message);
            }
            refetchData();
        } catch (error: any) {
            console.error('Error updating description:', error);
            toast.error('Error in updating description :', error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-4 p-0.5'>
                <Controller
                    name='description'
                    control={control}
                    render={({ field }) => {
                        return <Textarea {...field} rows={10} placeholder='' />;
                    }}
                />
            </div>

            <div className='mt-4 flex items-center justify-end gap-x-6'>
                <Button type='submit' className='w-fit' loading={isSubmitting} disabled={!isDirty} loadingText='Saving...'>
                    Save
                </Button>
            </div>
        </form>
    );
}

// errorCode: null,
// errorMessage: null,
