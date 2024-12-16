'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCommonPinningStyles, tableSearchVariables } from '@/lib/data-table.config';
import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import {
    type ColumnDef,
    type ColumnPinningState,
    type PaginationState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable
} from '@tanstack/react-table';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { DataTableSkeleton } from './data-table-skeleton';
import { DataTableToolbar } from './data-table-toolbar';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    totalItems: number;
    pageSizeOptions?: number[];
    isLoading?: boolean;
    showExportOptions?: boolean;
    showViewOptions?: boolean;
    columnPinning?: ColumnPinningState | undefined;
    handleDelete?: (selectedRows: TData[]) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    totalItems,
    pageSizeOptions = [10, 20, 30, 40, 50],
    isLoading,
    showExportOptions = true,
    showViewOptions = true,
    columnPinning,
    handleDelete
}: DataTableProps<TData, TValue>) {
    // Pagination state
    const [currentPage, setCurrentPage] = useQueryState(
        tableSearchVariables.page,
        parseAsInteger.withOptions({ shallow: false }).withDefault(1)
    );
    const [pageSize, setPageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false, history: 'push' }).withDefault(10)
    );

    // Sorting state
    const [sortBy] = useQueryState(tableSearchVariables.sort_column, parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [order] = useQueryState(
        tableSearchVariables.sort_direction,
        parseAsStringLiteral(['asc', 'desc'] as const)
            .withOptions({ shallow: false })
            .withDefault('asc')
    );

    // Search state
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withOptions({ shallow: false }).withDefault(''));

    const paginationState = {
        pageIndex: currentPage - 1,
        pageSize: pageSize
    };

    const pageCount = Math.ceil(totalItems / pageSize);

    const handlePaginationChange = (updaterOrValue: PaginationState | ((old: PaginationState) => PaginationState)) => {
        const pagination = typeof updaterOrValue === 'function' ? updaterOrValue(paginationState) : updaterOrValue;
        setCurrentPage(pagination.pageIndex + 1);
        setPageSize(pagination.pageSize);
    };

    const table = useReactTable({
        data,
        columns,
        pageCount: pageCount,
        state: {
            pagination: paginationState,
            sorting: sortBy ? [{ id: sortBy, desc: order === 'desc' }] : [],
            globalFilter: searchQuery
        },
        onPaginationChange: handlePaginationChange,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        initialState: {
            columnPinning: columnPinning || { right: ['actions'] }
        }
    });

    return (
        <div className='w-full space-y-2.5 overflow-auto'>
            {/* Toolbar with filters */}
            <DataTableToolbar
                table={table}
                data={data}
                showExportOptions={showExportOptions}
                showViewOptions={showViewOptions}
                handleDelete={handleDelete}
            />

            {/* Table and content */}
            {isLoading ? (
                <DataTableSkeleton
                    columnCount={5}
                    rowCount={10}
                    scrollAreaClassName='md:h-[calc(80dvh-220px)]'
                    showPagination={true}
                    showViewOptions={false}
                />
            ) : (
                <>
                    <div className='overflow-hidden rounded-md border'>
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead
                                                    className='w-fit'
                                                    key={header.id}
                                                    colSpan={header.colSpan}
                                                    style={{
                                                        ...getCommonPinningStyles({ column: header.column })
                                                    }}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                                                <TableCell
                                                    key={cell.id}
                                                    className='whitespace-nowrap'
                                                    style={{
                                                        ...getCommonPinningStyles({ column: cell.column })
                                                    }}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className='flex flex-col gap-2.5'>
                        <div className='flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8'>
                            {table.getFilteredSelectedRowModel().rows.length > 0 ? (
                                <div className='flex-1 whitespace-nowrap text-muted-foreground text-sm'>
                                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                                    selected.
                                </div>
                            ) : (
                                <div className='flex-1 whitespace-nowrap text-muted-foreground text-sm'>
                                    {totalItems > 0 ? (
                                        <>
                                            Showing {paginationState.pageIndex * paginationState.pageSize + 1} to{' '}
                                            {Math.min((paginationState.pageIndex + 1) * paginationState.pageSize, totalItems)} of{' '}
                                            {totalItems} entries
                                        </>
                                    ) : (
                                        'No entries found'
                                    )}
                                </div>
                            )}

                            {/* Rows per page */}
                            <div className='flex items-center space-x-2'>
                                <p className='whitespace-nowrap font-medium text-sm'>Rows per page</p>
                                <Select
                                    value={`${paginationState.pageSize}`}
                                    onValueChange={(value) => {
                                        table.setPageSize(Number(value));
                                    }}>
                                    <SelectTrigger className='h-8 w-[70px]'>
                                        <SelectValue placeholder={paginationState.pageSize} />
                                    </SelectTrigger>
                                    <SelectContent side='top'>
                                        {pageSizeOptions.map((pageSize) => (
                                            <SelectItem key={pageSize} value={`${pageSize}`}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Page Number */}
                            <div className='flex items-center justify-center text-nowrap font-medium text-sm'>
                                Page {paginationState.pageIndex + 1} of {table.getPageCount()}
                            </div>

                            {/* Pagination Buttons */}
                            <div className='flex items-center space-x-2'>
                                <Button
                                    aria-label='Go to first page'
                                    variant='outline'
                                    className='hidden h-8 w-8 p-0 lg:flex'
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}>
                                    <DoubleArrowLeftIcon className='h-4 w-4' aria-hidden='true' />
                                </Button>
                                <Button
                                    aria-label='Go to previous page'
                                    variant='outline'
                                    className='h-8 w-8 p-0'
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}>
                                    <ChevronLeftIcon className='h-4 w-4' aria-hidden='true' />
                                </Button>
                                <Button
                                    aria-label='Go to next page'
                                    variant='outline'
                                    className='h-8 w-8 p-0'
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}>
                                    <ChevronRightIcon className='h-4 w-4' aria-hidden='true' />
                                </Button>
                                <Button
                                    aria-label='Go to last page'
                                    variant='outline'
                                    className='hidden h-8 w-8 p-0 lg:flex'
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}>
                                    <DoubleArrowRightIcon className='h-4 w-4' aria-hidden='true' />
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
