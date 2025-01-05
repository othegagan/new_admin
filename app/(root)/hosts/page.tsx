'use client';

import { Main } from '@/components/layout/main';
import PageHeader from '@/components/layout/page-header';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { DataTable } from '@/components/ui/data-table';
import { useHosts } from '@/hooks/useHostsAndEmployees';
import AddNewHostForm from './_components/AddNewHostForm';
import { columns } from './_components/columns';

export default function Page() {
    return (
        <Main fixed className='overflow-y-auto'>
            <div className='flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <PageHeader title='Hosts' description='List of all the hosts of the platform' />
                <AddNewHostForm />
            </div>

            <div className='my-4'>
                <HostTable />
            </div>
        </Main>
    );
}

function HostTable() {
    const { data: response, isLoading: loading, error } = useHosts();
    const allHostsList = response?.data?.userResponses;

    // const filterdHostsList = allHostsList?.filter((host: any) => host.email !== 'User Deleted' && host.email !== '');

    if (loading)
        return (
            <div className='flex h-full w-full flex-col items-center justify-center'>
                <CarLoadingSkeleton />
            </div>
        );

    if (error) return <div>Error: {error?.message}</div>;

    if (!response?.success) return <div>Error: {response?.message}</div>;

    if (allHostsList && allHostsList.length === 0) return <div>No hosts found.</div>;

    if (allHostsList && allHostsList.length > 0) return <DataTable columns={columns} data={allHostsList} sortBasedOn='email' />;
}
