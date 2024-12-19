'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PAGE_ROUTES } from '@/constants/routes';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface TabItem {
    value: string;
    label: string;
    items?: TabItem[];
}

const configTabs: TabItem[] = [
    { value: '/calendar', label: 'Calendar' },
    {
        value: '/master-data',
        label: 'Master Data',
        items: [
            { value: '/master-data', label: 'Master Data' },
            { value: '/import-vehicle', label: 'Import Vehicle' },
            { value: '/photos', label: 'Photos' },
            { value: '/description', label: 'Description' },
            { value: '/location-delivery', label: 'Location Delivery' },
            { value: '/guest-guidelines', label: 'Guest Guidelines' },
            { value: '/mileage-limits', label: 'Mileage Limits' },
            { value: '/rental-duration', label: 'Rental Duration' }
        ]
    },
    { value: '/pricing-discounts', label: 'Pricing & Discounts' },
    { value: '/telematics', label: 'Telematics' },
    { value: '/notifications', label: 'Notifications' },
    { value: '/maintenance', label: 'Maintenance' },
    { value: '/trip-history', label: 'Trip History' },
    { value: '/activity-logs', label: 'Activity Logs' }
];

const TabsLayout = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { vehicleId } = useParams();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavigation = (path: string) => {
        router.push(`${PAGE_ROUTES.VEHICLES}/${vehicleId}/${path}`);
        setMobileMenuOpen(false); // Close the menu on selection
    };

    return (
        <div className='w-full'>
            {/* Desktop View */}
            <div className='hidden items-center gap-6 border-b pb-2 md:flex'>
                {configTabs.map((tab) => (
                    <div key={tab.value} className='relative'>
                        {!tab.items ? (
                            <button
                                type='button'
                                onClick={() => handleNavigation(tab.value)}
                                className='font-medium text-gray-600 text-sm hover:text-black'>
                                {tab.label}
                            </button>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button type='button' className='font-medium text-gray-600 text-sm hover:text-black'>
                                        {tab.label}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className='w-56'>
                                    {tab.items.map((subItem) => (
                                        <DropdownMenuItem key={subItem.value} onClick={() => handleNavigation(subItem.value)}>
                                            {subItem.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                ))}
            </div>

            {/* Mobile View */}
            <div className='md:hidden'>
                <button
                    type='button'
                    onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                    className='flex w-full items-center justify-between bg-gray-100 px-4 py-2 text-left text-gray-600'>
                    Menu
                    <span>{isMobileMenuOpen ? '▲' : '▼'}</span>
                </button>
                {isMobileMenuOpen && (
                    <div className='mt-2 rounded-lg bg-white shadow-lg'>
                        {configTabs.map((tab) => (
                            <div key={tab.value}>
                                <button
                                    type='button'
                                    onClick={() => handleNavigation(tab.value)}
                                    className='block w-full px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-black'>
                                    {tab.label}
                                </button>
                                {tab.items?.map((subItem) => (
                                    <button
                                        type='button'
                                        key={subItem.value}
                                        onClick={() => handleNavigation(subItem.value)}
                                        className='block w-full px-6 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-black'>
                                        {subItem.label}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabsLayout;
