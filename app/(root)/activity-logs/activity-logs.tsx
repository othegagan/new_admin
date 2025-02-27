'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAGE_ROUTES } from '@/constants/routes';
import { getFullAddress } from '@/lib/utils';
import { format } from 'date-fns';
import Fuse from 'fuse.js';
import { CircleCheck, CircleX, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface ActivityLog {
    id: number;
    changedBy: number;
    referenceId: number;
    hostId: number;
    message: string;
    from: string;
    to: string;
    createdTime: string;
    isTrip: boolean;
    isVehicle: boolean;
    updateTag: string;
}

interface User {
    iduser: number;
    firstname: string;
    lastname: string;
    userimage: string | null;
    userRole: string;
}

interface ActivityLogsProps {
    activityLogs: ActivityLog[];
    users: User[];
}

export default function ActivityLogs({ activityLogs, users }: ActivityLogsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [timeFilter, setTimeFilter] = useState('today');
    const [sortBy, setSortBy] = useState('newest');

    // Configure Fuse.js for search with enhanced options
    const searchableData = activityLogs.map((log) => {
        const user = users.find((u) => u.iduser === log.changedBy) || { firstname: '', lastname: '', userRole: '' };
        return {
            ...log,
            userFullName: `${user.firstname} ${user.lastname}`,
            userRole: user.userRole
        };
    });

    const fuse = new Fuse(searchableData, {
        keys: ['message', 'from', 'to', 'userFullName', 'userRole'],
        threshold: 0.3
    });

    // Filter and sort logs
    const filteredLogs = useMemo(() => {
        let filtered = searchQuery ? fuse.search(searchQuery).map((result) => result.item) : searchableData;

        // Apply time filter
        if (timeFilter === 'today') {
            const today = new Date().toISOString().split('T')[0];
            filtered = filtered.filter((log) => log.createdTime.startsWith(today));
        }

        // Apply sorting
        return filtered.sort((a, b) => {
            const dateA = new Date(a.createdTime);
            const dateB = new Date(b.createdTime);
            return sortBy === 'newest' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
        });
    }, [searchQuery, timeFilter, sortBy, searchableData, fuse]);

    // Get user info by ID
    const getUserInfo = (userId: number) => {
        const user = users.find((u) => u.iduser === userId);
        return user || { iduser: 0, firstname: '-', lastname: '-', userimage: null, userRole: '-' };
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchQuery('');
        setTimeFilter('today');
        setSortBy('newest');
    };

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-5 md:flex-row md:items-center md:justify-between'>
                <div className='flex w-full max-w-2xl items-center gap-2'>
                    <SearchInput
                        placeholder='Search by user name, role, status, trip ID, vehicle'
                        value={searchQuery}
                        onChange={(value) => setSearchQuery(value)}
                        className='w-full'
                    />
                </div>

                <div className='flex items-center gap-4'>
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Filter by time' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Activity</SelectItem>
                            <SelectItem value='today'>Today</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Sort by' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='newest'>Newest First</SelectItem>
                            <SelectItem value='oldest'>Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                    {(searchQuery || timeFilter !== 'today' || sortBy !== 'newest') && (
                        <Button
                            variant='outline'
                            onClick={clearAllFilters}
                            prefix={<X className='size-4' />}
                            className='w-fit rounded-full'
                            size='sm'>
                            <div className='flex-center gap-1'>
                                Clear <span className='hidden md:block'>Filters</span>
                            </div>
                        </Button>
                    )}
                </div>
            </div>
            <div className='space-y-1'>
                {filteredLogs.map((log) => {
                    const user = getUserInfo(log.changedBy);
                    if (log.isTrip) return <TripLog key={log.id} log={log} user={user} />;
                    if (log.isVehicle) return <VehicleLog key={log.id} log={log} user={user} />;
                })}
            </div>
        </div>
    );
}

function TripLog({ log, user }: { log: ActivityLog; user: User }) {
    const desc = `${log.message}. (Trip ID: ${log.referenceId})`;
    return (
        <Link
            key={log.id}
            href={`${PAGE_ROUTES.TRIP_DETAILS}/${log.referenceId}`}
            prefetch={false}
            className='flex items-start space-x-4 border-b p-4 transition-colors hover:rounded-lg hover:bg-muted/50'>
            <Avatar className='h-10 w-10'>
                <AvatarImage src={user.userimage || undefined} />
                <AvatarFallback>{user.firstname[0]}</AvatarFallback>
            </Avatar>
            <div className='flex-1 space-y-1'>
                <div className='flex flex-col gap-2 text-sm md:flex-start '>
                    <div className='font-medium'>
                        {user.firstname} {user.lastname}.
                    </div>
                    <div className='text-muted-foreground'>{desc}</div>
                </div>
                <p className='text-muted-foreground text-xs'>{format(new Date(log.createdTime), "MMM d, yyyy 'at' h:mm a")}</p>
            </div>
        </Link>
    );
}

function VehicleLog({ log, user }: { log: ActivityLog; user: User }) {
    const desc = `${log.message}. (Vehicle ID: ${log.referenceId})`;
    return (
        <Accordion type='single' collapsible className=''>
            <AccordionItem key={log.id} value={log.id.toString()}>
                <AccordionTrigger className='flex items-start space-x-4 p-4 transition-colors hover:rounded-lg hover:bg-muted/50 hover:no-underline'>
                    <Avatar className='h-10 w-10'>
                        <AvatarImage src={user.userimage || undefined} />
                        <AvatarFallback>{user.firstname[0]}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1 space-y-1'>
                        <div className='flex flex-col gap-2 text-sm md:flex-start '>
                            <div className='font-medium'>
                                {user.firstname} {user.lastname}.
                            </div>
                            <div className='text-muted-foreground'>{desc}</div>
                        </div>
                        <p className='text-muted-foreground text-xs'>{format(new Date(log.createdTime), "MMM d, yyyy 'at' h:mm a")}</p>
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <LogContent log={log} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

function LogContent({ log }: { log: any }) {
    const oldData = log.from ? JSON.parse(log.from) : null;
    const newData = log.to ? JSON.parse(log.to) : null;

    const displayData = (data: any, type: 'old' | 'new') => {
        const icon = type === 'old' ? <CircleX className='size-5 text-red-500' /> : <CircleCheck className='size-5 text-green-500' />;

        if (!data || Object.keys(data).length === 0) {
            return (
                <div className='flex w-full flex-col gap-4 gap-y-2'>
                    <p>No {type} data available</p>
                </div>
            );
        }

        switch (log.updateTag) {
            case 'VehicleProfile':
                return (
                    <div className='flex w-full flex-col gap-4 gap-y-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Vehicle Profile
                        </div>
                        <div>
                            <p>Vehicle Color: {data?.vehicleColor}</p>
                            <p>Vehicle Number Plate: {data?.vehicleNumberPlate}</p>
                            <p>Year: {data?.year}</p>
                            <p>Vehicle State: {data?.vehicleState}</p>
                        </div>
                    </div>
                );

            case 'Discounts':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Pricing Details
                        </div>
                        <div>
                            {data?.Price && (
                                <p className='font-semibold'>
                                    Price: <span className='font-normal'> ${data.Price}</span>
                                </p>
                            )}
                            {data?.Discounts && (
                                <>
                                    <p className='font-semibold'>Discounts:</p>
                                    <ul className='ml-4'>
                                        {data.Discounts.constraintValue?.map((discount: any, index: number) => (
                                            <li key={index}>{`${discount.numberOfDays} days discount: ${discount.discountPercentage}%`}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                );

            case 'Description':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Description
                        </div>
                        {data.Description && (
                            <pre className='w-full text-wrap font-sans font-semibold'>
                                <span className='font-normal'>{data.Description}</span>
                            </pre>
                        )}
                    </div>
                );

            case 'MileageConstraint':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Mileage Constraint
                        </div>
                        <div>
                            <p>Daily Mileage Limit: {data.dailyMileageLimit}</p>
                            <p>Extra Mileage Cost: {data.extraMileageCost}</p>
                        </div>
                    </div>
                );

            case 'Location':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2 font-semibold'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Location
                        </div>
                        <p className='font-normal capitalize'>{getFullAddress({ vehicleDetails: data })}.</p>
                        <p>Latitude: {data.latitude || '-'}</p>
                        <p>Longitude: {data.longitude || '-'}</p>
                    </div>
                );

            case 'DeliveryDetails':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Delivery Details
                        </div>
                        {JSON.parse(data.delivery)?.map((detail: any, index: any) => (
                            <div key={index}>
                                <p>Delivery to Airport: {detail.deliveryToAirport ? 'Yes' : 'No'}</p>
                                <p>Airport Delivery Cost: ${detail.airportDeliveryCost}</p>
                                <p>Delivery Radius: {detail.deliveryRadius} miles</p>
                                <p>Non-Airport Delivery Cost: ${detail.nonAirportDeliveryCost}</p>
                            </div>
                        ))}
                    </div>
                );

            case 'MinimumMaximumDays':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Minimum and Maximum Days
                        </div>
                        <div>
                            {data.minimumDays && <p>Minimum Days: {data.minimumDays}</p>}
                            {data.maximumDays && <p>Maximum Days: {data.maximumDays}</p>}
                        </div>
                    </div>
                );

            case 'GuestInstructionsAndGuideLines':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Guest Instructions and GuideLines
                        </div>
                        {data.GuestInstructionsAndGuideLines && (
                            <pre className='w-full text-wrap font-sans font-semibold'>
                                <span className='font-normal'>{data.GuestInstructionsAndGuideLines}</span>
                            </pre>
                        )}
                    </div>
                );

            case 'VehicleConstraintLink':
                return (
                    <div className='flex w-full flex-col gap-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Vehicle Constraint Link
                        </div>
                        {data.VehicleConstraintLink?.map((constraint: any, index: any) => (
                            <div key={index}>
                                {constraint.constraintValue.map((value: any, vIndex: any) => (
                                    <div key={vIndex}>
                                        <p>ID/URL: {value.url}</p>
                                        <p>Channel Name: {value.channelName}</p>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                );

            case 'Images':
                return (
                    <div className='flex w-full flex-col gap-4 gap-y-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Image
                        </div>
                        {data.imageName ? (
                            <div className='aspect-video w-full overflow-hidden rounded-md bg-neutral-200 group-hover:opacity-75 lg:aspect-video lg:h-44 lg:w-1/2'>
                                <img
                                    src={data.imageName}
                                    alt={`${type}-${data.imageName}`}
                                    className='h-full w-full object-cover object-center'
                                />
                            </div>
                        ) : (
                            <p>No {type} image available</p>
                        )}
                    </div>
                );

            case 'Unavailability':
                return (
                    <div className='flex w-full flex-col gap-4 gap-y-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Unavailability
                        </div>
                        <div>
                            {data.newStartDate && <p>Start Date: {format(new Date(data.newStartDate), 'PPP, h:mm a')}</p>}
                            {data.newEndDate && <p>End Date: {format(new Date(data.newEndDate), 'PPP, h:mm a')}</p>}
                            {data.startDate && <p>Start Date: {format(new Date(data.startDate), 'PPP, h:mm a')}</p>}
                            {data.endDate && <p>End Date: {format(new Date(data.endDate), 'PPP, h:mm a')}</p>}
                            {data.deletedStartDate && <p>Deleted Start Date: {format(new Date(data.deletedStartDate), 'PPP, h:mm a')}</p>}
                            {data.deletedEndDate && <p>Deleted End Date: {format(new Date(data.deletedEndDate), 'PPP, h:mm a')}</p>}
                        </div>
                    </div>
                );

            case 'VehicleActivation':
                return (
                    <div className='flex w-full flex-col gap-4 gap-y-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Vehicle Status:
                            <span> {data.vehicleActivation ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                );

            case 'DynamicPrice':
                return (
                    <div className='flex w-full flex-col gap-4 gap-y-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Pricing
                        </div>
                        <div>
                            {data.fromDate && <p>From Date: {format(new Date(data.fromDate), 'PPP, h:mm a')}</p>}
                            {data.toDate && <p>To Date: {format(new Date(data.toDate), 'PPP, h:mm a')}</p>}
                            {data.price && <p>Price: {data.price}</p>}
                            {data.newFromDate && <p>New From Date: {format(new Date(data.newFromDate), 'PPP, h:mm a')}</p>}
                            {data.newToDate && <p>New To Date: {format(new Date(data.newToDate), 'PPP, h:mm a')}</p>}
                            {data.newPrice && <p>New Price: {data.newPrice}</p>}
                            {data.deletedPriceToDate && (
                                <p>Deleted Price To Date: {format(new Date(data.deletedPriceToDate), 'PPP, h:mm a')}</p>
                            )}
                            {data.deletedPrice && <p>Deleted Price: {data.deletedPrice}</p>}
                        </div>
                    </div>
                );

            case '5MAREREQ':
            case 'REAPP':
            case '4HBTRSTR':
            case '2HBTRSTR':
            case '1HBTRSTR':
            case '1HATRSTR':
            case '12HBTRCOM':
            case '1HBTRCOM':
                return (
                    <div className='flex w-full flex-col gap-4 gap-y-2'>
                        <div className='flex items-center gap-2'>
                            {icon} {type === 'old' ? 'Old' : 'New'} Alert Message
                        </div>
                        <div>
                            <p>{data.message}</p>
                        </div>
                    </div>
                );

            default:
                return <pre className='text-wrap rounded bg-neutral-100 p-2 text-sm'>{JSON.stringify(data, null, 2)}</pre>;
        }
    };

    return (
        <div className='mt-4 flex flex-col gap-5 md:flex-row md:px-20'>
            {displayData(oldData, 'old')}
            <div className='w-px bg-neutral-400' />
            {displayData(newData, 'new')}
        </div>
    );
}
