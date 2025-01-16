'use client';

import { Button } from '@/components/ui/button';
import { getFullAddress, toTitleCase } from '@/lib/utils';
import type { SwapVehicles } from '@/types';
import { MapPin, Star } from 'lucide-react';
import useSwapDialog from './useSwapDialog';

interface SwapVehiclesListProps {
    vehicle: SwapVehicles | any;
    hideButtons?: boolean;
}

export default function SwapVehicleCard({ vehicle, hideButtons = false }: SwapVehiclesListProps) {
    const swapDialog = useSwapDialog();
    const { id: vehicleId, make, model, year, rating, number: plate, imageresponse, price_per_hr } = vehicle;

    const vehicleName = toTitleCase(`${make} ${model} ${year}`);
    const ratingText = rating ? rating.toFixed(1) : null;
    const image = imageresponse?.[0]?.imagename || '';

    function handleSwap(swapType: 'force' | 'propose') {
        swapDialog.swapType = swapType;
        swapDialog.newVehicleDetails = vehicle;
        swapDialog.onOpen();
    }

    return (
        <div className='group h-fit rounded-lg border hover:shadow'>
            <div className='relative flex items-end overflow-hidden rounded-t-lg'>
                <div className='aspect-video h-44 w-full overflow-hidden rounded-t-md group-hover:opacity-[0.95] lg:aspect-video lg:h-36'>
                    <img
                        src={image || '/images/image_not_available.png'}
                        alt={vehicleName}
                        className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-[1.02] lg:h-full lg:w-full'
                    />
                </div>

                <div className='absolute top-2 left-2 inline-flex rounded bg-accent/80 px-2 text-sm'>ID: {vehicleId}</div>
            </div>
            <div className='flex flex-col gap-1 p-2'>
                <div className='flex-between gap-4'>
                    <div className='max-w-[200px] truncate font-semibold text-md'>{vehicleName}</div>
                    <div className='font-medium text-primary'>${price_per_hr}/Day</div>
                </div>
                <div className='flex-between gap-4'>
                    <p className='text-md text-muted-foreground'>{plate} </p>
                    <div className='flex-center gap-2'>
                        {ratingText && <Star fill='currentColor' className='size-5' />}
                        <span>{ratingText}</span>
                    </div>
                </div>

                <div className='flex-start gap-2 text-muted-foreground text-sm'>
                    <MapPin className='size-4' /> <span className='truncate'>{getFullAddress({ vehicleDetails: vehicle })}</span>
                </div>

                {!hideButtons && (
                    <div className='mt-3 flex items-center justify-around gap-2'>
                        <Button
                            variant='outline'
                            onClick={() => handleSwap('propose')}
                            size='sm'
                            className='w-fit border-primary/50 text-primary hover:text-primary '>
                            Propose Swap
                        </Button>
                        <Button className='w-fit' size='sm' onClick={() => handleSwap('force')}>
                            Force Swap
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
