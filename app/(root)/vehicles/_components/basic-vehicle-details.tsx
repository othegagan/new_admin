'use client ';

import ImagePreview from '@/components/ui/image-preview';
import { Switch } from '@/components/ui/switch';
import { PAGE_ROUTES } from '@/constants/routes';
import { ChevronLeft, Star } from 'lucide-react';
import Link from 'next/link';

interface BasicVehicleDetailsProps {
    vehicleId: number;
}

export default function BasicVehicleDetails({ vehicleId }: BasicVehicleDetailsProps) {
    const vehicle = {
        id: vehicleId,
        name: 'BMW 3 Series 2016',
        code: 'BLT4040',
        rating: 4.5,
        trips: 400,
        status: 'active'
    };

    return (
        <div className=''>
            <div className='flex items-start justify-between'>
                <Link href={PAGE_ROUTES.VEHICLES} className='inline-flex items-center text-md text-muted-foreground hover:text-foreground'>
                    <ChevronLeft className='mr-1 h-4 w-4' />
                    Back
                </Link>

                <div className='flex w-fit flex-col items-end gap-2 md:mt-4'>
                    <span className='text-md capitalize'>
                        Vehicle Status: <b>{vehicle.status}</b>
                    </span>
                    <Switch defaultChecked={vehicle.status === 'active'} />
                </div>
            </div>

            <div className='flex gap-4'>
                <ImagePreview
                    url='https://bundeestorage.blob.core.windows.net/bundeeprodstorage/1474%2F268%2F2f60a6b201594eaf967c270eb8be0d32.jpg'
                    alt='car'
                    className=' h-20 w-[200px] rounded-lg border object-cover object-center'
                />
                <div className='w-full space-y-2'>
                    <h1 className='font-semibold text-xl'>{vehicle.name}</h1>
                    <div className='flex-start gap-5 text-md'>
                        <span className='text-muted-foreground tracking-wider'>{vehicle.code}</span>
                        <div className='flex-start gap-3'>
                            <span className='flex items-center gap-1'>
                                <Star fill='currentColor' className='size-5' />
                                {vehicle.rating}
                            </span>
                            <span>({vehicle.trips} Trips)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
