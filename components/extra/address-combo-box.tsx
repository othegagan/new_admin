'use client';

import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandLoading } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { getMapboxSuggestions } from '@/server/mapbox';
import { Command as CommandPrimitive } from 'cmdk';
import { LoaderCircle } from 'lucide-react';
import { Fragment, type KeyboardEvent, useEffect, useRef, useState, useTransition } from 'react';
import { useDebounce } from 'use-debounce';

interface AddressComboboxProps {
    locationDetails: string;
    setLocationDetails: (value: any) => void;
    className?: string;
    searchType?: 'general' | 'address';
}

export function AddressCombobox({ locationDetails = '', setLocationDetails, className, searchType = 'general' }: AddressComboboxProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState(locationDetails);
    const [items, setItems] = useState<{ value: string; label: string; data: any }[]>([]);

    const [debouncedSearch] = useDebounce(search, 300);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (debouncedSearch) {
            startTransition(async () => {
                const data = await getMapboxSuggestions(debouncedSearch, searchType);
                if (Array.isArray(data)) {
                    setItems(
                        data.map((place) => ({
                            value: place.id,
                            label: place.place_name,
                            data: place
                        }))
                    );
                }
            });
        } else {
            setItems([]);
        }
    }, [debouncedSearch]);

    const parseSearchBoxDetails = (data: any) => {
        if (!data) return;

        const context = data.context || [];

        const addressComponents = data.place_name?.split(',');

        const newLocationDetails = {
            fullAddress: data.place_name || '',
            address1: addressComponents[0]?.trim() || '',
            city: context.find((c: any) => c.id.includes('place'))?.text || '',
            state: context.find((c: any) => c.id.includes('region'))?.text || '',
            zipcode: context.find((c: any) => c.id.includes('postcode'))?.text || '',
            country: context.find((c: any) => c.id.includes('country'))?.text || '',
            latitude: data.center?.[1]?.toString() || '',
            longitude: data.center?.[0]?.toString() || '',
            isAirport: data.properties?.category?.includes('airport') || false
        };

        setLocationDetails(newLocationDetails);
    };

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Escape') {
            inputRef.current?.blur();
        }
    }

    function handleSelect(value: string) {
        const selectedItem = items.find((item) => item.value === value);
        if (selectedItem) {
            parseSearchBoxDetails(selectedItem.data); // Use the selected item's data directly.

            // Set the full address in the search input. If the search type is 'general', use the label. Otherwise, use the place_name.
            const fullAddress = searchType === 'general' ? selectedItem.label : selectedItem.data.place_name?.split(',')[0]?.trim();

            setSearch(fullAddress);

            // Blur the input and call the onSubmit callback.
            inputRef.current?.blur();
        }
    }

    return (
        <Command shouldFilter={false} className='overflow-visible'>
            <CommandPrimitive.Input
                ref={inputRef}
                placeholder='Search for an address (US)'
                value={search}
                onInput={(e) => setSearch(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                onFocus={(e) => {
                    const inputElement = e.target as HTMLInputElement;
                    inputElement.select();
                    setOpen(true);
                }}
                onBlur={() => setOpen(false)}
                className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    'placeholder:font-light',
                    className
                )}
            />
            <div className='relative'>
                {open && debouncedSearch ? (
                    <CommandList className='absolute top-1.5 z-50 w-full rounded-md border border-border bg-background'>
                        {isPending ? (
                            <CommandLoading>
                                <LoaderCircle className='h-4 w-4 animate-spin text-muted-foreground' />
                            </CommandLoading>
                        ) : (
                            <>
                                <CommandEmpty>No address found.</CommandEmpty>
                                <CommandGroup>
                                    {items.map((item, i) => {
                                        const [first, rest] = item.label.split(/,(.+)/);
                                        return (
                                            <CommandItem
                                                key={`${item.value}-${i}`}
                                                value={item.value}
                                                onSelect={() => handleSelect(item.value)}
                                                onMouseDown={(e) => e.preventDefault()}
                                                className='flex items-baseline gap-1 truncate'>
                                                <span className='text-[14px]'>{getHighlightedText(first, debouncedSearch)}</span>
                                                <span className='truncate text-muted-foreground text-xs'>{rest}</span>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </>
                        )}
                        <div className='border-border border-t bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground'>
                            <p>Suggestions from Mapbox</p>
                        </div>
                    </CommandList>
                ) : null}
            </div>
        </Command>
    );
}

function getHighlightedText(text: string, query: string) {
    if (!query) return text;

    const escapedQuery = query.split(' ').map((word) => word.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`(${escapedQuery.join('|')})`, 'gi');

    return text.split(regex).map((part, index) =>
        regex.test(part) ? (
            <span key={index} className='font-semibold'>
                {part}
            </span>
        ) : (
            <Fragment key={index}>{part}</Fragment>
        )
    );
}
