'use client';

import { CarLoadingSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { vehicleConfigTabsContent } from '@/constants';
import { useVehicleExpenseLogs, useVehicleRepairLogs } from '@/hooks/useVehicles';
import { ExpenseIcon, ServiceIcon } from '@/public/icons';
import { format } from 'date-fns';
import { CircleGauge, Paperclip } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import SubHeader from '../../_components/layout/subheader';
import AddExpenseForm from './_components/AddExpenseForm';
import AddServiceForm from './_components/AddServiceForm';
import { ServiceDetailsSheet } from './_components/log-details-sheet';

export default function MaintenancePage() {
    const { vehicleId } = useParams();

    const {
        data: expenseLogsResponse,
        isLoading: isLoadingExpenseLogs,
        error: errorExpenseLogs,
        refetch: refetchExpenseLogs
    } = useVehicleExpenseLogs(Number(vehicleId));

    const {
        data: serviceLogsResponse,
        isLoading: isLoadingServiceLogs,
        error: errorServiceLogs,
        refetch: refechServiceLogs
    } = useVehicleRepairLogs(Number(vehicleId));

    if (isLoadingExpenseLogs || isLoadingServiceLogs) {
        return <CarLoadingSkeleton />;
    }

    if (errorExpenseLogs || errorServiceLogs) {
        return <div>Error: {errorExpenseLogs?.message || errorServiceLogs?.message}</div>;
    }

    if (!expenseLogsResponse?.success || !serviceLogsResponse?.success) {
        return <div>Error: {expenseLogsResponse?.message || serviceLogsResponse?.message}</div>;
    }

    const expenseLogs = expenseLogsResponse?.data?.vehicleExpenseLogs || [];
    const serviceLogs = serviceLogsResponse?.data?.vehicleRepairLogs || [];

    const combineAndSortLogs = () => {
        // Parse `repairLogJson` and `expenseRepairLog`
        const repairs = serviceLogs.map((log: any) => ({
            ...log,
            details: JSON.parse(log.repairLogJson),
            type: 'repair'
        }));

        const expenses = expenseLogs.map((log: any) => ({
            ...log,
            details: JSON.parse(log.expenseRepairLog),
            type: 'expense'
        }));

        // Combine both logs
        const combinedLogs = [...repairs, ...expenses];

        // Sort by `updatedDate`
        combinedLogs.sort((a, b) => new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime());

        return combinedLogs;
    };

    const sortedLogs = combineAndSortLogs();

    return (
        <div className='flex w-full flex-col'>
            <div className=' flex flex-col gap-4 md:flex-between'>
                <SubHeader
                    title={vehicleConfigTabsContent.maintenance.title}
                    description={vehicleConfigTabsContent.maintenance.description}
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className='ml-auto w-fit' size='sm'>
                            Add Maintenance
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem className='p-0' asChild>
                            <AddServiceForm vehicleId={Number(vehicleId)} refechServiceLogs={refechServiceLogs} />
                        </DropdownMenuItem>
                        <DropdownMenuItem className='p-0' asChild>
                            <AddExpenseForm vehicleId={Number(vehicleId)} refetchExpenseLogs={refetchExpenseLogs} />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <LogsList logs={sortedLogs} />
        </div>
    );
}

function LogsList({ logs }: { logs: any[] }) {
    const [selectedService, setSelectedService] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const handleServiceClick = (log: any) => {
        // Map log details to the ServiceDetails interface

        setSelectedService(log);
        setSheetOpen(true);
    };

    return (
        <div className='mt-4 max-w-lg space-y-3'>
            {logs.map((log, index) => (
                <LogCard key={index} log={log} onClick={handleServiceClick} />
            ))}

            {selectedService && <ServiceDetailsSheet open={sheetOpen} onOpenChange={setSheetOpen} service={selectedService} />}
        </div>
    );
}

const LogCard = ({ log, onClick }: { log: any; onClick: (service: any) => void }) => {
    const isRepair = log.type === 'repair';

    return (
        <Card className='flex w-full gap-5 p-4 hover:cursor-pointer hover:bg-accent' onClick={() => onClick(log)}>
            <div className='flex size-14 items-center justify-center rounded-full border-2 border-primary'>
                {isRepair ? <ServiceIcon className='size-6' /> : <ExpenseIcon className='size-6' />}
            </div>
            <div className='flex flex-1 flex-col gap-1'>
                <div className='flex-between gap-4'>
                    <p>{log.details.typeOfService}</p>
                    <div className='font-semibold'>$ {log.details.cost}</div>
                </div>
                <div className='text-muted-foreground text-sm'>{format(new Date(log.details.dateTime), 'PP')}</div>
                <div className='flex-between gap-4'>
                    <div className='mt-2 flex-start gap-4'>
                        <CircleGauge className='size-4 text-muted-foreground' />
                        <div className='text-muted-foreground text-sm'>{log.details.odometer} mi</div>
                    </div>
                    <div className='mt-1 flex items-center gap-2 text-sm'>
                        {log.details.imageName ? (
                            <span className='flex items-center text-sm'>
                                <Paperclip className='mr-1 h-4 w-4 text-muted-foreground' /> 1
                            </span>
                        ) : (
                            ''
                        )}
                    </div>
                </div>
                {log.details.notes && (
                    <div className='mt-2 flex gap-2'>
                        <h4 className='font-bold text-muted-foreground text-sm '>Comments</h4>
                        <p className=' w-[150px] truncate text-muted-foreground text-sm'>{log.details.notes || 'No comments provided.'}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
