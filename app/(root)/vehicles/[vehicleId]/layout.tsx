import { Main } from '@/components/layout/main';
import ImagePreview from '@/components/ui/image-preview';
import { Switch } from '@/components/ui/switch';
import { PAGE_ROUTES } from '@/constants/routes';
import { ChevronLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type * as React from 'react';
import TabsLayout from '../_components/tab-items';

// This is a mock function. In a real app, you'd fetch this data from an API or database.
async function getVehicle(id: string) {
    // Simulating an API call
    const vehicle = {
        id: id,
        name: 'BMW 3 Series 2016',
        code: 'BLT4040',
        rating: 4.5,
        trips: 400,
        status: 'active'
    };
    return vehicle;
}

export default async function VehicleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { vehicleId: string };
}) {
    const vehicle = await getVehicle(params.vehicleId);

    if (!vehicle) {
        notFound();
    }

    const configTabs = [
        { value: PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR, label: 'Calendar' },
        {
            value: PAGE_ROUTES.VEHICLE_DETAILS.MASTER_DATA,
            label: 'Master Data',
            items: [
                { value: PAGE_ROUTES.VEHICLE_DETAILS.MASTER_DATA, label: 'Master Data' },
                { value: PAGE_ROUTES.VEHICLE_DETAILS.IMPORT, label: 'Import Vehicle' },
                { value: PAGE_ROUTES.VEHICLE_DETAILS.PHOTOS, label: 'Photos' },
                { value: PAGE_ROUTES.VEHICLE_DETAILS.DESCRIPTION, label: 'Description' },
                { value: PAGE_ROUTES.VEHICLE_DETAILS.LOCATION_DELIVERY, label: 'Location Delivery' },
                { value: PAGE_ROUTES.VEHICLE_DETAILS.GUEST_GUIDELINES, label: 'Guest Guidelines' },
                { value: PAGE_ROUTES.VEHICLE_DETAILS.MILEAGE_LIMITS, label: 'Mileage Limits' },
                { value: PAGE_ROUTES.VEHICLE_DETAILS.RENTAL_DURATION, label: 'Rental Duration' }
            ]
        },
        { value: PAGE_ROUTES.VEHICLE_DETAILS.PRICING_DISCOUNTS, label: 'Pricing & Discounts' },
        { value: PAGE_ROUTES.VEHICLE_DETAILS.TELEMETICS, label: 'Telematics' },
        { value: PAGE_ROUTES.VEHICLE_DETAILS.NOTIFICATIONS, label: 'Notifications' },
        { value: PAGE_ROUTES.VEHICLE_DETAILS.MAINTENANCE, label: 'Maintenance' },
        { value: PAGE_ROUTES.VEHICLE_DETAILS.TRP_HISTORY, label: 'Trip History' },
        { value: PAGE_ROUTES.VEHICLE_DETAILS.LOGS, label: 'Activity Logs' }
    ];

    // Extract the current active tab from the URL
    const activeTab = params.vehicleId.split('/').pop() || PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR;

    return (
        <Main fixed className=' md:pt-0'>
            {/* Header */}
            <div className=''>
                <Link href={PAGE_ROUTES.VEHICLES} className='inline-flex items-center text-muted-foreground text-sm hover:text-foreground'>
                    <ChevronLeft className='mr-1 h-4 w-4' />
                    Back
                </Link>

                <div className='mt-4 flex items-start justify-between'>
                    <div className='flex gap-4'>
                        <ImagePreview
                            url='https://bundeestorage.blob.core.windows.net/bundeeprodstorage/1474%2F268%2F2f60a6b201594eaf967c270eb8be0d32.jpg'
                            alt='Selfie'
                            className='h-20 w-36 rounded-lg border object-cover object-center'
                        />
                        <div className='space-y-2'>
                            <h3>{vehicle.name}</h3>
                            <div className='flex items-center gap-2 text-md text-muted-foreground'>
                                {vehicle.code}
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
                    <div className='flex items-center gap-2'>
                        <span className='text-sm'>Vehicle Status: {vehicle.status}</span>
                        <Switch defaultChecked={vehicle.status === 'active'} />
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className='mt-2 flex items-center justify-between py-3'>
                    <div className=' flex items-center justify-between'>
                        <TabsLayout />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='overflow-y-auto border-t py-5'>{children}</div>
        </Main>
    );
}
