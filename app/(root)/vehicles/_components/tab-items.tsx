'use client';

import { Button } from '@/components/ui/button';
import { PAGE_ROUTES, vehicleConfigTabs } from '@/constants/routes';
import { useIsMobile } from '@/hooks/utils/use-mobile';
import { cn } from '@/lib/utils';
import Link from 'next/link';

import { useParams, usePathname, useRouter } from 'next/navigation';

export default function ConfigTabs() {
    const pathname = usePathname();
    const router = useRouter();
    const { vehicleId } = useParams();

    const isMobile = useIsMobile();

    const basePath = `${PAGE_ROUTES.VEHICLES}/${vehicleId}`;

    const selectedTabMobileValue =
        vehicleConfigTabs.mobile.find((tab) => pathname === `${basePath}${tab.herf}`)?.herf || PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR;

    function handleNavigation(value: string) {
        router.replace(`${basePath}${value}`);
    }

    if (isMobile) {
        return (
            <div>
                <select
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
        <div className='flex w-full items-center overflow-auto py-2 md:gap-6'>
            <Button
                variant='ghost'
                className={cn(
                    'font-medium text-sm duration-75 hover:text-primary',
                    pathname === `/vehicles/${vehicleId}${vehicleConfigTabs.desktop.calendar.herf}`
                        ? 'bg-primary/80 hover:bg-primary hover:text-foreground '
                        : 'text-muted-foreground'
                )}>
                <Link href={`${basePath}${vehicleConfigTabs.desktop.calendar.herf}`}>{vehicleConfigTabs.desktop.calendar.label}</Link>
            </Button>

            <select
                name='vehicle-config-tabs'
                id='vehicle-config-tabs'
                className='flex w-fit max-w-[200px] items-center justify-between whitespace-nowrap rounded-full border border-input p-1 px-3 py-2 pr-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'
                defaultValue={vehicleConfigTabs.desktop.vehicleData.items[0].href}
                onChange={(e) => handleNavigation(e.target.value)}>
                {vehicleConfigTabs.desktop.vehicleData.items.map((tab) => (
                    <option key={tab.href} value={tab.href} disabled={tab.href === '#'}>
                        {tab.label}
                    </option>
                ))}
            </select>

            {/* <Select
                value={selectedTabDesktopValue}
                defaultValue={vehicleConfigTabs.desktop.vehicleData.items[0].href}
                onValueChange={(value) => handleNavigation(value)}>
                <SelectTrigger className='w-[180px] rounded-full'>
                    <SelectValue placeholder={vehicleConfigTabs.desktop.vehicleData.label} />
                </SelectTrigger>
                <SelectContent>
                    {vehicleConfigTabs.desktop.vehicleData.items.map((tab) => (
                        <SelectItem key={tab.href} value={tab.href} disabled={tab.href === '#'} >
                            {tab.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select> */}

            {vehicleConfigTabs.desktop.remaining.map((tab) => (
                <Button
                    key={tab.href}
                    variant='ghost'
                    className={cn(
                        'font-medium text-sm duration-75 hover:text-primary',
                        pathname === `/vehicles/${vehicleId}${tab.href}`
                            ? 'bg-primary/80 hover:bg-primary hover:text-foreground '
                            : 'text-muted-foreground'
                    )}>
                    <Link href={`${PAGE_ROUTES.VEHICLES}/${vehicleId}${tab.href}`}>{tab.label}</Link>
                </Button>
            ))}
        </div>
    );
}
