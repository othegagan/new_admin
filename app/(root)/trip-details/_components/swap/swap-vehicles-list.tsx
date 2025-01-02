'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fuseSettings } from '@/constants';
import type { SwapVehicles } from '@/types';
import Fuse from 'fuse.js';
import { X } from 'lucide-react';
import { useState } from 'react';
import SwapVehicleCard from './swap-vehicle-card';

interface SwapVehiclesListProps {
    swapVehicles: SwapVehicles[];
}

export default function SwapVehiclesList({ swapVehicles }: SwapVehiclesListProps) {
    const [query, setQuery] = useState('');
    const [filteredVehicles, setFilteredVehicles] = useState<SwapVehicles[]>(swapVehicles);

    // Fuse.js configuration
    const fuse = new Fuse(swapVehicles, {
        ...fuseSettings,
        keys: ['make', 'model', 'year', 'id', 'vin', 'number'], // Fields to search
        threshold: 0.3 // Adjust for fuzzy matching sensitivity
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchQuery = e.target.value;
        setQuery(searchQuery);

        if (searchQuery.trim() === '') {
            setFilteredVehicles(swapVehicles); // Reset to full list if query is empty
        } else {
            const results = fuse.search(searchQuery);
            setFilteredVehicles(results.map((result) => result.item));
        }
    };

    return (
        <>
            <div className='max-w-2xl flex-center gap-4'>
                <Input
                    type='text'
                    value={query}
                    onChange={handleSearch}
                    placeholder='Search by vehicle name, id, plate'
                    className='w-full rounded-full border px-4 py-2 '
                />

                {query && (
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            setQuery(''); // Clear the search input
                            setFilteredVehicles(swapVehicles); // Reset the vehicle list
                        }}>
                        <X className='size-4' />
                        Clear
                    </Button>
                )}
            </div>

            {filteredVehicles.length > 0 ? (
                <div className='grid h-[calc(100dvh-20rem)] grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {filteredVehicles.map((vehicle) => (
                        <SwapVehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                </div>
            ) : (
                <p>No vehicles found.</p>
            )}
        </>
    );
}
