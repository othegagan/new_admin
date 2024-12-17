'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SearchInput } from '@/components/ui/search-input';
import { fuseSettings } from '@/constants';
import { PAGE_ROUTES } from '@/constants/routes';
import { useVehiclesUnderHost } from '@/hooks/useVehicles';
import { cn, toTitleCase } from '@/lib/utils';
import Fuse from 'fuse.js';
import { ListFilter } from 'lucide-react';
import { usePathname, useRouter, useSelectedLayoutSegments } from 'next/navigation';
import { forwardRef, useEffect, useRef, useState } from 'react';

export default function VehicleList() {
    const { data: response, error, isLoading: loading } = useVehiclesUnderHost();

    // Sort the vehicles by make
    const allHostsVehicles =
        response?.data?.hostVehicleDetails?.sort((a: { make: string | null }, b: { make: string | null }) => {
            if (a.make === null) return 1;
            if (b.make === null) return -1;
            return a.make.localeCompare(b.make);
        }) || [];

    // Update the status of each vehicle based on its upload status and active status
    const updatedVehicleList = allHostsVehicles?.map((vehicle: any) => {
        let status = vehicle.isActive ? 'Active' : 'Inactive';
        if (vehicle.upploadStatus === 'inprogress') {
            status = 'Inprogress';
        }
        return { ...vehicle, status };
    });

    return (
        <div className='flex h-full flex-col gap-4'>
            {loading && <div>Loading Vehicles...</div>}
            {error && <div>Error: {error?.message}</div>}
            {!loading && response && !response.success && <div>Error: {response?.message}</div>}
            {!loading && (!response || allHostsVehicles.length === 0) && <div>No Vehicles found.</div>}
            {!loading && response && response.success && allHostsVehicles.length > 0 && <VehicleCards cars={updatedVehicleList} />}
        </div>
    );
}

function VehicleCards({ cars }: { cars: any[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const urlSegments = useSelectedLayoutSegments();

    const selectedCardRef = useRef<HTMLButtonElement | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all'); // Initially 'all'
    const [filteredCars, setFilteredCars] = useState(cars); // Initially set to cars prop

    // Fuse.js setup
    const fuse = new Fuse(cars, {
        keys: ['make', 'model', 'year', 'vin', 'id', 'number', 'color'],
        ...fuseSettings
    });

    const getSelectedVehicleId = () => {
        const idMatch = pathname.match(/\/vehicles\/(\d+)/);
        return idMatch ? idMatch[1] : null;
    };

    const handleCardClick = (id: any) => {
        const uploadStatus = cars.find((car: any) => car.id === id)?.upploadStatus;
        if (uploadStatus === 'inprogress') {
            const vin = cars.find((car: any) => car.id === id)?.vin;
            const vehicleId = cars.find((car: any) => car.id === id)?.id;
            router.replace(`${PAGE_ROUTES.ADD_VEHICLE}?vin=${vin}&vehicleId=${vehicleId}&alreadyUploaded=true`);
            return;
        }
        const currentOperation = urlSegments[1] || 'calendar';
        router.replace(`/vehicles/${id}/${currentOperation}`);
    };

    const selectedVehicleId = getSelectedVehicleId();

    // Scroll to the selected card when it changes
    useEffect(() => {
        if (selectedCardRef.current) {
            selectedCardRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [selectedVehicleId, filteredCars]);

    // Filter cars based on search term and selected filter using Fuse.js
    useEffect(() => {
        const filtered = searchTerm
            ? fuse
                  .search(searchTerm)
                  .map((result) => result.item) // Fuzzy search with Fuse.js
            : cars;

        const filteredByStatus = filtered.filter((car) => {
            if (selectedFilter === 'all') return true;
            return (
                (selectedFilter === 'active' && car.status === 'Active') ||
                (selectedFilter === 'inprogress' && car.status === 'Inprogress') ||
                (selectedFilter === 'inactive' && car.status === 'Inactive')
            );
        });

        setFilteredCars(filteredByStatus);
    }, [searchTerm, selectedFilter, cars]); // Depend on searchTerm, selectedFilter, and cars

    const handleFilterChange = (filter: string) => {
        setSelectedFilter(filter);
    };

    const allCarsCount = cars.length;
    const activeCarsCount = cars.filter((car) => car.status === 'Active').length;
    const inprogressCarsCount = cars.filter((car) => car.status === 'Inprogress').length;
    const inactiveCarsCount = cars.filter((car) => car.status === 'Inactive').length;

    return (
        <div className='flex h-full flex-col gap-3'>
            <div className='sticky top-0 z-20 mb-2 space-y-3 bg-background md:mb-0'>
                <div className='flex items-center justify-between gap-4'>
                    <SearchInput placeholder='Search' className='w-full' value={searchTerm} onChange={setSearchTerm} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className='relative h-9 flex-center cursor-pointer gap-2 rounded-md border bg-background px-3 py-1.5 font-medium text-xs'>
                                <ListFilter className='h-3.5 w-3.5' /> Filter
                                {selectedFilter !== 'all' && (
                                    <div className='-right-1 -top-1 absolute flex size-3 items-center rounded-full bg-primary' />
                                )}
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                            <DropdownMenuRadioGroup value={selectedFilter} onValueChange={handleFilterChange}>
                                <DropdownMenuRadioItem value='all'>All ({allCarsCount})</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value='active'>Active ({activeCarsCount})</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value='inprogress'>In Progress ({inprogressCarsCount})</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value='inactive'>Inactive ({inactiveCarsCount})</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <ul className='flex flex-col overflow-y-auto border-t'>
                {filteredCars.map((car: any) => (
                    <VehicleCard
                        car={car}
                        key={car.id}
                        handleCardClick={handleCardClick}
                        isSelected={car.id.toString() === selectedVehicleId}
                        ref={car.id.toString() === selectedVehicleId ? selectedCardRef : null}
                    />
                ))}
            </ul>
        </div>
    );
}

const VehicleCard = forwardRef<HTMLButtonElement, { car: any; handleCardClick: any; isSelected: boolean }>(
    ({ car, handleCardClick, isSelected }, ref) => {
        const primaryImage = car.imageresponse.find((image: any) => image.isPrimary)?.imagename || '';
        const vehicleName = toTitleCase(`${car.make} ${car.model} ${car.year}`);

        return (
            <div
                //@ts-ignore
                ref={ref}
                onClick={() => handleCardClick(car.id)}
                className={`group flex cursor-pointer items-start gap-2 border-b p-3 text-left text-sm transition-all hover:bg-accent ${isSelected ? 'border border-primary bg-muted shadow-md' : ''}`}>
                <div className='aspect-video h-full w-24 flex-center overflow-hidden rounded-[6px] border'>
                    <img
                        src={primaryImage || '/images/image_not_available.png'}
                        alt={vehicleName}
                        className='h-full w-full object-cover object-center'
                    />
                </div>

                <div className='flex flex-1 select-text flex-col gap-1.5'>
                    <div className='flex w-full flex-col gap-1'>
                        <div className='line-clamp-1 select-text font-bold text-14 group-hover:line-clamp-none'>{vehicleName}</div>
                        <div className='select-text font-medium text-muted-foreground text-xs uppercase'>VIN: {car.vin}</div>
                        <div className='select-text font-medium text-muted-foreground text-xs'>ID: {car.id}</div>
                    </div>

                    <div className='flex w-full items-center'>
                        <div className='select-text font-semibold text-foreground text-xs'>{car.number}</div>

                        <VehicleStatusBadge status={car.status} />
                    </div>
                </div>
            </div>
        );
    }
);

function VehicleStatusBadge({
    status,
    className
}: {
    status: string;
    className?: string;
}) {
    const statusClasses: { [key: string]: string } = {
        Active: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100',
        Inprogress: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
        Inactive: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100'
    };

    const statusClass = statusClasses[status] || statusClasses.Inactive;

    return (
        <div
            className={cn(
                'ml-auto inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 font-semibold text-xs capitalize shadow transition-colors',
                statusClass,
                className
            )}>
            {status}
        </div>
    );
}
