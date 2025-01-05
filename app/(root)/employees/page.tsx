'use client';

import { Main } from '@/components/layout/main';
import PageHeader from '@/components/layout/page-header';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { DataTable } from '@/components/ui/data-table';
import { useEmployees } from '@/hooks/useHostsAndEmployees';
import AddNewEmployeeForm from './_components/AddNewEmployeeForm';
import { columns } from './_components/columns';

export default function Page() {
    return (
        <Main fixed className='overflow-y-auto'>
            <div className='flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <PageHeader title='Employees' description='List of all the employees under the host' />
                <AddNewEmployeeForm />
            </div>

            <div className='my-4'>
                <HostTable />
            </div>
        </Main>
    );
}

function HostTable() {
    const { data: response, isLoading: loading, error } = useEmployees();

    if (loading)
        return (
            <div className='flex h-full w-full flex-col items-center justify-center'>
                <CarLoadingSkeleton />
            </div>
        );

    if (error) return <div>Error: {error?.message}</div>;

    if (!response?.success) return <div>Error: {response?.message}</div>;

    const allEmployeesList = response?.data.userResponses;

    if (allEmployeesList && allEmployeesList?.length === 0) return <div>No Employees found.</div>;

    if (allEmployeesList && allEmployeesList?.length > 0)
        return <DataTable columns={columns} data={allEmployeesList} sortBasedOn='email' />;
}
