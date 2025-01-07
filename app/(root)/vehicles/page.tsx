'use client';

import { Main } from '@/components/layout/main';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fuseSettings } from '@/constants';
import { PAGE_ROUTES } from '@/constants/routes';
import { useVehiclesUnderHost } from '@/hooks/useVehicles';
import { cn, formatDateAndTime, toTitleCase } from '@/lib/utils';
import Fuse from 'fuse.js';
import { Plus, Star, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';

// Constants for vehicle statuses
const STATUS_ACTIVE = 'Active';
const STATUS_INACTIVE = 'Inactive';
const STATUS_IN_PROGRESS = 'In Progress';

export default function VehiclesPage() {
    const { data: response, error, isLoading: loading } = useVehiclesUnderHost();

    if (loading)
        return (
            <div className='flex h-full w-full flex-col items-center justify-center gap-6'>
                <img src='./images/car_loading.gif' className='h-auto w-40 dark:invert' alt='Loading...' />
            </div>
        );
    if (error) return <div className='flex h-full w-full items-center justify-center'>Error: {error?.message}</div>;
    if (!response?.success) return <div className='flex h-full w-full items-center justify-center'>Error: {response?.message}</div>;

    const allHostsVehicles = response?.data?.vehicleAndTripDetails || [];

    if (allHostsVehicles.length === 0) return <EmptyGarage />;

    // Map and add `vehicleStatus` field
    const updatedVehicleList = allHostsVehicles.map((vehicle: any) => ({
        ...vehicle,
        vehicleStatus: vehicle.uploadStatus === 'inprogress' ? STATUS_IN_PROGRESS : vehicle.isActive ? STATUS_ACTIVE : STATUS_INACTIVE
    }));

    return (
        <Main fixed className='flex flex-col gap-4'>
            <VehicleSearchAndFilter cars={updatedVehicleList} />
        </Main>
    );
}

function VehicleSearchAndFilter({ cars }: { cars: any[] }) {
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
        let filtered = searchTerm ? fuse.search(searchTerm).map((result) => result.item) : cars;

        // Filter by vehicle status
        if (selectedFilter && selectedFilter !== 'all') {
            filtered = filtered.filter((car) => car.vehicleStatus.toLowerCase() === selectedFilter.toLowerCase());
        }

        // Filter by trip status
        if (tripStatus && tripStatus !== 'all') {
            filtered = filtered.filter((car) => {
                if (car.status === null) {
                    return tripStatus.toLowerCase() === 'available';
                }

                // if tripStatus is upcoming then filter by requested and approved
                if (tripStatus.toLowerCase() === 'upcoming') {
                    return ['requested', 'approved'].includes(car.status.toLowerCase());
                }

                return car.status?.toLowerCase() === tripStatus.toLowerCase();
            });
        }

        // Sort vehicles by date
        if (sortBy === 'last-updated' || sortBy === 'last-added') {
            filtered.sort((a, b) =>
                sortBy === 'last-added'
                    ? new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
                    : new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime()
            );
        }

        // Update filteredCars
        setFilteredCars(filtered);
    }, [searchTerm, selectedFilter, tripStatus, sortBy, cars]);

    const filteredCount = filteredCars.length;
    const allCarsCount = cars.length;
    const activeCarsCount = cars.filter((car) => car.vehicleStatus === 'Active').length;
    const inprogressCarsCount = cars.filter((car) => car.vehicleStatus === 'In Progress').length;
    const inactiveCarsCount = cars.filter((car) => car.vehicleStatus === 'Inactive').length;

    function clearFilters() {
        setSearchTerm('');
        setSelectedFilter('');
        setTripStatus('');
        setSortBy('');
        setFilteredCars(cars); // Reset to the full, unsorted car list
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
                        <SelectTrigger className='w-[150px]'>
                            <SelectValue placeholder='Trip Status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value='all'>All</SelectItem>
                                <SelectItem value='started'>On Trip</SelectItem>
                                <SelectItem value='upcoming'>Upcoming</SelectItem>
                                <SelectItem value='available'>Available</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                        <SelectTrigger className='w-[120px] md:w-[170px]'>
                            <SelectValue placeholder='Vehicle Status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {[
                                    { label: 'All', value: 'all', count: allCarsCount },
                                    { label: 'Active', value: 'active', count: activeCarsCount },
                                    { label: STATUS_IN_PROGRESS, value: 'in progress', count: inprogressCarsCount },
                                    { label: 'Inactive', value: 'inactive', count: inactiveCarsCount }
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
                        <SelectTrigger className='w-[110px] md:w-[150px]'>
                            <SelectValue placeholder='Sort by' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
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

function VehicleCard({ vehicle, link }: { vehicle: any; link: string }) {
    const {
        make,
        model,
        year,
        rating,
        totalTrips,
        zipCode,
        status: tripStatus,
        startDate,
        endDate,
        plate,
        channelName,
        vehicleId,
        vehicleStatus,
        image
    } = vehicle;

    const vehicleName = toTitleCase(`${make} ${model} ${year}`);
    const ratingText = rating ? rating.toFixed(1) : null;
    const tripText = totalTrips ? `(${totalTrips}  ${totalTrips > 1 ? 'trips' : 'trip'})` : '(0 trips)';

    const formatedStartDate = startDate ? formatDateAndTime(startDate, zipCode, 'MMM DD') : null;
    const formatedEndDate = endDate ? formatDateAndTime(endDate, zipCode, 'MMM DD') : null;

    return (
        <Link href={link} className='group h-auto rounded-lg border hover:shadow'>
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
        </Link>
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
            <div className='-z-10 h-[400px] w-[400px] flex-center overflow-hidden dark:hidden'>
                <Image
                    src='/images/empty-garage.gif'
                    unoptimized
                    alt='Garage empty'
                    width={300}
                    height={300}
                    className='scale-[1.6] md:scale-[2]'
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
