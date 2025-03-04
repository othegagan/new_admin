'use client';

import { Main } from '@/components/layout/main';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fuseSettings } from '@/constants';
import { PAGE_ROUTES } from '@/constants/routes';
import { useVehiclesUnderHost } from '@/hooks/useVehicles';
import { cn, formatDateAndTime, toTitleCase } from '@/lib/utils';
import { CarNetworkIcon } from '@/public/icons';
import Fuse from 'fuse.js';
import { Plus, Star, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';

// Constants for vehicle statuses
const STATUS_ACTIVE = 'Active';
const STATUS_INACTIVE = 'Inactive';
const STATUS_IN_PROGRESS = 'In Progress';

interface Vehicle {
    status: string | null;
    vehicleId: number;
    make: string;
    createdDate: string;
    model: string;
    zipCode: string;
    year: string;
    vin: string;
    channelName: any;
    plate: string;
    color: string;
    rating: number;
    totalTrips: number;
    updatedDate: string;
    uploadStatus: any;
    isActive: boolean;
    startDate: string | null;
    endDate: string | null;
    statusCode: string | null;
    image: string | null;
    isTelematicsEnabled: boolean;
    tripStatus: string;
    vehicleStatus: string;
}

export default function VehiclesPage() {
    const { data: response, error, isLoading: loading } = useVehiclesUnderHost();

    if (loading) return <CarLoadingSkeleton />;

    if (error) return <div className='flex h-full w-full items-center justify-center'>Error: {error?.message}</div>;

    if (!response?.success) return <div className='flex h-full w-full items-center justify-center'>Error: {response?.message}</div>;

    const allHostsVehicles = response?.data?.vehicleAndTripDetails || [];

    if (allHostsVehicles.length === 0) return <EmptyGarage />;

    // Map and add `vehicleStatus` field
    const updatedVehicleList = allHostsVehicles
        .map((vehicle: Vehicle) => ({
            ...vehicle,
            tripStatus: vehicle.status,
            vehicleStatus: vehicle.uploadStatus === 'inprogress' ? STATUS_IN_PROGRESS : vehicle.isActive ? STATUS_ACTIVE : STATUS_INACTIVE
        }))
        .sort((a: { make: string }, b: { make: string }) => {
            return a.make?.toLowerCase() > b.make?.toLowerCase() ? 1 : -1;
        });

    return (
        <Main fixed className='flex flex-col gap-4'>
            <VehicleSearchAndFilter cars={updatedVehicleList} />
        </Main>
    );
}

function VehicleSearchAndFilter({ cars }: { cars: Vehicle[] }) {
    const [searchTerm, setSearchTerm] = useQueryState('search', { defaultValue: '' });
    const [selectedFilter, setSelectedFilter] = useQueryState('status', { defaultValue: '' });
    const [tripStatus, setTripStatus] = useQueryState('tripStatus', { defaultValue: '' });
    const [sortBy, setSortBy] = useQueryState('sortBy', { defaultValue: '' });
    const [filteredCars, setFilteredCars] = useState(cars);

    const fuse = new Fuse(cars, {
        keys: [
            { name: 'make', weight: 0.3 },
            { name: 'model', weight: 0.3 },
            { name: 'year', weight: 0.1 },
            { name: 'vehicleId', weight: 0.3 },
            { name: 'number', weight: 0.2 },
            { name: 'plate', weight: 0.2 },
            { name: 'color', weight: 0.3 },
            { name: 'vehicleStatus', weight: 0.3 }
        ],
        ...fuseSettings
    });

    useEffect(() => {
        // Create a new array from cars to ensure immutability
        let filtered = [...cars];

        // Apply search filter
        if (searchTerm) {
            filtered = fuse.search(searchTerm).map((result) => result.item);
        }

        // Filter by vehicle status
        if (selectedFilter && selectedFilter !== 'all') {
            filtered = filtered.filter((car) => car.vehicleStatus.toLowerCase() === selectedFilter.toLowerCase());
        }

        // Filter by trip status
        if (tripStatus && tripStatus !== 'all') {
            filtered = filtered.filter((car) => {
                if (car.tripStatus === null) {
                    return tripStatus.toLowerCase() === 'available' && car.vehicleStatus.toLowerCase() === 'active';
                }

                // if tripStatus is upcoming then filter by requested and approved
                if (tripStatus.toLowerCase() === 'upcoming') {
                    return ['requested', 'approved'].includes(car.tripStatus.toLowerCase());
                }

                return car.tripStatus?.toLowerCase() === tripStatus.toLowerCase();
            });
        }

        // Apply sorting
        if (sortBy) {
            filtered.sort((a, b) => {
                if (sortBy === 'last-added' || sortBy === 'last-updated') {
                    return sortBy === 'last-added'
                        ? new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
                        : new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime();
                }
                if (sortBy === 'telematics-enabled') {
                    if (a.isTelematicsEnabled && !b.isTelematicsEnabled) return -1;
                    if (!a.isTelematicsEnabled && b.isTelematicsEnabled) return 1;
                    return 0;
                }
                return 0;
            });
        }

        setFilteredCars(filtered);
    }, [searchTerm, selectedFilter, tripStatus, sortBy, cars]);

    const filteredCount = filteredCars.length;
    const allCarsCount = cars.length;

    const vehicleStatusCounts = {
        all: allCarsCount,
        active: cars.filter((car) => car.vehicleStatus === 'Active').length,
        inactive: cars.filter((car) => car.vehicleStatus === 'Inactive').length,
        inprogress: cars.filter((car) => car.vehicleStatus === 'In Progress').length
    };

    const tripStatusCounts = {
        all: allCarsCount,
        started: cars.filter((car) => car.tripStatus?.toLowerCase() === 'started').length,
        upcoming: cars.filter((car) => ['requested', 'approved'].includes(car.tripStatus?.toLowerCase())).length,
        available: cars.filter((car) => car.tripStatus === null && car.vehicleStatus.toLowerCase() === 'active').length
    };

    function clearFilters() {
        setSearchTerm('');
        setSelectedFilter('');
        setTripStatus('');
        setSortBy('');
        setFilteredCars([...cars]); // Reset to the full, unsorted car list
    }

    function getVehicleLink(id: any) {
        const uploadStatus = cars.find((car: any) => car.vehicleId === id)?.uploadStatus;
        if (uploadStatus === 'inprogress') {
            const vin = cars.find((car: any) => car.vehicleId === id)?.vin;
            return `${PAGE_ROUTES.ADD_VEHICLE}?vin=${vin}&vehicleId=${id}&alreadyUploaded=true`;
        }
        return `${PAGE_ROUTES.VEHICLES}/${id}${PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR}`;
    }

    return (
        <>
            <div className='flex-center gap-4'>
                <SearchInput
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder='Search by vehicle name, status ...'
                    className='w-full rounded-full'
                />
                <Button href={PAGE_ROUTES.ADD_VEHICLE} size='sm' className='w-fit rounded-full' prefix={<Plus className='size-4' />}>
                    <div className='flex-center gap-1'>
                        Add <span className='hidden md:block'>Vehicle</span>
                    </div>
                </Button>
            </div>

            <div className='flex-start flex-wrap gap-4'>
                <div className='flex-center gap-4'>
                    <Select value={tripStatus} onValueChange={setTripStatus}>
                        <SelectTrigger className='w-fit'>
                            <SelectValue placeholder='Trip Status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {[
                                    { label: 'All', value: 'all', count: tripStatusCounts.all },
                                    { label: 'On Trip', value: 'started', count: tripStatusCounts.started },
                                    { label: 'Upcoming', value: 'upcoming', count: tripStatusCounts.upcoming },
                                    { label: 'Available', value: 'available', count: tripStatusCounts.available }
                                ].map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        <div className='flex w-full items-center justify-between'>
                                            {status.label} <span className='ml-4'>({status.count})</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                        <SelectTrigger className='w-fit'>
                            <SelectValue placeholder='Vehicle Status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {[
                                    { label: 'All', value: 'all', count: vehicleStatusCounts.all },
                                    { label: 'Active', value: 'active', count: vehicleStatusCounts.active },
                                    { label: STATUS_IN_PROGRESS, value: 'in progress', count: vehicleStatusCounts.inprogress },
                                    { label: 'Inactive', value: 'inactive', count: vehicleStatusCounts.inactive }
                                ].map((status) => (
                                    <SelectItem key={status.value} value={status.value}>
                                        <div className='flex w-full items-center justify-between'>
                                            {status.label} <span className='ml-4'>({status.count})</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className='w-fit'>
                            <SelectValue placeholder='Sort by' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value='telematics-enabled'>Telematics Enabled</SelectItem>
                                <SelectItem value='last-added'>Last Added</SelectItem>
                                <SelectItem value='last-updated'>Last Updated</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {(selectedFilter || tripStatus || sortBy || searchTerm) && (
                    <Button
                        variant='outline'
                        onClick={clearFilters}
                        prefix={<X className='size-4' />}
                        className='w-fit rounded-full'
                        size='sm'>
                        <div className='flex-center gap-1'>
                            Clear <span className='hidden md:block'>Filters</span>
                        </div>
                    </Button>
                )}
            </div>

            <h4>
                {filteredCount} {filteredCount !== allCarsCount ? `of ${allCarsCount}` : ''} Vehicles
                {searchTerm && ' Found'}
            </h4>

            <div className='grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {filteredCars.map((vehicle) => (
                    <VehicleCard key={vehicle.vehicleId} vehicle={vehicle} link={getVehicleLink(vehicle.vehicleId)} />
                ))}
            </div>
        </>
    );
}

function VehicleCard({ vehicle, link }: { vehicle: Vehicle; link: string }) {
    const {
        make,
        model,
        year,
        rating,
        totalTrips,
        zipCode,
        tripStatus,
        startDate,
        endDate,
        plate,
        channelName,
        vehicleId,
        vehicleStatus,
        image,
        isTelematicsEnabled
    } = vehicle;

    const vehicleName = toTitleCase(`${make} ${model} ${year}`);
    const ratingText = rating ? rating.toFixed(1) : null;
    const tripText = totalTrips ? `(${totalTrips}  ${totalTrips > 1 ? 'trips' : 'trip'})` : '(0 trips)';

    const formatedStartDate = startDate ? formatDateAndTime(startDate, zipCode, 'MMM DD') : null;
    const formatedEndDate = endDate ? formatDateAndTime(endDate, zipCode, 'MMM DD') : null;

    return (
        <a href={link} className='group h-auto rounded-lg border hover:shadow-sm'>
            <div className='relative flex items-end overflow-hidden rounded-t-lg'>
                <div className='aspect-video h-44 w-full cursor-pointer overflow-hidden rounded-t-md group-hover:opacity-[0.95] lg:aspect-video lg:h-36'>
                    <img
                        src={image || '/images/image_not_available.png'}
                        alt={vehicleName}
                        className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-[1.02] lg:h-full lg:w-full'
                    />
                </div>
                <VehicleStatusBadge status={vehicleStatus} />
                <div className='absolute top-2 left-2 inline-flex rounded bg-accent/80 px-2 text-sm'>ID: {vehicleId}</div>
                {isTelematicsEnabled && (
                    <div className='absolute bottom-2 left-1 flex items-center gap-1 rounded-[10px] bg-white p-2 font-semibold text-primary text-xs capitalize'>
                        <CarNetworkIcon className='size-4' /> Telematics Enabled
                    </div>
                )}
            </div>
            <div className='flex flex-col gap-1 p-2'>
                <div className='truncate font-semibold text-md'>{vehicleName}</div>
                <div className='flex-between gap-4'>
                    <p className='text-md text-muted-foreground'>{plate} </p>
                    <div className='flex-center gap-2'>
                        {ratingText && <Star fill='currentColor' className='size-5' />}
                        <span>
                            {ratingText} {tripText}
                        </span>
                    </div>
                </div>
                <div className='flex-center justify-center gap-1 rounded bg-primary/10 p-1.5 text-center font-semibold text-xs'>
                    {tripStatus ? (
                        <>
                            <span className='text-nowrap capitalize'>
                                {tripStatus.toLowerCase() === 'completed' && 'Last'}
                                {['requested', 'approved'].includes(tripStatus.toLowerCase()) && 'Next'}
                                {tripStatus.toLowerCase() === 'started' && 'Ongoing'}: {channelName} Trip{' '}
                            </span>
                            ({formatedStartDate} - {formatedEndDate})
                        </>
                    ) : (
                        'No known trips found'
                    )}
                </div>
            </div>
        </a>
    );
}

function VehicleStatusBadge({
    status,
    className
}: {
    status: string;
    className?: string;
}) {
    const statusClasses: { [key: string]: string } = {
        Active: 'bg-[#C4F891] dark:bg-[#1E9A3C]',
        'In Progress': 'bg-[#EEE423] dark:bg-yellow-600',
        Inactive: 'bg-[#F8C4C4] dark:bg-red-700'
    };

    const statusClass = statusClasses[status] || statusClasses.Inactive;

    return (
        <div
            className={cn(
                'absolute top-2 right-1 inline-flex items-center rounded-[2px] px-2.5 py-0.5 font-semibold text-foreground text-xs capitalize',
                statusClass,
                className
            )}>
            {status}
        </div>
    );
}

function EmptyGarage() {
    const router = useRouter();
    return (
        <div className='my-10 flex h-[70dvh] w-full flex-col items-center justify-center gap-4 text-center'>
            <div className='-z-10 h-[400px] w-[400px] flex-center overflow-hidden dark:invert'>
                <Image
                    src='/images/empty-garage.gif'
                    unoptimized
                    alt='Garage empty'
                    width={300}
                    height={300}
                    className='scale-[1.6] md:scale-2 '
                />
            </div>
            <h3 className='md:-mt-12 font-bold text-2xl text-muted-foreground tracking-tight'>Your Bundee garage is looking a bit bare.</h3>
            <p className='text-muted-foreground'>Fill it with your vehicles and unlock amazing opportunities.</p>
            <Button size='lg' onClick={() => router.push(PAGE_ROUTES.ADD_VEHICLE)} className='mt-6 py-4'>
                <Plus className='size-5' /> Add Vehicles
            </Button>
        </div>
    );
}
