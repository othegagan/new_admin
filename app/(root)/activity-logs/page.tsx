'use client';

import { Main } from '@/components/layout/main';
import PageHeader from '@/components/layout/page-header';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import ActivityLogs from './activity-logs';

export default function ActivityLogsPage() {
    return (
        <Main fixed className='h-full overflow-y-auto'>
            <div className='flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <PageHeader title='Activity Logs' description='Review all recent actions performed on your account.' />
            </div>

            <div className='my-4 h-full'>
                <MainContent />
            </div>
        </Main>
    );
}

function MainContent() {
    const { data: response, isLoading, isError, error } = useActivityLogs();

    if (isLoading) {
        return <CarLoadingSkeleton />;
    }

    if (isError) {
        return <div>Error: {error.message}</div>;
    }

    if (!response?.success) {
        return <div>Error: {response?.message}</div>;
    }

    const allActivityLogs = response?.data?.activityLogs || [];
    const users = response?.data?.userResponses || [];

    if (allActivityLogs.length === 0 || users.length === 0) {
        return (
            <div className='flex h-[calc(100dvh_-_300px)] w-full flex-col items-center justify-center'>
                <img src='/images/car_loading_2.gif' className='h-auto w-48 opacity-50 dark:invert' alt='Loading...' />
                <h3 className='mt-6 text-center text-muted-foreground'>No activity.</h3>
            </div>
        );
    }

    return <ActivityLogs activityLogs={allActivityLogs} users={users} />;
}
