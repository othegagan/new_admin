'use client';

import { Button } from '@/components/ui/button';
import { PAGE_ROUTES, vehicleConfigTabs } from '@/constants/routes';
import { useIsMobile } from '@/hooks/utils/use-mobile';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { SplitButtonDropdown } from './split-button-dropdown';

export default function VehicleConfigTabs() {
    const pathname = usePathname();
    const router = useRouter();
    const { vehicleId } = useParams();

    const isMobile = useIsMobile();

    const basePath = `${PAGE_ROUTES.VEHICLES}/${vehicleId}`;

    const selectedTabMobileValue =
        vehicleConfigTabs.mobile.find((tab) => pathname === `${basePath}${tab.herf}`)?.herf || PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR;

    function handleNavigation(href: string) {
        router.push(href);
    }

    const activeVehicleDataItem = vehicleConfigTabs.desktop.vehicleData.items.find((item) => pathname === `${basePath}${item.href}`);

    if (isMobile) {
        return (
            <div>
                <select
                    key={selectedTabMobileValue}
                    name='vehicle-config-tabs'
                    id='vehicle-config-tabs'
                    className='flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring '
                    defaultValue={selectedTabMobileValue}
                    onChange={(e) => handleNavigation(e.target.value)}>
                    {vehicleConfigTabs.mobile.map((tab) => (
                        <option key={tab.herf} value={tab.herf}>
                            {tab.label}
                        </option>
                    ))}
                </select>
            </div>
        );
    }

    return (
        <div className='flex w-full items-center overflow-auto py-2 md:gap-2'>
            <Button
                key={`${basePath}${vehicleConfigTabs.desktop.calendar.herf}`}
                variant='ghost'
                className={cn(
                    'font-medium text-sm duration-75 hover:text-primary',
                    pathname === `${PAGE_ROUTES.VEHICLES}/${vehicleId}${vehicleConfigTabs.desktop.calendar.herf}`
                        ? 'bg-primary/80 hover:bg-primary hover:text-foreground '
                        : 'text-muted-foreground'
                )}>
                <Link href={`${basePath}${vehicleConfigTabs.desktop.calendar.herf}`}>{vehicleConfigTabs.desktop.calendar.label}</Link>
            </Button>

            <SplitButtonDropdown
                key='vehicle-data-dropdown'
                options={vehicleConfigTabs.desktop.vehicleData.items.map((item) => ({
                    ...item,
                    href: `${basePath}${item.href}`
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
        </div>
    );
}
