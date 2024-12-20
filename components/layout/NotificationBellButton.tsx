'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PAGE_ROUTES } from '@/constants/routes';
import { useAllNotifications, useMarkNotificationAsRead } from '@/hooks/useNotifications';
import { toTitleCase } from '@/lib/utils';
import { BellIcon } from '@/public/icons';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export function NotificationBellButton() {
    const { data: response, isLoading: loading, error } = useAllNotifications();
    const notificationsData = response?.data?.inAppNotifications || [];

    const countOfUnreadNotifications = notificationsData.filter((notification: any) => !notification.viewed).length;

    const groupedNotifications = notificationsData.reduce((acc: any, notification: any) => {
        const date = new Date(notification.createdDate).toDateString();
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(notification);
        return acc;
    }, {});

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='relative px-2'>
                    <BellIcon className='size-6 text-muted-foreground' aria-hidden='true' />
                    {countOfUnreadNotifications > 0 && (
                        <span className='absolute top-1 right-2 flex size-3'>
                            <span className='absolute inline-flex size-full rounded-full bg-primary ' />
                            <span className='relative inline-flex size-3 rounded-full bg-primary' />
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className='flex h-full w-[330px] flex-col rounded-md shadow-lg md:w-[500px]'
                align='end'
                alignOffset={-100}>
                <div className='mt-1 flex justify-between gap-3 p-1'>
                    <p className='font-bold text-foreground text-sm'>Notifications</p>
                </div>

                {loading && (
                    <div className='flex h-20 w-full flex-col items-center justify-center gap-2 px-2'>Loading Notifications...</div>
                )}

                {!loading && error && <p className='flex h-20 w-full flex-col items-center justify-center gap-2 px-2'>{error.message}</p>}

                {!loading && !error && notificationsData.length === 0 && (
                    <div className='flex h-full w-full flex-1 flex-col gap-2 px-2'>
                        <p className='flex h-20 w-full flex-col items-center justify-center gap-2 px-2'>No notifications.</p>
                    </div>
                )}

                {!loading && !error && notificationsData.length > 0 && (
                    <ScrollArea className='flex h-[440px] w-[320px] select-none flex-col rounded-none border-1 p-1 md:w-full'>
                        {Object.keys(groupedNotifications).map((date: string) => (
                            <div key={date} className='mx-auto mb-2 max-w-5xl pt-1'>
                                <div className='sticky top-0 mb-2 flex items-center justify-between gap-4 bg-background'>
                                    <div className='h-1.5 w-full rounded-md bg-black/5' />
                                    <div className='w-fit whitespace-nowrap rounded-sm border border-black/20 bg-background p-3 py-1 text-center font-medium text-sm'>
                                        {format(new Date(date), 'eee PP')}
                                    </div>
                                    <div className='h-1.5 w-full rounded-md bg-black/5' />
                                </div>
                                {groupedNotifications[date].map((notification: any) => (
                                    <NotificationItem key={notification.id} data={notification} />
                                ))}
                            </div>
                        ))}
                    </ScrollArea>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function NotificationItem({ data }: { data: any }) {
    const router = useRouter();
    const { tripId, message, viewed, comments, createdDate } = data;
    const vehicleName = toTitleCase(`${data.branchResponses[0]?.make} ${data.branchResponses[0]?.model} ${data.branchResponses[0]?.year}`);
    const { mutate: markAsRead } = useMarkNotificationAsRead(data.id);

    const handleLinkClick = (e: { preventDefault: () => void }) => {
        e.preventDefault();
        markAsRead();

        router.push(`${PAGE_ROUTES.TRIPS}/${tripId}/details`); // Navigate to the details page after marking as read
    };

    return (
        <button
            type='button'
            className='my-2.5 flex w-full flex-col rounded-md border p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            onClick={handleLinkClick}>
            <div className='flex w-full flex-wrap items-center justify-between font-medium text-foreground text-sm'>
                <div className='flex items-center gap-2 font-medium text-12 capitalize md:text-14'>
                    {!viewed && <div className='size-2 rounded-full bg-primary' />}
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
                <Badge variant='outline' className='block font-medium text-[10px] md:hidden'>
                    Trip: {tripId}
                </Badge>
                <div className='ml-auto font-normal text-[11px] text-muted-foreground'>{format(new Date(createdDate), 'E, PP, p')}</div>
            </div>
        </button>
    );
}

// return (
//     <Link href='/notifications'>
//         <Button variant='ghost' className='relative px-2'>
//             <BellIcon className='size-7 md:size-6 text-neutral-600 group-hover:text-neutral-800' aria-hidden='true' />
//             <span className='absolute right-2 top-1 flex size-3'>
//                 {ping && <span className='absolute inline-flex size-full animate-ping rounded-full bg-orange-500' />}
//                 <span className='relative inline-flex size-3 rounded-full bg-primary' />
//             </span>
//         </Button>
//     </Link>
// );
