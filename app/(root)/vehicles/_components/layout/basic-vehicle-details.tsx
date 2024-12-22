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
        return <div className='h-20'>Loading...</div>;
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
        <>
            <div className='flex items-start justify-between'>
                <div className='flex items-start gap-10'>
                    <Link
                        className='inline-flex items-center text-md text-muted-foreground hover:text-foreground'
                        href={`${PAGE_ROUTES.VEHICLES}`}>
                        <ChevronLeft className='mr-1 h-4 w-4' />
                        Back
                    </Link>

                    <div className='hidden gap-4 lg:flex'>
                        <ImagePreview
                            url={primaryImage || '/images/image_not_available.png'}
                            alt={vehicleName}
                            className=' h-[86px] w-[200px] rounded-[7px] border object-cover object-center'
                        />
                        <div className='flex w-full flex-col gap-2'>
                            <div>
                                <h1 className='font-semibold text-xl'>Fiat 500e 2017</h1>
                                <div className='flex-start gap-5 text-md'>
                                    <span className='text-muted-foreground tracking-wider'>NNM2279</span>
                                </div>
                            </div>
                            <div className='flex-start gap-3'>
                                <span className='flex items-center gap-1'>
                                    <Star fill='currentColor' className='size-5' />
                                    5.0
                                </span>
                                <span>(149 trips)</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='flex w-fit flex-col items-end gap-2 '>
                    <span className='text-md capitalize'>
                        Vehicle Status: <b>Active</b>
                    </span>
                    <Switch defaultChecked={isActive} />
                </div>
            </div>
            <div className='flex gap-4 lg:hidden'>
                <ImagePreview
                    url={primaryImage || '/images/image_not_available.png'}
                    alt={vehicleName}
                    className=' h-[86px] w-[200px] rounded-[7px] border object-cover object-center'
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
