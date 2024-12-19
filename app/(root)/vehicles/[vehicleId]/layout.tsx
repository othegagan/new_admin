import { Main } from '@/components/layout/main';
import ImagePreview from '@/components/ui/image-preview';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type * as React from 'react';
import { DesktopDropdown } from '../_components/DesktopDropDown';
import { MobileMenu } from '../_components/MobileMenu';

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

    const tabs = [
        { value: 'calendar', label: 'Calendar' },
        {
            value: 'master-data',
            label: 'Master Data',
            items: [
                { value: 'general-info', label: 'General Info' },
                { value: 'documents', label: 'Documents' },
                { value: 'images', label: 'Images' }
            ]
        },
        { value: 'pricing', label: 'Pricing & Discounts' },
        { value: 'platform-sync', label: 'Platform Sync' },
        { value: 'telematics', label: 'Telematics' },
        { value: 'notifications', label: 'Notifications' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'trip-history', label: 'Trip History' },
        { value: 'activity-logs', label: 'Activity Logs' }
    ];

    // Extract the current active tab from the URL
    const activeTab = params.vehicleId.split('/').pop() || 'calendar';

    return (
        <Main fixed className=' md:py-0'>
            {/* Header */}
            <div className=''>
                <Link href='/vehicles' className='inline-flex items-center text-muted-foreground text-sm hover:text-foreground'>
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
                <div className='mt-6 flex items-center justify-between'>
                    <Tabs defaultValue={activeTab} className='w-full'>
                        <TabsList className='hidden h-auto w-full justify-start rounded-none border-b bg-transparent p-0 lg:flex'>
                            {tabs.map((tab) =>
                                tab.items ? (
                                    <DesktopDropdown
                                        key={tab.value}
                                        label={tab.label}
                                        items={tab.items}
                                        vehicleId={params.vehicleId}
                                        activeTab={activeTab}
                                    />
                                ) : (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className='rounded-none data-[state=active]:border-primary data-[state=active]:bg-transparent'
                                        asChild>
                                        <Link href={`/vehicles/${params.vehicleId}/${tab.value}`}>{tab.label}</Link>
                                    </TabsTrigger>
                                )
                            )}
                        </TabsList>
                    </Tabs>
                    <MobileMenu tabs={tabs} vehicleId={params.vehicleId} activeTab={activeTab} />
                </div>
            </div>

            {/* Main Content */}
            <div className='overflow-y-auto'>{children}</div>
        </Main>
    );
}
