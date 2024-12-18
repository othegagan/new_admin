'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchInput } from '@/components/ui/search-input';
import { fuseSettings } from '@/constants';
import { useVehiclesUnderHost } from '@/hooks/useVehicles';
import { cn } from '@/lib/utils';
import Fuse from 'fuse.js';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import MapComponent from './MapComponent';
import { SelectedVehicleDetails, VehicleCard } from './VehicleCard';

export default function VehicleSearch() {
    const { data: response, error, isLoading } = useVehiclesUnderHost();
    // Sort the vehicles by make
    const sortedVehicles =
        response?.data?.hostVehicleDetails?.sort((a: { make: string | null }, b: { make: string | null }) => {
            if (a.make === null) return 1;
            if (b.make === null) return -1;
            return a.make.localeCompare(b.make);
        }) || [];

    const allHostsVehicles = sortedVehicles
        .map((vehicle: any) => {
            return {
                ...vehicle,
                imageURL: vehicle?.imageresponse[0]?.imagename,
                fullAddress: `${vehicle?.locationResponses[0]?.cityname}, ${vehicle?.locationResponses[0]?.address1}, ${vehicle?.locationResponses[0]?.address2}, ${vehicle?.locationResponses[0]?.state}, ${vehicle?.locationResponses[0]?.zipcode}`,
                latitude: Number(vehicle?.locationResponses[0]?.latitude || ''),
                longitude: Number(vehicle?.locationResponses[0]?.longitude || ''),
                isVehicleOnTrip: vehicle?.activeTripResponses.length > 0
            };
        })
        .filter(
            (vehicle: any) =>
                vehicle.upploadStatus === 'completed' && vehicle.isActive && vehicle.latitude !== '0' && vehicle.longitude !== '0'
        );

    if (isLoading)
        return (
            <div className='flex flex-col gap-4'>
                <h3>Find My Car</h3>
                Loading...
            </div>
        );
    if (error)
        return (
            <div className='flex flex-col gap-4'>
                <h3>Find My Car</h3>
                <div>Error: {error.message}</div>
            </div>
        );

    return <SearchableVehicleList vehicles={allHostsVehicles} />;
}

function SearchableVehicleList({ vehicles }: { vehicles: any[] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const [open, setOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [filteredCars, setFilteredCars] = useState(vehicles); // Initially set to cars prop
    const [mapData, setMapData] = useState<any[]>(vehicles || []);

    // Fuse.js setup
    const fuse = new Fuse(vehicles, {
        keys: ['make', 'model', 'year', 'vin', 'id', 'number', 'color'],
        ...fuseSettings
    });

    // Filter cars based on search term and selected filter using Fuse.js
    useEffect(() => {
        const filtered = searchTerm ? fuse.search(searchTerm).map((result) => result.item) : vehicles;

        setFilteredCars(filtered);
    }, [searchTerm, vehicles]); // Depend on searchTerm, vehicles

    const handleVehicleSelect = (vehicle: any) => {
        setSelectedVehicle(vehicle);
        setMapData([vehicle]); // Wrap the selected vehicle in an array
        setOpen(false);
    };

    const handleShowAllVehicles = () => {
        setSelectedVehicle(null);
        setMapData(vehicles);
    };

    return (
        <div className='flex h-full w-full flex-col gap-4 md:gap-6'>
            <div className='flex flex-col gap-4 lg:flex-row lg:justify-between'>
                <h3>Find My Car</h3>
                <div className='flex items-center gap-3 '>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <div
                                aria-expanded={open}
                                className={`flex h-auto w-full cursor-pointer items-center justify-between rounded-md border p-2 text-14 text-muted-foreground ${selectedVehicle ? '' : 'md:w-[600px]'}`}>
                                {selectedVehicle ? (
                                    <SelectedVehicleDetails vehicleData={selectedVehicle} />
                                ) : (
                                    'Search by Name, Plate, VIN, ID...'
                                )}
                                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0 lg:w-[500px]'>
                            <Command>
                                <SearchInput
                                    placeholder='Search'
                                    className='w-full border-b px-3 outline-none'
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    variant='command'
                                />
                                <CommandList>
                                    <CommandEmpty>No vehicle found.</CommandEmpty>
                                    <CommandGroup>
                                        {filteredCars.map((vehicle) => (
                                            <CommandItem key={vehicle.id} value={vehicle.id} onSelect={() => handleVehicleSelect(vehicle)}>
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        selectedVehicle?.id === vehicle.id ? 'opacity-100' : 'opacity-0'
                                                    )}
                                                />
                                                <VehicleCard car={vehicle} />
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {selectedVehicle && (
                        <Button onClick={handleShowAllVehicles} variant='outline' className='w-fit' size='sm'>
                            Clear
                        </Button>
                    )}
                </div>
            </div>
            <div className='h-full w-full'>
                <MapComponent filteredCars={mapData || []} />
            </div>
        </div>
    );
}
