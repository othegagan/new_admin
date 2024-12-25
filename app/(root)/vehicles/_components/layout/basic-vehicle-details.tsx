'use client';

import ImagePreview from '@/components/ui/image-preview';
import { Switch } from '@/components/ui/switch';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
import { toTitleCase } from '@/lib/utils';
import { updateVehicleFeaturesById } from '@/server/vehicles';
import { ChevronLeft, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BasicVehicleDetailsProps {
    vehicleId: number;
}

export default function BasicVehicleDetails({ vehicleId }: BasicVehicleDetailsProps) {
    const router = useRouter();

    const {
        data: featuresResponse,
        isLoading: isLoadingFeatures,
        error: errorFeatures,
        refetchAll
    } = useVehicleFeaturesById(Number(vehicleId));

    const [localIsActive, setLocalIsActive] = useState<boolean | null>(null); // Initialize with `null` to avoid before rendering

    useEffect(() => {
        if (featuresResponse) {
            // Set the initial local state when featuresResponse is available
            setLocalIsActive(featuresResponse.data?.vehicleAllDetails[0]?.isActive || false);
        }
    }, [featuresResponse]);

    if (isLoadingFeatures) {
        return <div className='h-20'>Loading...</div>;
    }

    if (errorFeatures) {
        return <div>Error!</div>;
    }

    if (!featuresResponse?.data?.vehicleAllDetails[0]) {
        return <div>No data</div>;
    }

    const features = featuresResponse?.data?.vehicleAllDetails[0];
    const reviews = featuresResponse?.data?.reserverList[0];

    const { rating, tripcount } = reviews;

    const { vin, make, model, year, imageresponse, number } = features;

    const vehicleName = toTitleCase(`${make} ${model} ${year}`);
    const ratingText = rating ? rating.toFixed(1) : '1.0';
    const tripText = tripcount ? `(${tripcount} ${tripcount > 1 ? 'trips' : 'trip'})` : null;
    const primaryImage = imageresponse.find((image: any) => image.isPrimary)?.imagename || '';

    async function handleChange(checked: boolean) {
        const previousState = localIsActive;
        setLocalIsActive(checked); // Optimistically update the local state

        const payload: any = {
            vehicleId: vehicleId,
            isActive: checked
        };

        try {
            const response = await updateVehicleFeaturesById({
                type: 'update_activation',
                payload
            });

            if (response.success) {
                toast.success(response.message);
                refetchAll(); // Optionally refetch the data
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error updating vehicle status:', error);
            setLocalIsActive(previousState); // Revert on error
            toast.error('Failed to update vehicle status. Please try again.');
        }
    }

    return (
        <>
            <div className='flex items-start justify-between'>
                <button
                    type='button'
                    className='inline-flex items-center text-md text-muted-foreground hover:text-foreground'
                    onClick={() => router.back()}>
                    <ChevronLeft className='mr-1 h-4 w-4' />
                    Back
                </button>
                <div className='flex w-fit flex-col items-end gap-2'>
                    <span className='text-md capitalize'>
                        Vehicle Status: <b>{localIsActive ? 'Active' : 'Inactive'}</b>
                    </span>
                    <Switch
                        checked={localIsActive || false} // Ensure `false` fallback for initial render
                        onCheckedChange={handleChange}
                    />
                </div>
            </div>
            <div className='flex gap-4 '>
                <ImagePreview
                    url={primaryImage || '/images/image_not_available.png'}
                    alt={vehicleName}
                    className='h-[86px] w-[200px] rounded-[7px] border object-cover object-center'
                />
                <div className='flex w-full flex-col gap-2'>
                    <div>
                        <h1 className='font-semibold text-xl'>{vehicleName}</h1>
                        <div className='flex-start gap-5 text-md'>
                            <span className='text-muted-foreground tracking-wider'>{number}</span>
                        </div>
                    </div>
                    <div className='flex-start gap-3'>
                        <span className='flex items-center gap-1'>
                            <Star fill='currentColor' className='size-5' />
                            {ratingText}
                        </span>
                        <span>{tripText}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
