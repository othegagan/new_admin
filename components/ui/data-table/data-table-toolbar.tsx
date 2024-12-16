'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { Table } from '@tanstack/react-table';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DownloadIcon, FileSpreadsheet, FileText, Settings2, X } from 'lucide-react';
import { parseAsString, useQueryState } from 'nuqs';
import * as XLSX from 'xlsx';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '../dropdown-menu';
import DataTableDeleteDialog from './data-table-delete-dialog';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    data: TData[];
    showExportOptions?: boolean;
    showViewOptions?: boolean;
    handleDelete?: (selectedRows: TData[]) => void;
}

export function DataTableToolbar<TData>({
    table,
    data,
    showExportOptions = true,
    showViewOptions = true,
    handleDelete
}: DataTableToolbarProps<TData>) {
    const [searchQuery, setSearchQuery] = useQueryState(
        tableSearchVariables.search,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );

    const handleSearch = (term: string) => {
        setSearchQuery(term);
        // Reset to first page when searching
        table.setPageIndex(0);
    };

    const handleReset = () => {
        setSearchQuery('');
        table.resetColumnFilters();
        table.resetColumnVisibility();
        table.resetSorting();
    };

    //find if any column is hiding
    const anyColumnHiding = table.getAllColumns().filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide());
    const handleExportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        XLSX.writeFile(wb, 'data.xlsx');
    };

    const handleExportToPDF = () => {
        const doc = new jsPDF();

        // Get visible columns
        const visibleColumns = table
            .getAllColumns()
            .filter((col) => col.getIsVisible())
            .map((col) => ({
                header: col.id.charAt(0).toUpperCase() + col.id.slice(1),
                dataKey: col.id
            }));

        // Prepare the data for PDF
        const tableData = data.map((item) => {
            const row: Record<string, any> = {};
            visibleColumns.forEach((col) => {
                row[col.dataKey] = (item as any)[col.dataKey]?.toString() || '';
            });
            return row;
        });

        // Generate PDF
        autoTable(doc, {
            columns: visibleColumns,
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            margin: { top: 20 }
        });

        doc.save('data.pdf');
    };

    const selectedRows = table.getSelectedRowModel().rows;

    function handleDeleteFn() {
        const selectedRowsData = selectedRows.map((row) => row.original);
        handleDelete?.(selectedRowsData);
        table.toggleAllPageRowsSelected(false);
    }

    function handleUnselectAll() {
        table.toggleAllPageRowsSelected(false);
    }

    return (
        <div className='flex w-full items-center justify-between gap-2 overflow-auto p-0.5'>
            <div className='flex items-center gap-2'>
                <Input
                    id='table-search-input'
                    onChange={(event) => handleSearch(event.target.value)}
                    className='h-8 w-40 lg:w-64'
                    placeholder='Search...'
                    value={searchQuery || ''}
                />
                {searchQuery && (
                    <Button onClick={handleReset} variant='ghost' suffix={<X className='h-4 w-4' />} className='h-8 w-fit'>
                        Reset
                    </Button>
                )}
            </div>
            <div className='flex items-center gap-2'>
                {selectedRows.length > 0 && (
                    <div className='flex-center gap-2'>
                        <Button onClick={handleUnselectAll} variant='ghost' suffix={<X className='h-4 w-4' />} className='h-8 w-fit'>
                            Reset
                        </Button>
                        <DataTableDeleteDialog selectedRows={selectedRows} deleteFn={handleDeleteFn} />
                    </div>
                )}

                {showExportOptions && table.getFilteredRowModel().rows.length > 0 && (
                    <div className='flex items-center gap-2'>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant='outline' size='sm' prefix={<DownloadIcon className='h-4 w-4' />} className='h-8 w-fit'>
                                    Export
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-[200px] p-2' align='end'>
                                <div className='flex flex-col gap-2'>
                                    <Button variant='ghost' className='w-full justify-start' onClick={handleExportToExcel}>
                                        <FileSpreadsheet className='mr-2 h-4 w-4 text-green-500' />
                                        Export as Excel
                                    </Button>
                                    <Button variant='ghost' className='w-full justify-start' onClick={handleExportToPDF}>
                                        <FileText className='mr-2 h-4 w-4 text-orange-500' />
                                        Export as PDF
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                {showViewOptions && anyColumnHiding.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant='outline'
                                size='sm'
                                prefix={<Settings2 className='h-4 w-4' />}
                                className='hidden h-8 w-fit sm:flex'>
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-[150px]'>
                            {table
                                .getAllColumns()
                                .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className='capitalize'
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}
