'use client';
import { Button } from '@/components/ui/button';
import useChat from '@/hooks/useChat';
import { useTripDetails } from '@/hooks/useTrips';
import { auth } from '@/lib/firebase';
import { formatDateAndTime, getFullAddress } from '@/lib/utils';
import type { Trip } from '@/types';
import { format } from 'date-fns';
import { Paperclip, Send } from 'lucide-react';
import { type Key, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface MainMessageComponentProps {
    tripId: number;
    className?: string;
}

const AUTHOR_TYPE = {
    SYSTEM: 'system',
    HOST: 'HOST',
    CLIENT: 'CLIENT'
};

// Custom hook for authentication token
const useAuthToken = () => {
    const [token, setToken] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const idToken = await user.getIdToken();
                    setToken(idToken);
                } catch (error) {
                    console.error('Error retrieving token:', error);
                    toast.error('Failed to retrieve token. Please reload the page and try again.');
                }
            } else {
                setToken('');
            }
        });

        return () => unsubscribe();
    }, []);

    return token;
};

interface ErrorType {
    message?: string;
}

const isError = (value: unknown): value is ErrorType => {
    return typeof value === 'object' && value !== null && 'message' in value;
};

export default function MainMessageComponent({ tripId, className }: MainMessageComponentProps) {
    const token = useAuthToken();
    const chatWindowRef = useRef(null);

    const { inputMessage, setInputMessage, sendMessageMutation, messageList, loadingMessages, messageError } = useChat(tripId, token);

    const { data: response, isLoading: loadingBookingDetails, error } = useTripDetails(tripId);
    const tripData = response?.data?.activetripresponse[0];

    // Handle sending a message
    const handleSendMessage = (event: { preventDefault: () => void }) => {
        event.preventDefault();
        sendMessageMutation.mutate();
    };

    // Scroll chat window to bottom
    const scrollToBottom = () => {
        if (chatWindowRef.current) {
            //@ts-ignore
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    };

    // Effect hooks for scrolling
    useEffect(scrollToBottom, [messageList]);
    useEffect(scrollToBottom, [sendMessageMutation.isPending]);
    useEffect(scrollToBottom, []);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            // Reset height to auto to shrink the textarea when text is removed
            textareaRef.current.style.height = 'auto';
            // Adjust the height based on the scroll height (content size)
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputMessage]);

    return (
        <div className='flex flex-1 flex-col gap-2 rounded-md md:px-4 md:pt-0 md:pb-4'>
            <div className='flex size-full flex-1'>
                <div className='chat-text-container -mr-4 relative flex flex-1 flex-col overflow-y-hidden'>
                    <div
                        className='chat-flex flex h-40 w-full flex-grow flex-col justify-start gap-4 overflow-y-auto py-2 pr-4 pb-4'
                        ref={chatWindowRef}>
                        {loadingMessages || loadingBookingDetails ? (
                            <div className='flex h-full w-full items-center justify-center'>Loading messages...</div>
                        ) : (
                            <>
                                {(() => {
                                    if (error || messageError || !response?.success) {
                                        const errorMessage =
                                            (isError(error) && error.message) ||
                                            (isError(messageError) && messageError.message) ||
                                            response?.message ||
                                            'An unknown error occurred.';
                                        return <div className='text-red-500'>Error: {errorMessage}</div>;
                                    }
                                    return null;
                                })()}

                                {messageList.map((message: any, index: Key | null | undefined) => (
                                    <MessageItem key={index} message={message} tripData={tripData} />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Textbox and send */}
            <form className='flex w-full flex-none gap-2' onSubmit={handleSendMessage}>
                <div className='flex flex-1 items-center gap-2 rounded-md border border-input px-2 py-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring lg:gap-4'>
                    <Button variant='ghost' size='icon' className='w-fit'>
                        <Paperclip className='size-5' />
                    </Button>
                    <label className='flex-1'>
                        <span className='sr-only'>Chat Text Box</span>

                        <textarea
                            ref={textareaRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder='Type your message...'
                            className='flex max-h-20 w-full overflow-y-auto bg-inherit text-md focus-visible:outline-none'
                            rows={1}
                            style={{ overflow: 'hidden' }} // Prevent scrollbars from appearing
                        />
                    </label>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='w-fit px-2'
                        type='submit'
                        disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                        loading={sendMessageMutation.isPending}
                        suffix={<Send className='size-5' />}>
                        <span className='sr-only'>Send</span>
                    </Button>
                </div>
            </form>
        </div>
    );
}

function MessageItem({
    message,
    tripData
}: {
    message: any;
    tripData: Trip;
}) {
    const authorImage = {
        [AUTHOR_TYPE.SYSTEM]: '/images/robot.png',
        [AUTHOR_TYPE.HOST]: tripData.hostImage || '/images/dummy_avatar.png',
        [AUTHOR_TYPE.CLIENT]: tripData.userImage || '/images/dummy_avatar.png'
    };

    const isClientMessage = message.author === AUTHOR_TYPE.CLIENT;

    const isHostMessage = message.author === AUTHOR_TYPE.HOST;

    // const images = tripData?.vehicleImages;

    if (isClientMessage) {
        return (
            <div className='flex'>
                {message.author !== AUTHOR_TYPE.HOST && (
                    <img
                        src={authorImage[message.author]}
                        alt={message.author}
                        width={32}
                        height={32}
                        className='mr-2 size-8 rounded-full border object-cover object-center'
                    />
                )}

                <div className='flex flex-col gap-2 rounded-lg rounded-tl-none bg-[#E1EFFE] px-3 py-2 font-medium text-sm dark:bg-[#2e4161]'>
                    {message.message}
                    <p className='flex items-center justify-end text-[10px] text-muted-foreground'>
                        {format(new Date(message.deliveryDate), 'PP | hh:mm a')}
                    </p>
                </div>
            </div>
        );
    }

    if (isHostMessage) {
        return (
            <div className='ml-auto flex w-max max-w-[75%] flex-col gap-2 rounded-lg rounded-br-none bg-primary/40 px-3 py-2 font-medium text-sm'>
                {message?.message}
                <p className='flex items-center justify-end text-[10px]'> {format(new Date(message.deliveryDate), 'PP | hh:mm a')}</p>
            </div>
        );
    }

    return (
        <div className='flex'>
            {message.author !== AUTHOR_TYPE.CLIENT && (
                <img
                    src={authorImage[message.author]}
                    alt={message.author}
                    width={32}
                    height={32}
                    className='mr-2 size-8 rounded-full border'
                />
            )}

            {message.message.toLocaleLowerCase() === 'a new reservation was requested' ? (
                <div className='flex flex-col gap-2 rounded-lg bg-muted px-3 py-2 text-sm'>
                    <span>{message.message}</span>
                    {/*
                    {images.length > 0 ? (
                        <div className='relative max-w-md sm:overflow-hidden md:max-w-lg md:rounded-lg'>
                            <EmblaCarousel slides={images} />
                        </div>
                    ) : (
                        <div className='embla__slide max-h-80 max-w-md overflow-hidden md:rounded-md'>
                            <img
                                src='../images/image_not_available.png'
                                alt='image_not_found'
                                className='h-full w-full min-w-full object-cover md:rounded-md'
                            />
                        </div>
                    )} */}

                    <p className='font-semibold text-16 capitalize'>
                        {tripData?.vehmake} {tripData?.vehmodel} {tripData?.vehyear}
                    </p>

                    <div className='text-12'>
                        Start Date :<span className='font-medium '> {formatDateAndTime(tripData?.starttime, tripData?.vehzipcode)}</span>
                    </div>

                    <div className='text-12'>
                        End Date : <span className='font-medium '> {formatDateAndTime(tripData?.endtime, tripData?.vehzipcode)}</span>
                    </div>

                    <div className='text-12'>
                        Pickup & Return :<span className='font-medium capitalize'> {getFullAddress({ tripDetails: tripData })}</span>
                    </div>

                    <p className='flex items-center justify-end text-[10px] text-muted-foreground'>
                        {format(new Date(message.deliveryDate), 'PP | hh:mm a')}
                    </p>
                </div>
            ) : (
                <div className='flex flex-col gap-2 rounded-lg rounded-tl-none bg-muted px-3 py-2 font-medium text-sm'>
                    {message.message}
                    <p className='flex items-center justify-end text-[10px] text-muted-foreground'>
                        {format(new Date(message.deliveryDate), 'PP | hh:mm a')}
                    </p>
                </div>
            )}
        </div>
    );
}
