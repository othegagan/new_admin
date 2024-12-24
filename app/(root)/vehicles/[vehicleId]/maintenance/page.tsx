'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Command, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const vehicleItems = [
    // Services
    'Air Filter',
    'Battery',
    'Belts',
    'Brake Pads',
    'Brake Fluid',
    'Car Wash',
    'Fuel Filter',
    'Inspection',
    'Lights',
    'New Tires',
    'Oil Change',
    'Oil Filter',
    'Tire Rotation',
    'Suspension',
    'Wheel Alignment',
    'Tire Pressure',
    'Transmission Service',
    'Engine Tune-Up',
    'Coolant Flush',
    'Radiator Replacement',
    'Spark Plugs Replacement',
    'Starter Motor Repair',
    'Exhaust System Repair',
    'Clutch Repair',
    'Wiper Blade Replacement',
    'Air Conditioning Service',
    'Electrical Diagnostics',
    'Emissions Test',
    'Interior Cleaning',
    'Headlight Restoration',
    'Paint Touch-Up',
    'Undercoating',
    'Rust Removal',
    'Windshield Repair',
    'Dashboard Repair',
    'Wheel Balancing',

    // Expenses
    'Fuel Costs',
    'Insurance Premiums',
    'Loan Payments',
    'Registration Fees',
    'Inspection Fees',
    'Parking Fees',
    'Toll Charges',
    'Maintenance Costs',
    'Repairs and Servicing',
    'Tire Replacements',
    'Battery Replacement',
    'Car Accessories',
    'Extended Warranty Costs',
    'Accident Repairs',
    'Roadside Assistance',
    'Depreciation',
    'Emission Testing Fees',
    'Cleaning and Detailing',
    'Modifications',
    'Storage Costs',
    'Vehicle Tax',
    'Alignment and Balancing',
    'Technology Updates (e.g., GPS systems)',
    'Subscription Services (e.g., satellite radio)'
];

export default function VehicleItemSelector() {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState('');

    return (
        <div className='mx-auto max-w-3xl p-4'>
            <h1 className='mb-4 font-bold text-2xl'>Vehicle Item Selector</h1>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild className='w-full'>
                    <button
                        type='button'
                        className='flex w-full items-center justify-between gap-2 rounded-md border border-input px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'>
                        {value ? value : 'Select  item...'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </button>
                </PopoverTrigger>
                <PopoverContent className='w-full p-0'>
                    <Command>
                        <CommandInput placeholder='Search  item...' />
                        <CommandGroup>
                            {vehicleItems.map((item) => (
                                <CommandItem
                                    key={item}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? '' : currentValue);
                                        setOpen(false);
                                    }}>
                                    <Check className={cn('mr-2 h-4 w-4', value === item ? 'opacity-100' : 'opacity-0')} />
                                    {item}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
