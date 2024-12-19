'use client';

import React, { useState } from 'react';

import {
    type ColumnDef,
    type ColumnFiltersState,
    type FilterFn,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
//@ts-ignore
import { type RankingInfo, rankItem } from '@tanstack/match-sorter-utils';
import { Search, X } from 'lucide-react';

//@ts-ignore
declare module '@tanstack/table-core' {
    interface FilterFns {
        fuzzy: FilterFn<unknown>;
    }
    interface FilterMeta {
        itemRank: RankingInfo;
    }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value);

    // Store the itemRank info
    addMeta({
        itemRank
    });

    // Return if the item should be filtered in/out
    return itemRank.passed;
};

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    sortBasedOn?: string;
}

export function DataTable<TData, TValue>({ columns, data, sortBasedOn }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>(sortBasedOn ? [{ id: sortBasedOn, desc: false }] : []);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = useState<any>('');

    const table = useReactTable({
        data,
        columns,
        filterFns: {
            fuzzy: fuzzyFilter
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            globalFilter
        }
    });

    return (
        <div className='flex flex-col'>
            {/* search */}
            <div className='flex items-start py-4'>
                <DebouncedInput
                    placeholder='Search...'
                    value={globalFilter}
                    onChange={(value) => setGlobalFilter(value)}
                    className='max-w-sm'
                />
            </div>

            {/* table */}
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className='h-24 text-center'>
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* pagination */}
            <div className='flex flex-wrap items-center justify-between gap-4 space-x-2 py-4'>
                <div className='flex items-center gap-2'>
                    <p className='flex items-center gap-1 font-medium text-sm'>
                        Page
                        <strong>
                            {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                        </strong>
                    </p>
                    <span className='flex items-center gap-1 font-medium text-sm'>
                        | Go to page:
                        <Input
                            type='number'
                            min={'1'}
                            max={table.getPageCount()}
                            defaultValue={table.getState().pagination.pageIndex + 1}
                            onChange={(e) => {
                                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                table.setPageIndex(page);
                            }}
                            className='w-16 rounded border p-1'
                        />
                    </span>
                </div>
                <div className='flex items-center space-x-2'>
                    <p className='whitespace-nowrap font-medium text-sm'>Rows per page</p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value));
                        }}>
                        <SelectTrigger className='h-8 w-[70px]'>
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side='top' className='w-[70px]'>
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className=' flex items-center gap-3'>
                    <Button size='sm' onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
                        {'<<'}
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                            table.previousPage();
                        }}
                        disabled={!table.getCanPreviousPage()}>
                        Previous
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                            table.nextPage();
                        }}
                        disabled={!table.getCanNextPage()}>
                        Next
                    </Button>
                    <Button size='sm' onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
                        {'>>'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function DebouncedInput({
    value: initialValue,
    onChange,
    debounce = 300,
    ...props
}: {
    value: string | number;
    onChange: (value: string | number) => void;
    debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
    const [value, setValue] = React.useState(initialValue);

    React.useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            onChange(value);
        }, debounce);

        return () => clearTimeout(timeout);
    }, [value]);

    return (
        <div className='relative flex w-full items-center gap-2 md:w-[400px] lg:w-[500px]'>
            <Search className='absolute left-2 mr-2 size-4 text-muted-foreground' />
            <Input
                {...props}
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                }}
                type='text'
                placeholder='Search...'
                className='pl-8'
            />
            {value !== '' && (
                <X className='absolute right-2 mr-2 size-4 cursor-pointer text-muted-foreground' onClick={() => setValue('')} />
            )}
        </div>
    );
}
