'use client';

import { Button } from '@/components/ui/button';
import { vehicleConfigTabsContent } from '@/constants';
import { useVehicleExpenseLogs } from '@/hooks/useVehicles';
import { useParams } from 'next/navigation';
import SubHeader from '../../_components/layout/subheader';

export default function MaintenancePage() {
    const { vehicleId } = useParams();

    const {
        data: expenseLogsResponse,
        isLoading: isLoadingExpenseLogs,
        error: errorExpenseLogs
    } = useVehicleExpenseLogs(Number(vehicleId));

    if (isLoadingExpenseLogs) {
        return <div>Loading...</div>;
    }

    if (errorExpenseLogs) {
        return <div>Error: {errorExpenseLogs.message}</div>;
    }

    if (!expenseLogsResponse?.success) {
        return <div>Error: {expenseLogsResponse?.message}</div>;
    }

    const expenseLogs: string = expenseLogsResponse?.data?.vehicleExpenseLogs || [];

    return (
        <div className='flex w-full flex-col'>
            <div className='flex w-full flex-col flex-wrap gap-4 md:flex-row '>
                <SubHeader
                    title={vehicleConfigTabsContent.maintenance.title}
                    description={vehicleConfigTabsContent.maintenance.description}
                />
                <Button>Add Maintenance</Button>
            </div>
        </div>
    );
}
