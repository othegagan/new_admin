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
                    value='sdaf'
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

            <div className='grid gap-4 overflow-y-auto pr-2 md:grid-cols-2 md:pr-4 lg:grid-cols-3 xl:grid-cols-4'>
                <VehicleCard />
                <VehicleCard />
                <VehicleCard />
                <VehicleCard />
                <VehicleCard />
                <VehicleCard />
                <VehicleCard />
                <VehicleCard />
                <VehicleCard />
                <VehicleCard />
                <VehicleCard />
            </div>
        </Main>
    );
}

function VehicleCard() {
    const link = '#';
    const vehicleName = 'Chevrolet BOLT EV 2017';
    const vehicleMake = 'BLT35904';
    const trips = '1.0 (10 trips)';
    const status = 'Active';
    const upcomingTrip = 'Current: Bundee Trip';
    const dates = 'Jan 01 - Dec 28';
    const imageUrl = 'https://bundeestorage.blob.core.windows.net/bundeeprodstorage/1474%2F268%2F2f60a6b201594eaf967c270eb8be0d32.jpg';

    return (
        <Link href={link} className='group h-auto rounded-lg border hover:shadow'>
            <div className='relative flex items-end overflow-hidden rounded-t-lg '>
                <div className='aspect-video h-44 w-full cursor-pointer overflow-hidden rounded-t-md group-hover:opacity-[0.95] lg:aspect-video lg:h-40'>
                    <img
                        src={imageUrl}
                        alt={vehicleName}
                        className='h-full w-full object-cover object-center transition-all ease-in-out group-hover:scale-[1.02] lg:h-full lg:w-full'
                    />
                </div>
                <div className='absolute top-2 right-1 inline-flex items-center rounded-[2px] bg-[#C4F891] px-2.5 py-0.5 font-semibold text-black text-xs capitalize '>
                    {status}
                </div>
            </div>
            <div className='flex flex-col gap-1 p-2'>
                <div className='truncate font-semibold text-md'>{vehicleName}</div>
                <div className='flex-between gap-4'>
                    <p className='text-md text-muted-foreground'>{vehicleMake}</p>
                    <div className='flex-center gap-2'>
                        <Star fill='currentColor' className='size-5' />
                        <span>{trips}</span>
                    </div>
                </div>
                <div className='flex-center justify-center gap-1 rounded bg-primary/10 p-1.5 text-center font-semibold text-sm '>
                    <span className='text-nowrap'>{upcomingTrip} </span> ({dates})
                </div>
            </div>
        </Link>
    );
}
