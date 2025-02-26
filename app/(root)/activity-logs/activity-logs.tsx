'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PAGE_ROUTES } from '@/constants/routes';
import { format } from 'date-fns';
import Fuse from 'fuse.js';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface ActivityLog {
    id: number;
    changedBy: number;
    message: string;
    createdTime: string;
    isTrip: boolean;
    isVehicle: boolean;
    from: string;
    to: string;
    referenceId: number;
    hostId: number;
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
        return user || { firstname: '-', lastname: '-', userimage: null };
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
                    const href = log.isTrip
                        ? `${PAGE_ROUTES.TRIP_DETAILS}/${log.referenceId}`
                        : `${PAGE_ROUTES.VEHICLES}/${log.referenceId}${PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR}`;
                    return (
                        <Link
                            key={log.id}
                            href={href}
                            prefetch={false}
                            className='flex items-start space-x-4 border-b p-4 transition-colors hover:rounded-lg hover:bg-muted/50'>
                            <Avatar className='h-10 w-10'>
                                <AvatarImage src={user.userimage || undefined} />
                                <AvatarFallback>{user.firstname[0]}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1 space-y-1'>
                                <p className='text-sm'>
                                    <span className='font-medium'>
                                        {user.firstname} {user.lastname}.
                                    </span>{' '}
                                    <span className='text-muted-foreground'>{log.message}</span>
                                </p>
                                <p className='text-muted-foreground text-xs'>
                                    {format(new Date(log.createdTime), "MMM d, yyyy 'at' h:mm a")}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
