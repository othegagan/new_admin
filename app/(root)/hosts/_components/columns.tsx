'use client';

import { Badge } from '@/components/ui/badge';
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
                    <div className='my-1 w-fit rounded-md bg-green-100 px-3 py-1 text-12 text-green-700'>Active</div>
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
                    <Badge>{cell?.getValue()}</Badge>
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
