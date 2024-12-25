'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { vehicleConfigTabsContent } from '@/constants';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
import { updateVehicleFeaturesById } from '@/server/vehicles';
import { zodResolver } from '@hookform/resolvers/zod';
import { getSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import SubHeader from '../../_components/layout/subheader';

export default function TuroIdPage() {
    const { vehicleId } = useParams();

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

    const vehicleBusinessConstraints = response?.data?.vehicleBusinessConstraints;

    const extractedConstraints = vehicleBusinessConstraints
        .filter((value: any) => value.constraintName === 'VehicleConstraintLink')
        .flatMap((value: any) => {
            const constraint = JSON.parse(value.constraintValue);
            return constraint.constraintValue.map((item: any) => ({
                url: item.url,
                channelName: item.channelName,
                constraintId: value.id
            }));
        });

    const isUpdate = vehicleBusinessConstraints.some((value: any) => value.constraintName === 'VehicleConstraintLink');

    return (
        <div className='flex flex-col gap-6'>
            <SubHeader
                title={vehicleConfigTabsContent.platform_sync.title}
                description={vehicleConfigTabsContent.platform_sync.description}
            />
            <TuroIdForm
                vechicleId={Number(vehicleId)}
                url={extractedConstraints[0]?.url || ''}
                channelName={extractedConstraints[0]?.channelName || ''}
                constraintId={extractedConstraints[0]?.constraintId || 0}
                isUpdate={isUpdate}
            />
        </div>
    );
}

interface TuroIdFormProps {
    vechicleId: number;
    url: string;
    channelName: string;
    constraintId?: number;
    isUpdate?: boolean;
}

const schema = z.object({
    url: z.string().trim(),
    channelName: z.string().trim().optional(),
    constraintId: z.number().optional()
});

type FormFields = z.infer<typeof schema>;

function TuroIdForm({ vechicleId, url = '', channelName = '', constraintId, isUpdate = false }: TuroIdFormProps) {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: {
            url: url,
            channelName: channelName,
            constraintId: constraintId
        }
    });

    const onSubmit: SubmitHandler<FormFields> = async (formData) => {
        try {
            const session = await getSession();
            const { url, channelName } = formData;

            const channels = ['Turo'];
            const urls = [url];

            const createPayload = {
                channelName: channels,
                url: urls,
                hostId: session?.iduser,
                vehicleId: vechicleId
            };

            const updatePayload = {
                channelName: channels,
                url: urls,
                hostId: session?.iduser,
                id: constraintId
            };

            const response = await updateVehicleFeaturesById({
                type: isUpdate ? 'update_turo_id' : 'create_turo_id',
                payload: isUpdate ? updatePayload : createPayload
            });
            if (response.success) {
                toast.success(response.message);
                router.refresh();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Error updating Turo id:', error);
            toast.error('Error in updating Turo id :', error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            <div className='grid max-w-[1200px] gap-6 md:grid-cols-2'>
                <div className='space-y-2'>
                    <Label htmlFor='platform'>Platform</Label>
                    <p className='text-muted-foreground text-sm'>Select the rental platform where your vehicle is listed.</p>
                    <Select defaultValue='turo'>
                        <SelectTrigger id='platform'>
                            <SelectValue placeholder='Select platform' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='turo'>Turo</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='space-y-2'>
                    <Label htmlFor='vehicleId'>Vehicle ID</Label>
                    <p className='text-muted-foreground text-sm'>Enter the unique identifier of your vehicle on the specified platform.</p>
                    <Input id='url' defaultValue={url} className='mt-1 w-full sm:mt-0' {...register('url')} />
                </div>
            </div>

            <div className='flex items-center justify-end gap-x-6'>
                <Button type='submit' loading={isSubmitting} disabled={!isDirty} loadingText='Saving...' className='w-fit'>
                    Save
                </Button>
            </div>
        </form>
    );
}
