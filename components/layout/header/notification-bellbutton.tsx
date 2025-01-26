'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PAGE_ROUTES } from '@/constants/routes';
import { useCheckNotifications, useMarkNotificationAsRead, usePaginatedNotifications } from '@/hooks/useNotifications';
import { toTitleCase } from '@/lib/utils';
import { BellIcon } from '@/public/icons';
import { markAllNotificationAsRead } from '@/server/notifications';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { type Key, useEffect, useRef } from 'react';

export function NotificationBellButton() {
    const { data: checkNotificationsData } = useCheckNotifications();
    const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, error, refetch } = usePaginatedNotifications();

    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollPositionRef = useRef<number>(0); // Track scroll position

    const unReadNotifications = checkNotificationsData?.data?.hasNotification;

    const handleScroll = () => {
        if (!scrollRef.current || isLoading || !hasNextPage) return;

        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            fetchNextPage(); // Fetch the next page when the user scrolls near the bottom
        }

        // Save the current scroll position
        scrollPositionRef.current = scrollTop;
    };

    const notifications = data?.pages.flatMap((page) => page.inAppNotifications) || [];

    const groupedNotifications = notifications.reduce((acc: any, notification: any) => {
        const date = new Date(notification.createdDate).toDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(notification);
        return acc;
    }, {});

    async function handleMarkAllNotificationAsRead() {
        await markAllNotificationAsRead();
        refetch();
    }

    // Restore scroll position after re-render
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollPositionRef.current;
        }
    }, [notifications]); // Restore scroll position when notifications change

    return (
        <DropdownMenu
            onOpenChange={(isOpen) => {
                if (isOpen) {
                    refetch();
                }
            }}>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative ml-0 px-2'>
                    <BellIcon className='size-6 text-muted-foreground' />
                    {unReadNotifications && (
                        <span className='absolute top-1 right-2 flex size-3'>
                            <span className='absolute inline-flex size-full rounded-full bg-primary ' />
                            <span className='relative inline-flex size-3 rounded-full bg-primary' />
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className='flex h-full w-[330px] flex-col rounded-md drop-shadow-xl md:w-[500px]'
                align='end'
                alignOffset={-100}>
                <div className='mt-1 flex justify-between gap-3 p-1'>
                    <p className='font-bold text-foreground text-sm'>Notifications</p>
                    {unReadNotifications && (
                        <button type='button' className='relative px-2 text-[12px]' onClick={handleMarkAllNotificationAsRead}>
                            Mark All as Read
                        </button>
                    )}
                </div>

                {isLoading && !isFetchingNextPage && (
                    <div className='flex h-20 w-full flex-col items-center justify-center gap-2 px-2 text-muted-foreground text-sm'>
                        Loading Notifications...
                    </div>
                )}

                {error && <div className='flex h-20 items-center justify-center'>{error.message}</div>}

                {!isLoading && !error && notifications.length === 0 && (
                    <div className='flex h-20 items-center justify-center'>No notifications found.</div>
                )}

                {!error && notifications.length > 0 && (
                    <div
                        ref={scrollRef}
                        onScroll={handleScroll}
                        className='flex h-[400px] select-none flex-col overflow-y-auto rounded-none border-1 md:w-full'>
                        {Object.keys(groupedNotifications).map((date: string, index: Key | null | undefined) => (
                            <div key={index} className='mb-2 max-w-5xl pt-1'>
                                <div className='sticky top-0 mb-2 flex items-center justify-between gap-4 bg-background'>
                                    <div className='h-1.5 w-full rounded-md bg-black/5' />
                                    <div className='w-fit whitespace-nowrap rounded-sm border border-black/20 bg-background p-3 py-1 text-center font-medium text-xs'>
                                        {format(new Date(date), 'eee PP')}
                                    </div>
                                    <div className='h-1.5 w-full rounded-md bg-black/5' />
                                </div>
                                {groupedNotifications[date].map((notification: any, index: Key | null | undefined) => (
                                    <NotificationItem key={index} data={notification} />
                                ))}
                            </div>
                        ))}

                        {isFetchingNextPage && (
                            <div className='my-5 flex h-20 w-full flex-col items-center justify-center gap-2 px-2 text-muted-foreground text-sm'>
                                Loading More...
                            </div>
                        )}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function NotificationItem({ data }: { data: any }) {
    const router = useRouter();
    const { tripId, message, viewed, createdDate } = data;
    const vehicleName = toTitleCase(`${data.branchResponses[0]?.make} ${data.branchResponses[0]?.model} ${data.branchResponses[0]?.year}`);
    const { mutate: markAsRead } = useMarkNotificationAsRead(data.id);

    const handleLinkClick = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        markAsRead();

        router.push(`${PAGE_ROUTES.TRIP_DETAILS}/${tripId}`); // Navigate to the details page after marking as read
    };

    return (
        <button
            type='button'
            className='my-2.5 flex w-full flex-col rounded-md border p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            onClick={handleLinkClick}>
            <div className='flex w-full flex-wrap items-center justify-between font-medium text-foreground text-sm'>
                <div className='flex gap-2 text-left font-medium text-12 capitalize md:text-14'>
                    {!viewed && <div className='mt-1 size-2 rounded-full bg-primary' />}
                    {`${message}. `}
                </div>
                <Badge variant='secondary' className='hidden border font-medium text-[10px] md:block'>
                    Trip: {tripId}
                </Badge>
            </div>
            {/* {comments && <p className='mt-2 font-normal text-muted-foreground text-xs'>Comments: {comments}</p>} */}
            <div className='mt-2 flex w-full flex-wrap items-center gap-2'>
                <div className='font-semibold text-muted-foreground text-xs'>
                    {vehicleName} ({data.branchResponses[0]?.vehicleNumber})
                </div>
                <Badge variant='outline' className='block font-medium text-[12px] md:hidden'>
                    Trip: {tripId}
                </Badge>
                <div className='ml-auto font-normal text-[11px] text-muted-foreground'>{format(new Date(createdDate), 'E, PP, p')}</div>
            </div>
        </button>
    );
}
