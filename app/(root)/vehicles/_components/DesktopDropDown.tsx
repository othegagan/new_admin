'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAGE_ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DropdownProps {
    label: string;
    items: { value: string; label: string }[];
    vehicleId: string;
    activeTab: string;
}

export function DesktopDropdown({ label, items, vehicleId, activeTab }: DropdownProps) {
    const router = useRouter();

    return (
        <div className='relative'>
            <Select
                value={items.some((item) => item.value === activeTab) ? activeTab : ''}
                onValueChange={(value) => router.push(`${PAGE_ROUTES.VEHICLES}/${vehicleId}/${value}`)}>
                <SelectTrigger
                    className={cn(
                        'w-[180px] justify-between',
                        'rounded-none border-transparent border-b-2',
                        items.some((item) => item.value === activeTab) ? 'border-primary' : ''
                    )}>
                    <SelectValue placeholder={label} />
                    <ChevronDown className='h-4 w-4 opacity-50' />
                </SelectTrigger>
                <SelectContent>
                    {items.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
