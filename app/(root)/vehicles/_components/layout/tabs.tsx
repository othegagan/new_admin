'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PAGE_ROUTES, vehicleConfigTabs } from '@/constants/routes';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { SplitButtonDropdown } from './split-button-dropdown';

export default function Tabs() {
    const pathname = usePathname();
    const router = useRouter();
    const { vehicleId } = useParams();
    const basePath = `${PAGE_ROUTES.VEHICLES}/${vehicleId}`;

    const selectedTabMobileValue =
        vehicleConfigTabs.mobile.find((tab) => pathname === `${basePath}${tab.herf}`)?.herf || PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR;

    function handleNavigation(href: string) {
        router.push(`${PAGE_ROUTES.VEHICLES}/${vehicleId}${href}`);
    }
    const activeVehicleDataItem = vehicleConfigTabs.desktop.vehicleData.items.find((item) => pathname === `${basePath}${item.href}`);

    return (
        <>
            <div className='mt-3 p-0.5 md:hidden'>
                <select
                    name='vehicle-config-tabs'
                    id='vehicle-config-tabs'
                    className='flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-accent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'
                    defaultValue={selectedTabMobileValue}
                    onChange={(e) => handleNavigation(e.target.value)}>
                    {vehicleConfigTabs.mobile.map((tab) => (
                        <option key={tab.id} value={tab.herf}>
                            {tab.label}
                        </option>
                    ))}
                </select>
            </div>

            <ScrollArea
                orientation='horizontal'
                type='always'
                className=' my-3 hidden w-full min-w-40 border-b bg-background px-1 py-2 md:block'>
                <nav className={cn('flex space-x-2 pb-3.5 ')}>
                    <Button
                        variant='ghost'
                        className={cn(
                            'font-medium text-sm duration-75 hover:text-primary',
                            pathname === `${PAGE_ROUTES.VEHICLES}/${vehicleId}${vehicleConfigTabs.desktop.calendar.herf}`
                                ? 'bg-primary/80 hover:bg-primary hover:text-foreground '
                                : 'text-muted-foreground'
                        )}>
                        <Link href={`${PAGE_ROUTES.VEHICLES}/${vehicleId}${vehicleConfigTabs.desktop.calendar.herf}`}>
                            {vehicleConfigTabs.desktop.calendar.label}
                        </Link>
                    </Button>

                    <SplitButtonDropdown
                        key='vehicle-data-dropdown'
                        options={vehicleConfigTabs.desktop.vehicleData.items.map((item) => ({
                            ...item,
                            href: `${PAGE_ROUTES.VEHICLES}/${vehicleId}${item.href}`
                        }))}
                        defaultOption={
                            activeVehicleDataItem
                                ? {
                                      label: activeVehicleDataItem.label,
                                      href: `${basePath}${activeVehicleDataItem.href}`
                                  }
                                : {
                                      label: vehicleConfigTabs.desktop.vehicleData.label,
                                      href: `${basePath}${vehicleConfigTabs.desktop.vehicleData.items[0].href}`
                                  }
                        }
                        onSelect={(option) => handleNavigation(option.href)}
                        isActive={!!activeVehicleDataItem}
                    />

                    {vehicleConfigTabs.desktop.remaining.map((tab) => (
                        <Button
                            key={`${PAGE_ROUTES.VEHICLES}/${vehicleId}${tab.href}`}
                            variant='ghost'
                            className={cn(
                                'font-medium text-sm duration-75 hover:text-primary',
                                pathname === `${PAGE_ROUTES.VEHICLES}/${vehicleId}${tab.href}`
                                    ? 'bg-primary/80 hover:bg-primary hover:text-foreground '
                                    : 'text-muted-foreground'
                            )}>
                            <Link href={`${PAGE_ROUTES.VEHICLES}/${vehicleId}${tab.href}`}>{tab.label}</Link>
                        </Button>
                    ))}
                </nav>
            </ScrollArea>
        </>
    );
}
