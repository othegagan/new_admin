'use client';

import { Main } from '@/components/layout/main';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fuseSettings } from '@/constants';
import { PAGE_ROUTES } from '@/constants/routes';
import { useVehiclesUnderHost } from '@/hooks/useVehicles';
import { cn, toTitleCase } from '@/lib/utils';
import Fuse from 'fuse.js';
import { Plus, Star, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VehiclesPage() {
    const { data: response, error, isLoading: loading } = useVehiclesUnderHost();

    if (loading) {
        return <div className='flex h-full w-full items-center justify-center'>Loading...</div>;
    }

    if (error) {
        return <div className='flex h-full w-full items-center justify-center'>Error: {error?.message}</div>;
    }

    if (!response?.success) {
        return <div className='flex h-full w-full items-center justify-center'>Error: {response?.message}</div>;
    }

    // Sort the vehicles by make
    const allHostsVehicles =
        response?.data?.hostVehicleDetails?.sort((a: { make: string | null }, b: { make: string | null }) => {
            if (a.make === null) return 1;
            if (b.make === null) return -1;
            return a.make.localeCompare(b.make);
        }) || [];

    if (allHostsVehicles.length === 0) {
        return <EmptyGarage />;
    }

    if (!response || !response.success) {
        return <div className='flex h-full w-full items-center justify-center'>Error: {response?.message}</div>;
    }

    // Update the status of each vehicle based on its upload status and active status
    const updatedVehicleList = allHostsVehicles?.map((vehicle: any) => {
        let status = vehicle.isActive ? 'Active' : 'Inactive';
        if (vehicle.upploadStatus === 'inprogress') {
            status = 'Inprogress';
        }
        return { ...vehicle, status };
    });

    return (
        <Main fixed className='flex flex-col gap-4'>
            <VehicleSearchAndFilter cars={updatedVehicleList} />
        </Main>
    );
}

function VehicleSearchAndFilter({ cars }: { cars: any[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState(''); // Initially ''
    const [filteredCars, setFilteredCars] = useState(cars); // Initially set to cars prop

    // Fuse.js setup
    const fuse = new Fuse(cars, {
        ...fuseSettings,
        keys: [
            { name: 'make', weight: 0.3 },
            { name: 'model', weight: 0.3 },
            { name: 'year', weight: 0.1 },
            { name: 'vin', weight: 0.2 },
            { name: 'id', weight: 0.1 },
            { name: 'number', weight: 0.2 },
            { name: 'color', weight: 0.3 }
        ]
    });

    function getVehicleLink(id: any) {
        const uploadStatus = cars.find((car: any) => car.id === id)?.upploadStatus;
        if (uploadStatus === 'inprogress') {
            const vin = cars.find((car: any) => car.id === id)?.vin;
            const vehicleId = cars.find((car: any) => car.id === id)?.id;
            return `${PAGE_ROUTES.ADD_VEHICLE}?vin=${vin}&vehicleId=${vehicleId}&alreadyUploaded=true`;
        }
        return `${PAGE_ROUTES.VEHICLES}/${id}${PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR}`;
    }

    // Filter cars based on search term and selected filter using Fuse.js
    useEffect(() => {
        const filtered = searchTerm
            ? fuse
                  .search(searchTerm)
                  .map((result) => result.item) // Fuzzy search with Fuse.js
            : cars;

        const filteredByStatus = filtered.filter((car) => {
            if (selectedFilter === '' || selectedFilter === 'all') return true;
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

    const vehicleStatuses = [
        { label: 'All', value: 'all', count: allCarsCount },
        { label: 'Active', value: 'active', count: activeCarsCount },
        { label: 'Inprogress', value: 'inprogress', count: inprogressCarsCount },
        { label: 'Inactive', value: 'inactive', count: inactiveCarsCount }
    ];

    return (
        <>
            <div className='flex-center gap-4'>
                <SearchInput
                    placeholder='Search by vehicle name, status ...'
                    className='w-full rounded-full'
                    value={searchTerm}
                    onChange={setSearchTerm}
                />
                <Button href={PAGE_ROUTES.ADD_VEHICLE} size='sm' className='w-fit rounded-full' prefix={<Plus className='size-4' />}>
                    <div className='flex-center gap-1'>
                        Add <span className='hidden md:block'>Vehicle</span>
                    </div>
                </Button>
            </div>

            <div className='flex-start flex-wrap gap-4'>
                <div className='flex-center gap-4'>
                    <Select>
                        <SelectTrigger className=' w-[100px] md:w-[150px]'>
                            <SelectValue placeholder='Trip Status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value='on-trip'>On Trip</SelectItem>
                                <SelectItem value='upcoming'>Upcoming</SelectItem>
                                <SelectItem value='avaliable'>Available</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select value={selectedFilter} onValueChange={handleFilterChange}>
                        <SelectTrigger className='w-[120px] md:w-[150px]'>
                            <SelectValue placeholder='Vehicle Status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {vehicleStatuses.map((status) => (
                                    <SelectItem key={status.label} value={status.value} className='w-full text-justify'>
                                        <div className='flex w-full items-center justify-between '>
                                            {status.label} <span className='ml-4'> ({status.count})</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select>
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
                {selectedFilter !== '' && (
                    <Button
                        variant='outline'
                        onClick={() => {
                            setSelectedFilter('');
                        }}
                        prefix={<X className='size-4' />}
                        className='w-fit rounded-full'
                        size='sm'>
                        <div className='flex-center gap-1'>
                            Clear <span className='hidden md:block'>Filters</span>
                        </div>
                    </Button>
                )}
            </div>

            {!selectedFilter && <h4>{allCarsCount} Vehicles Added</h4>}

            <div className='grid grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {filteredCars.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} link={getVehicleLink(vehicle.id)} />
                ))}
            </div>
        </>
    );
}

function VehicleCard({ vehicle, link }: { vehicle: any; link: string }) {
    const primaryImage = vehicle.imageresponse.find((image: any) => image.isPrimary)?.imagename || '';

    const { make, model, year, rating, tripcount } = vehicle;

    const vehicleName = toTitleCase(`${make} ${model} ${year}`);
    const ratingText = rating ? rating.toFixed(1) : '1.0';
    const tripText = tripcount ? `(${tripcount}  ${tripcount > 1 ? 'trips' : 'trip'})` : null;

    return (
        <Link href={link} className='group h-auto rounded-lg border hover:shadow'>
            <div className='relative flex items-end overflow-hidden rounded-t-lg'>
                <div className='aspect-video h-44 w-full cursor-pointer overflow-hidden rounded-t-md group-hover:opacity-[0.95] lg:aspect-video lg:h-36'>
                    <img
                        src={primaryImage || '/images/image_not_available.png'}
                        alt={vehicleName}
                        className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-[1.02] lg:h-full lg:w-full'
                    />
                </div>
                <VehicleStatusBadge status={vehicle.status} />
            </div>
            <div className='flex flex-col gap-1 p-2'>
                <div className='truncate font-semibold text-md'>{vehicleName}</div>
                <div className='flex-between gap-4'>
                    <p className='text-md text-muted-foreground'>{vehicle.number}</p>
                    <div className='flex-center gap-2'>
                        <Star fill='currentColor' className='size-5' />
                        <span>
                            {ratingText} {tripText}
                        </span>
                    </div>
                </div>
                <div className='flex-center justify-center gap-1 rounded bg-primary/10 p-1.5 text-center font-semibold text-xs'>
                    <span className='text-nowrap'>Current: Bundee Trip </span> (Jan 01 - Jan 04)
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
        Inprogress: 'bg-[#EEE423] dark:bg-yellow-600',
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
            <div className='-z-10 h-[400px] w-[400px] flex-center overflow-hidden'>
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
            <Button size='lg' onClick={() => router.push('/add_vehicle')} className='mt-6 py-4'>
                <Plus className='size-5' /> Add Vehicles
            </Button>
        </div>
    );
}
