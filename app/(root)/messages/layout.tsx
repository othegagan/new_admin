'use client';

import { Main } from '@/components/layout/main';
import { CarLoadingSkeleton } from '@/components/skeletons';
import { useAllNotifications } from '@/hooks/useNotifications';
import type { ReactNode } from 'react';
import MessagesList from './_components/MessagesList';

export default function MessagesLayout({ children }: { children: ReactNode }) {
    const { data: response, isLoading: loading, error } = useAllNotifications();

    if (loading)
        return (
            <div className=' flex h-full w-full items-center justify-center'>
                <CarLoadingSkeleton />
            </div>
        );

    if (error) return <div className=' flex h-full w-full items-center justify-center'>Error: {error.message}</div>;

    if (!response?.success) return <div className=' flex h-full w-full items-center justify-center'>Error: {response?.message}</div>;

    const messageNotificationsData = response?.data?.messageNotifications || [];

    if (messageNotificationsData.length === 0) return <div className='flex h-full w-full items-center justify-center'>No messages</div>;

    return (
        <Main fixed className='h-full'>
            <section className='flex h-full gap-6'>
                <MessagesList />

                {children}
            </section>
        </Main>
    );
}

// export default function MessageDetail({ params }: { params: Promise<{ id: string }> }) {
//     const { id } = use(params);
