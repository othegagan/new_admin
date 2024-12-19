'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

interface TabItem {
    value: string;
    label: string;
    items?: { value: string; label: string }[];
}

interface MobileMenuProps {
    tabs: TabItem[];
    vehicleId: string;
    activeTab: string;
}

export function MobileMenu({ tabs, vehicleId, activeTab }: MobileMenuProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    const allItems = tabs.flatMap((tab) =>
        tab.items ? [{ ...tab, isParent: true }, ...tab.items.map((item) => ({ ...item, isParent: false }))] : [{ ...tab, isParent: false }]
    );

    return (
        <div className='lg:hidden'>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant='outline' className='w-10 rounded-full p-0' aria-label='Toggle menu'>
                        <Menu className='h-4 w-4' />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-60'>
                    <nav>
                        <ul className='grid gap-2'>
                            {allItems.map((item) => (
                                <li key={item.value}>
                                    <Link
                                        href={`/vehicles/${vehicleId}/${item.value}`}
                                        className={cn(
                                            'block py-2 text-sm transition-colors hover:text-primary',
                                            item.value === activeTab ? 'font-medium text-primary' : 'text-muted-foreground',
                                            item.isParent ? 'font-semibold' : 'pl-4'
                                        )}
                                        onClick={() => setIsOpen(false)}>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </PopoverContent>
            </Popover>
        </div>
    );
}
