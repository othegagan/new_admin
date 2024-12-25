'use client';

import { Command, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';

interface PopoverSelectProps {
    value: string;
    setValue: (value: string) => void;
    options: string[];
    className?: string;
}

export function PopoverSelect({ value, setValue, options, className }: PopoverSelectProps) {
    return (
        <Popover>
            <PopoverTrigger asChild className={cn('w-full', className)}>
                <button
                    type='button'
                    className='flex w-full items-center justify-between gap-2 rounded-md border border-input px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'>
                    {value ? value : 'Select item...'}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </button>
            </PopoverTrigger>
            <PopoverContent className='w-full p-0'>
                <Command>
                    <CommandInput placeholder='Search item...' />
                    <CommandGroup className='max-h-44 w-full overflow-y-auto'>
                        {options.map((item) => (
                            <CommandItem
                                key={item}
                                onSelect={(currentValue) => {
                                    setValue(currentValue === value ? '' : currentValue);
                                    // Close the Popover
                                    const popoverTrigger = document.querySelector('[data-state="open"]');
                                    if (popoverTrigger) {
                                        (popoverTrigger as HTMLElement).click();
                                    }
                                }}>
                                <Check className={cn('mr-2 h-4 w-4', value === item ? 'opacity-100' : 'opacity-0')} />
                                {item}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
