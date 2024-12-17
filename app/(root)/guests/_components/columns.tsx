'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { PAGE_ROUTES } from '@/constants/routes';
import { currencyFormatter } from '@/lib/utils';
import { UserAlertIcon, UserCheckIcon } from '@/public/icons';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';

type GuestBasicInfo = {
    firstName: string;
    lastName: string;
    isDrivingLicenseVarified: boolean;
    userStatus: string;
    userId: number | string;
    numberOfBookings: number;
    userImage: string | null;
    isPhoneVarified: boolean;
    upcomingDriverTrips: any[];
    codes?: string;
};

export const guestsColumns: ColumnDef<GuestBasicInfo>[] = [
    {
        accessorKey: 'userId',
        header: ({ column }) => {
            return (
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Guest
                    <ChevronsUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        },
        cell: ({ row }) => {
            const userId = row.getValue('userId');
            const userImage = row.original.userImage;
            const fullName = `${row.original?.firstName} ${row.original?.lastName}`;
            return (
                <div className='flex items-center'>
                    <Avatar className='mr-2 h-8 w-8'>
                        <AvatarImage src={userImage || undefined} alt={`${userId}`} />
                        <AvatarFallback>{fullName.toString().slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <Link href={`${PAGE_ROUTES.GUESTS}/${userId}`} className='hover:underline'>
                        {fullName}
                    </Link>
                </div>
            );
        }
    },
    {
        accessorKey: 'userStatus',
        header: ({ column }) => {
            return (
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Status
                    <ChevronsUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        },
        cell: ({ cell }: { cell: any }) => {
            return <div className='pl-5'>{cell?.getValue()}</div>;
        }
    },
    {
        id: 'bookingReadiness',
        header: ({ column }) => {
            return (
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Booking Readiness
                    <ChevronsUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        },
        cell: ({ row }) => {
            const isReady = row.original.isDrivingLicenseVarified && row.original.isPhoneVarified;
            return (
                <div className={isReady ? 'text-green-500' : 'text-yellow-500'}>
                    {isReady ? (
                        <span className='flex items-center gap-2'>
                            <UserCheckIcon className='mr-1' /> Driver Actions Complete
                        </span>
                    ) : (
                        <span className='flex items-center gap-2'>
                            <UserAlertIcon className='mr-1' /> Driver Actions Pending
                        </span>
                    )}
                </div>
            );
        }
    },
    {
        accessorKey: 'numberOfBookings',
        header: ({ column }) => {
            return (
                <div className='flex-center py-1'>
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        # of Bookings
                        <ChevronsUpDown className='ml-2 h-4 w-4' />
                    </Button>
                </div>
            );
        },
        cell: ({ cell }: { cell: any }) => {
            return <div className='flex-center'>{cell?.getValue()}</div>;
        }
    },
    {
        accessorKey: 'upcomingDriverTrips',
        header: ({ column }) => {
            return (
                <div className='flex-center py-1'>
                    <Button variant='ghost' className='flex-center' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Upcoming Booking
                        <ChevronsUpDown className='ml-2 h-4 w-4' />
                    </Button>
                </div>
            );
        },
        cell: ({ row }) => {
            const userId = row.getValue('userId');
            const upcomingTrips = row.original.upcomingDriverTrips;

            if (upcomingTrips.length === 0) return <div className='flex-center gap-2'>-</div>;

            return (
                <Link href={`/drivers/${userId}`} className='flex-center gap-2 hover:underline'>
                    {upcomingTrips[0]}
                </Link>
            );
        }
    }
];

type DriverBookingHistory = {
    userId: number;
    hostId: number;
    startDate?: string;
    endDate: string;
    tripId: number;
    capturedAmount: number;
    vehicleId: number;
    vin: string;
    make: string;
    model: string;
    year: string;
};

export const driverBookingHistoryColumns: ColumnDef<DriverBookingHistory>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => {
            return (
                <div className='flex-center py-1'>
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Sl No.
                        <ChevronsUpDown className='ml-2 h-4 w-4' />
                    </Button>
                </div>
            );
        },
        cell: ({ cell }: { cell: any }) => {
            return <div className='flex-center'>{cell?.getValue()}</div>;
        }
    },

    {
        accessorFn: (row) => `${row.make} ${row.model} ${row.year}`.trim(),
        id: 'booking',
        header: ({ column }) => {
            return (
                <div className='flex-center py-1'>
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Bookings
                        <ChevronsUpDown className='ml-2 h-4 w-4' />
                    </Button>
                </div>
            );
        },
        enableSorting: true,
        cell: ({ row }: { row: any }) => {
            const bookingId = row.original.tripId;
            const vehicleName = `${row.original.make} ${row.original.model} ${row.original.year}`;
            return (
                <div className='flex-center gap-4 text-nowrap'>
                    <Link href={`/booking/${bookingId}/details`} className='text-nowrap font-semibold underline'>
                        BID: {bookingId}
                    </Link>
                    <span className='text-nowrap'>{vehicleName}</span>
                </div>
            );
        }
    },

    {
        accessorKey: 'status',
        header: ({ column }) => {
            return (
                <div className='flex-center py-1'>
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Booking Status
                        <ChevronsUpDown className='ml-2 h-4 w-4' />
                    </Button>
                </div>
            );
        },
        enableSorting: true,
        cell: ({ cell }: { cell: any }) => {
            return <div className='flex-center capitalize'>{cell?.getValue()}</div>;
        }
    },

    {
        accessorKey: 'capturedAmount',
        header: ({ column }) => {
            return (
                <div className='flex-center py-1'>
                    <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Captured Amount
                        <ChevronsUpDown className='ml-2 h-4 w-4' />
                    </Button>
                </div>
            );
        },
        enableSorting: true,
        cell: ({ cell }: { cell: any }) => {
            return <div className='flex-center'>{currencyFormatter({ value: cell?.getValue(), roundTo: 2 })}</div>;
        }
    }

    // {
    //     id: 'supportTickets',
    //     header: ({ column }) => {
    //         return <div className='flex-center text-nowrap py-1'>Support Ticket(s)</div>;
    //     },
    //     enableSorting: true,
    //     cell: ({ cell }: { cell: any }) => {
    //         return <div className='flex-center'>-</div>;
    //     }
    // }
];
