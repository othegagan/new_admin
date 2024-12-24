'use client';

import { Button } from '@/components/ui/button';
import { useAllNotifications } from '@/hooks/useNotifications';
import Link from 'next/link';

export function MessagesNotificationButton() {
    const { data: response, isLoading: loading, error } = useAllNotifications();
    const messageNotificationsData = response?.data?.messageNotifications || [];

    const countOfUnreadNotifications = messageNotificationsData.filter((notification: any) => !notification.viewed).length;

    return (
        <Link href='/messages'>
            <Button variant='ghost' className='relative px-2'>
                <svg
                    className='size-6 text-muted-foreground'
                    aria-hidden='true'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z'
                    />
                </svg>

                {countOfUnreadNotifications > 0 && (
                    <span className='absolute top-1 right-2 flex size-3'>
                        <span className='absolute inline-flex size-full rounded-full bg-primary ' />
                        <span className='relative inline-flex size-3 rounded-full bg-primary' />
                    </span>
                )}
            </Button>
        </Link>
    );
}
