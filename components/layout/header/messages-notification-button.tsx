'use client';

import { PAGE_ROUTES } from '@/constants/routes';
import { useAllMessageNotifications } from '@/hooks/useNotifications';
import Link from 'next/link';

export function MessagesNotificationButton() {
    const { data: response } = useAllMessageNotifications();
    const messageNotificationsData = response?.data?.messageNotifications || [];

    const countOfUnreadNotifications = messageNotificationsData.filter((notification: any) => !notification.isViewed).length;

    return (
        <Link href={PAGE_ROUTES.MESSAGES} prefetch={false}>
            <div className='group relative inline-flex h-9 w-full cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap text-nowrap rounded-full px-2 py-2 font-medium text-sm transition-all duration-300 ease-linear hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring active:scale-95 disabled:pointer-events-none md:w-fit'>
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
            </div>
        </Link>
    );
}
