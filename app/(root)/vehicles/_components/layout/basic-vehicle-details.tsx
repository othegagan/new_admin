'use client ';

import ImagePreview from '@/components/ui/image-preview';
import { Switch } from '@/components/ui/switch';
import { PAGE_ROUTES } from '@/constants/routes';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
import { toTitleCase } from '@/lib/utils';
import { ChevronLeft, Star } from 'lucide-react';
import Link from 'next/link';

interface BasicVehicleDetailsProps {
    vehicleId: number;
}

export default function BasicVehicleDetails({ vehicleId }: BasicVehicleDetailsProps) {
    const { data: featuresResponse, isLoading: isLoadingFeatures, error: errorFeatures } = useVehicleFeaturesById(Number(vehicleId));

    if (isLoadingFeatures) {
        return <div className='h-28'>Loading...</div>;
    }

    if (errorFeatures) {
        return <div>Error!</div>;
    }

    const features = featuresResponse?.data?.vehicleAllDetails[0];
    const reviews = featuresResponse?.data?.reserverList[0];

    const { rating, tripcount } = reviews;

    const { vin, make, model, year, imageresponse, number, isActive } = features;

    const vehicleName = toTitleCase(`${make} ${model} ${year}`);
    const ratingText = rating ? rating.toFixed(1) : '1.0';
    const tripText = tripcount ? `(${tripcount}  ${tripcount > 1 ? 'trips' : 'trip'})` : null;
    const primaryImage = imageresponse.find((image: any) => image.isPrimary)?.imagename || '';

    return (
        <div className=''>
            <div className='flex items-start justify-between'>
                <Link href={PAGE_ROUTES.VEHICLES} className='inline-flex items-center text-md text-muted-foreground hover:text-foreground'>
                    <ChevronLeft className='mr-1 h-4 w-4' />
                    Back
                </Link>

                <div className='flex w-fit flex-col items-end gap-2 md:mt-4'>
                    <span className='text-md capitalize'>
                        Vehicle Status: <b>{isActive ? 'Active' : 'In Active'}</b>
                    </span>
                    <Switch defaultChecked={isActive} />
                </div>
            </div>

            <div className='flex gap-4'>
                <ImagePreview
                    url={primaryImage || '/images/image_not_available.png'}
                    alt={vehicleName}
                    className=' h-[86px] w-[200px] rounded-[7px] border object-cover object-center'
                />
                <div className='flex w-full flex-col gap-2'>
                    <div>
                        <h1 className='font-semibold text-lg md:text-xl'>{vehicleName}</h1>
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
        </div>
    );
}
