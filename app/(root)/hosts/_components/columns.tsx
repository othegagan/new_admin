'use client';

import { Button } from '@/components/ui/button';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronsUpDown } from 'lucide-react';
import type { User } from 'next-auth';
import DisableHostForm from './DisableHostForm';
import UpdateHostForm from './UpdateHostForm';

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'firstName',
        header: () => {
            return null;
        },
        cell: () => {
            return null;
        }
    },
    {
        accessorKey: 'lastName',
        header: () => {
            return null;
        },
        cell: () => {
            return null;
        }
    },
    {
        accessorKey: 'iduser',
        header: ({ column }) => (
            <div className='flex-center py-1'>
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    ID
                    <ChevronsUpDown className='ml-2 size-3' />
                </Button>
            </div>
        ),
        enableSorting: true,
        cell: ({ cell }: { cell: any }) => {
            return <div className='flex-center'>{cell?.getValue()}</div>;
        }
    },
    {
        accessorKey: 'email',
        header: ({ column }) => (
            <div className='flex-start py-1'>
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Email
                    <ChevronsUpDown className='ml-2 size-3' />
                </Button>
            </div>
        ),
        enableSorting: true,
        cell: ({ cell }: { cell: any }) => {
            return <div className='flex-start'>{cell?.getValue()}</div>;
        }
    },
    {
        accessorFn: (row) => `${row.firstname || ''} ${row.lastname || ''}`.trim(),
        id: 'fullName',
        header: ({ column }) => (
            <div className='flex-start py-1'>
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Full Name
                    <ChevronsUpDown className='ml-2 size-3' />
                </Button>
            </div>
        ),
        enableSorting: true,
        cell: ({ cell }: { cell: any }) => {
            return <div className='flex-start'>{cell?.getValue() || '-'}</div>;
        }
    },

    {
        accessorKey: 'mobilephone',
        header: ({ column }) => (
            <div className='flex-start py-1'>
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Phone
                    <ChevronsUpDown className='ml-2 size-3' />
                </Button>
            </div>
        ),
        enableSorting: true,
        cell: ({ cell }: { cell: any }) => {
            return <div className='flex-start'>{cell?.getValue() || '-'}</div>;
        }
    },

    {
        accessorKey: 'isactive',
        header: ({ column }) => (
            <div className='flex-start py-1'>
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Status
                    <ChevronsUpDown className='ml-2 size-3' />
                </Button>
            </div>
        ),
        cell: ({ cell }) => {
            return cell.getValue() ? (
                <div className='flex-start'>
                    <div className='my-1 w-fit rounded-md bg-[#C4F891] px-3 py-1 text-12 dark:bg-[#113019]'>Active</div>
                </div>
            ) : (
                <div className='flex-start'>
                    <div className='my-1 w-fit rounded-md bg-red-100 px-3 py-1 text-12 text-red-700'>Disabled</div>
                </div>
            );
        },
        enableSorting: true
    },

    {
        accessorKey: 'channelName',
        header: ({ column }) => (
            <div className='flex-center py-1'>
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Channel Name
                    <ChevronsUpDown className='ml-2 size-3' />
                </Button>
            </div>
        ),
        enableSorting: true,
        cell: ({ cell }: { cell: any }) => {
            return (
                <div className='flex-center'>
                    <ChannelBadge channelName={cell?.getValue()} />
                </div>
            );
        }
    },

    {
        header: 'Actions',
        accessorFn: (row: any) => {
            return row;
        },
        enableSorting: false,
        cell: ({ cell }: { cell: any }) => {
            return (
                <div className='flex-start gap-2'>
                    <UpdateHostForm cell={cell} />
                    <DisableHostForm cell={cell} />
                </div>
            );
        }
    }
];

function ChannelBadge({ channelName }: { channelName: string }) {
    const channelClasses: { [key: string]: string } = {
        bundee: 'bg-primary text-white dark:bg-orange-800 dark:text-orange-100',
        flux: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
        turo: 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
        default: 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
    };

    const channelClass = channelClasses[channelName.toLowerCase()] || channelClasses.default;

    return (
        <span
            className={`inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1 font-medium text-12 capitalize ${channelClass}`}>
            {channelName}
        </span>
    );
}
