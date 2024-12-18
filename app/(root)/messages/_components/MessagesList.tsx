'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { PAGE_ROUTES } from '@/constants/routes';
import { useAllNotifications, useMarkMessageNotificationAsRead } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Fuse from 'fuse.js';
import { usePathname, useRouter } from 'next/navigation';
import { forwardRef, useEffect, useRef, useState } from 'react';

export default function MessagesList() {
    const pathname = usePathname();
    const showMobileDetail = pathname !== PAGE_ROUTES.MESSAGES;

    const { data: response, isLoading: loading, error } = useAllNotifications();
    const messageNotificationsData = response?.data?.messageNotifications || [];

    if (loading) return <div className='block'>Loading...</div>;

    if (error) return <div>Error: {error.message}</div>;

    if (!response?.success) return <div>Error: {response?.message}</div>;

    const modifiedMessageNotificationsData = messageNotificationsData?.sort(
        (a: any, b: any) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    );

    return (
        <div className={`h-full w-full flex-none sm:w-56 lg:w-72 2xl:w-80 ${showMobileDetail ? 'hidden sm:block' : 'block'}`}>
            <FilterMessageList messageNotificatonsData={modifiedMessageNotificationsData} />
        </div>
    );
}

function FilterMessageList({
    messageNotificatonsData
}: {
    messageNotificatonsData: any;
}) {
    const pathname = usePathname();

    const selectedMessageRef = useRef<HTMLDivElement | null>(null);
    const messageListRef = useRef<HTMLDivElement | null>(null); // Ref for the message list container

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMessageNotificationsData, setFilteredMessageNotificationsData] = useState(messageNotificatonsData);

    // Fuse.js setup
    const fuse = new Fuse(messageNotificatonsData, {
        keys: [
            'tripId',
            'message',
            'firstname',
            'lastname',
            'branchResponses.vehicleNumber',
            'branchResponses.make',
            'branchResponses.model',
            'branchResponses.year'
        ],
        threshold: 0.4,
        distance: 300,
        minMatchCharLength: 2,
        shouldSort: false,
        includeScore: true,
        useExtendedSearch: true,
        ignoreLocation: true,
        findAllMatches: true,
        isCaseSensitive: false
    });

    const getSelectedTripId = () => {
        const idMatch = pathname.match(/\/messages\/(\d+)/);
        return idMatch ? idMatch[1] : null;
    };

    const selectedTripId = getSelectedTripId();

    // Scroll to the selected card when it changes
    useEffect(() => {
        if (selectedMessageRef.current) {
            selectedMessageRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [selectedTripId, filteredMessageNotificationsData]);

    // Filter messages based on search term using Fuse.js
    useEffect(() => {
        const filtered = searchTerm
            ? fuse
                  .search(searchTerm)
                  .map((result: any) => result.item) // Fuzzy search with Fuse.js
            : messageNotificatonsData;

        setFilteredMessageNotificationsData(filtered);

        // Scroll to the top of the message list container whenever a search is performed
        if (messageListRef.current && searchTerm.length > 2) {
            messageListRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    }, [searchTerm, messageNotificatonsData]); // Depend on searchTerm and messageNotificatonsData

    return (
        <>
            {/* Header */}
            <div className='-mx-4 sticky top-0 z-10 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
                <h3>Messages</h3>
                {/* Search bar */}
                <div className='p-3 pl-0'>
                    <SearchInput
                        placeholder='Search by guest name, vehicle, trip ID'
                        className='w-full'
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                </div>
            </div>

            {/* Conversation list */}
            <div ref={messageListRef} className='h-[calc(100svh-200px)] overflow-y-auto overflow-x-hidden pt-2 '>
                {filteredMessageNotificationsData.map((notification: any) => (
                    <MessageItem
                        key={notification.id}
                        data={notification}
                        isSelected={notification.tripId.toString() === selectedTripId}
                        ref={notification.tripId.toString() === selectedTripId ? selectedMessageRef : null}
                    />
                ))}
            </div>
        </>
    );
}

const MessageItem = forwardRef<HTMLDivElement, { data: any; isSelected: boolean }>(({ data, isSelected }, ref) => {
    const router = useRouter();
    const { tripId, message, isViewed, createdDate } = data;

    // const vehicleName = toTitleCase(`${data.branchResponses[0]?.make} ${data.branchResponses[0]?.model} ${data.branchResponses[0]?.year}`);
    const plate = `${data.branchResponses[0]?.vehicleNumber}`;
    const driverName = `${data.userResponses[0]?.firstname} ${data.userResponses[0]?.lastname}`;
    const driverImage = `${data.userResponses[0]?.userimage}`;
    const notificationDate = `${formatDistanceToNow(new Date(createdDate), { includeSeconds: false })} ago`;

    const { mutate: markAsRead } = useMarkMessageNotificationAsRead(tripId);

    useEffect(() => {
        // Check if the message is selected and mark it as read
        if (isSelected) {
            markAsRead();
        }
    }, [isSelected, markAsRead]); // Re-run effect if `isSelected` or `markAsRead` changes

    const handleLinkClick = () => {
        markAsRead();
        router.push(`/messages/${tripId}`); // Navigate to the details page after marking as read
    };

    return (
        <div
            key={data.id}
            onClick={handleLinkClick}
            ref={ref}
            className={cn(
                'block w-full cursor-pointer border-b py-4 hover:rounded-md hover:bg-muted',
                isSelected ? 'rounded-md border border-primary bg-muted px-3' : ''
            )}>
            <div className='flex items-center space-x-2'>
                <div className='relative'>
                    {/* Dot Indicator */}
                    {!isViewed && <div className='absolute top-0 right-0 z-10 size-3 rounded-full bg-primary' />}

                    {/* Avatar Component */}
                    <Avatar className='h-12 w-12 border'>
                        <AvatarImage src={driverImage} alt={driverName} />
                        <AvatarFallback>{driverName[0]}</AvatarFallback>
                    </Avatar>
                </div>

                <div>
                    <h3 className='max-w-[280px] truncate text-left font-semibold text-lg'>{driverName}</h3>
                    <p className='max-w-[280px] truncate text-left text-muted-foreground text-sm'>{message}</p>
                </div>
            </div>
            <div className='mt-2.5 flex w-full items-center justify-between space-x-2 pr-3'>
                <Badge variant='secondary'>
                    Trip: {tripId} - {plate}
                </Badge>
                <span className='text-muted-foreground text-sm'>{notificationDate}</span>
            </div>
        </div>
    );
});
