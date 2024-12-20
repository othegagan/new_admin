'use client';

import { Main } from '@/components/layout/main';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAGE_ROUTES } from '@/constants/routes';
import { Plus, Star, X } from 'lucide-react';
import Link from 'next/link';

export default function VehiclesPage() {
    function handleSearch(e: any) {}
    return (
        <Main fixed className='flex flex-col gap-4'>
            <div className='flex-center gap-4'>
                <SearchInput
                    placeholder='Search by vehicle name, status ...'
                    className='w-full rounded-full'
                    value=''
                    onChange={handleSearch}
                />
                <Button href={PAGE_ROUTES.ADD_VEHICLE} size='sm' className='w-fit rounded-full' prefix={<Plus className='size-4' />}>
                    <div className='flex-center gap-1'>
                        Add <span className='hidden md:block'>Vehicle</span>
                    </div>
                </Button>
            </div>

            <div className='flex-between flex-wrap gap-4'>
                <div className='flex-center gap-4'>
                    <Select>
                        <SelectTrigger className='hidden w-[150px] md:flex'>
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
                    <Select>
                        <SelectTrigger className='w-[150px]'>
                            <SelectValue placeholder='Vehicle Status' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value='active'>Active</SelectItem>
                                <SelectItem value='inprogress'>In Progress</SelectItem>
                                <SelectItem value='inactive'>In Active</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select>
                        <SelectTrigger className='w-[150px]'>
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
                <Button variant='outline' prefix={<X className='size-4' />} className='w-fit rounded-full' size='sm'>
                    <div className='flex-center gap-1'>
                        Clear <span className='hidden md:block'>Filters</span>
                    </div>
                </Button>
            </div>

            <h4>10 Vehicles Added</h4>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {vehicleData.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
            </div>
        </Main>
    );
}

const vehicleData = [
    {
        id: 1,
        name: 'Chevrolet BOLT EV 2017',
        make: 'BLT35904',
        trips: '1.0 (10 trips)',
        status: 'Active',
        upcomingTrip: 'Current: Bundee Trip',
        dates: 'Jan 01 - Dec 28',
        imageUrl: 'https://bundeestorage.blob.core.windows.net/bundeeprodstorage/1474%2F268%2F2f60a6b201594eaf967c270eb8be0d32.jpg'
    },
    {
        id: 2,
        name: 'Tesla Model S 2020',
        make: 'TMS2020',
        trips: '4.5 (200 trips)',
        status: 'Inactive',
        upcomingTrip: 'No Upcoming Trip',
        dates: '—',
        imageUrl: 'https://fiat.b-cdn.net/L4148583.jpeg'
    },
    {
        id: 3,
        name: 'Toyota Prius 2015',
        make: 'TPR2015',
        trips: '3.8 (50 trips)',
        status: 'Active',
        upcomingTrip: 'Next: Business Trip',
        dates: 'Feb 10 - Feb 15',
        imageUrl: 'https://bundeestorage.blob.core.windows.net/bundeeprodstorage/1474%2F263%2Fd7555fc76d8146d78f20ab4d6ce7f7b0.jpg'
    },
    {
        id: 4,
        name: 'BMW i3 2019',
        make: 'BMWi319',
        trips: '4.9 (150 trips)',
        status: 'Active',
        upcomingTrip: 'Current: Personal Trip',
        dates: 'Mar 01 - Mar 10',
        imageUrl: 'https://bundeestorage.blob.core.windows.net/bundeeprodstorage/1474%2F256%2Fe3b084cd676c424e8e6c482ff7c37c9c.jpg'
    },
    {
        id: 5,
        name: 'Ford Mustang Mach-E 2021',
        make: 'FMME2021',
        trips: '4.7 (300 trips)',
        status: 'Inactive',
        upcomingTrip: 'No Upcoming Trip',
        dates: '—',
        imageUrl: 'https://fiat.b-cdn.net/H4162396.jpeg'
    }
];

function VehicleCard({ vehicle }: { vehicle: any }) {
    const link = `${PAGE_ROUTES.VEHICLES}/${vehicle.id}${PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR}`;
    return (
        <Link href={link} className='group h-auto rounded-lg border hover:shadow'>
            <div className='relative flex items-end overflow-hidden rounded-t-lg'>
                <div className='aspect-video h-44 w-full cursor-pointer overflow-hidden rounded-t-md group-hover:opacity-[0.95] lg:aspect-video lg:h-40'>
                    <img
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-[1.02] lg:h-full lg:w-full'
                    />
                </div>
                <div
                    className={`absolute top-2 right-1 inline-flex items-center rounded-[2px] px-2.5 py-0.5 font-semibold text-xs capitalize ${
                        vehicle.status === 'Active' ? 'bg-[#C4F891] text-black' : 'bg-[#F8C4C4] text-black'
                    }`}>
                    {vehicle.status}
                </div>
            </div>
            <div className='flex flex-col gap-1 p-2'>
                <div className='truncate font-semibold text-md'>{vehicle.name}</div>
                <div className='flex-between gap-4'>
                    <p className='text-md text-muted-foreground'>{vehicle.make}</p>
                    <div className='flex-center gap-2'>
                        <Star fill='currentColor' className='size-5' />
                        <span>{vehicle.trips}</span>
                    </div>
                </div>
                <div className='flex-center justify-center gap-1 rounded bg-primary/10 p-1.5 text-center font-semibold text-sm'>
                    <span className='text-nowrap'>{vehicle.upcomingTrip} </span> ({vehicle.dates})
                </div>
            </div>
        </Link>
    );
}
