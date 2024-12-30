'use client';

import { Main } from '@/components/layout/main';
import PageHeader from '@/components/layout/page-header';
import { DataTable } from '@/components/ui/data-table';
import { useAllGuestsOfHost } from '@/hooks/useGuests';
import { guestsColumns } from './_components/columns';

export default function GuestsPage() {
    return (
        <Main fixed className='overflow-y-auto'>
            <div className='flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <PageHeader title='Guests' description='List of all the guests under the host' />
            </div>

            <div className='my-4'>
                <GuestsTable />
            </div>
        </Main>
    );
}

function GuestsTable() {
    const { data: response, isLoading: loading, error } = useAllGuestsOfHost();

    if (loading) return <div>Loading...</div>;

    if (error) return <div>Error: {error?.message}</div>;

    if (!response?.success) return <div>Error: {response?.message}</div>;

    const allGuestsOfHost = response?.data?.userTripDetails || [];

    if (allGuestsOfHost && allGuestsOfHost.length === 0) return <div>No Drivers found.</div>;

    if (allGuestsOfHost && allGuestsOfHost.length > 0) return <DataTable columns={guestsColumns} data={allGuestsOfHost} />;
}
