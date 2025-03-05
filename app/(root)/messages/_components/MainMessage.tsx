'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ImagePreview from '@/components/ui/image-preview';
import { CHANNELS, CHAT_CREATE_RESERVATION_MESSAGE, CHAT_TRIP_APPROVAL_MESSAGE, getTuroVehicleLink } from '@/constants';
import { env } from '@/env';
import useChat from '@/hooks/useChat';
import { useTripDetails } from '@/hooks/useTrips';
import { formatDateAndTime, getFullAddress } from '@/lib/utils';
import type { Trip } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Paperclip, Send, X } from 'lucide-react';
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

interface ErrorType {
    message?: string;
}

interface MessageItemProps {
    message: any;
    tripData: Trip;
    turoId?: string | number | null;
}

const isError = (value: unknown): value is ErrorType => {
    return typeof value === 'object' && value !== null && 'message' in value;
};

export default function MainMessageComponent({ tripId }: MainMessageComponentProps) {
    const chatWindowRef = useRef(null);
    const queryClient = useQueryClient();

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const { inputMessage, setInputMessage, messageList, loadingMessages, messageError } = useChat(tripId);

    const { data: response, isLoading: loadingBookingDetails, error } = useTripDetails(tripId);
    const tripData = response?.data?.activetripresponse[0];

    const turoVehicleId =
        tripData?.vehicleBusinessConstraints
            ?.filter(
                (constraint: { constraintName: string; constraintValueObject: any[] }) =>
                    constraint.constraintName === 'VehicleConstraintLink' &&
                    constraint.constraintValueObject.some((obj) =>
                        obj.constraintValue.some((value: { channelName: string }) => value.channelName === 'Turo')
                    )
            )
            ?.flatMap((constraint: { constraintValueObject: any[] }) =>
                constraint.constraintValueObject.flatMap((obj) =>
                    obj.constraintValue
                        .filter((value: { channelName: string }) => value?.channelName?.toLowerCase() === CHANNELS.TURO.toLowerCase())
                        .map((value: { url: string | number | null }) => value.url)
                )
            ) || [];

    // Handle sending a message
    const handleSendMessage = (event: { preventDefault: () => void }) => {
        event.preventDefault();
        sendMessageMutation.mutate();
    };

    const sendMessageMutation = useMutation({
        mutationFn: async () => {
            if (tripId || inputMessage || file) {
                const formData = new FormData();

                if (file) formData.append('file', file || null);
                formData.append('tripId', String(tripId));
                formData.append('message', inputMessage || '');
                formData.append('author', 'HOST');
                formData.append('password', env.NEXT_PUBLIC_CHAT_SERVICE_PASSWORD);

                const config = {
                    headers: {
                        Accept: '*/*',
                        'Content-Type': 'multipart/form-data'
                    }
                };

                try {
                    const url = `${process.env.NEXT_PUBLIC_CHAT_SERVICE_BASEURL}/sendMediaMessage`;
                    await axios.post(url, formData, config);
                    return {
                        success: true
                    };
                } catch (error) {
                    console.error('Error sending message:', error);
                    throw new Error('Failed to send message.');
                }
            } else {
                throw new Error('Missing tripId, token, or inputMessage');
            }
        },
        onSuccess: async () => {
            setInputMessage('');
            setFile(null);
            await queryClient.invalidateQueries({ queryKey: ['chatHistory', tripId] });
            removeFile();
        },
        onError: (error) => {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
        }
    });

    // Scroll chat window to bottom
    const scrollToBottom = () => {
        if (chatWindowRef.current) {
            // @ts-ignore
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    };

    // Effect to scroll when messages are loaded or updated
    useEffect(() => {
        if (!loadingMessages && !loadingBookingDetails && messageList.length > 0) {
            const timer = setTimeout(scrollToBottom, 0); // Ensure DOM updates are complete before scrolling
            return () => clearTimeout(timer); // Cleanup the timer
        }
    }, [loadingMessages, loadingBookingDetails, messageList]);

    // Effect to scroll when a message is sent
    useEffect(() => {
        if (sendMessageMutation.isPending === false) {
            const timeout = setTimeout(scrollToBottom, 100);
            return () => clearTimeout(timeout);
        }
    }, [sendMessageMutation.isPending]);

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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    function removeFile() {
        setPreviewImage(null);
        setFile(null);
    }

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
                                    <MessageItem key={index} message={message} tripData={tripData} turoId={turoVehicleId?.[0] ?? null} />
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Textbox and send */}
            <form onSubmit={handleSendMessage} className='relative flex w-full items-end gap-2'>
                {previewImage && (
                    <Card className='absolute bottom-full left-[5%] mb-2 overflow-hidden'>
                        <div className='relative h-24 w-24'>
                            <img src={previewImage} alt='Preview' className='h-full w-full object-cover' />
                            <Button
                                type='button'
                                variant='destructive'
                                size='icon'
                                className='absolute top-1 right-1 w-fit px-1 py-0'
                                onClick={removeFile}>
                                <X className='h-4 w-4' />
                                <span className='sr-only'>Remove image</span>
                            </Button>
                        </div>
                    </Card>
                )}
                <div className='flex flex-1 items-end gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-ring'>
                    <label htmlFor='image-upload' className='cursor-pointer'>
                        <Paperclip className='h-5 w-5 text-muted-foreground' />
                        <input id='image-upload' type='file' accept='image/*' onChange={handleImageUpload} className='sr-only' />
                    </label>
                    <label className='min-h-[1.5rem] flex-1'>
                        <span className='sr-only'>Chat Text Box</span>
                        <textarea
                            ref={textareaRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder='Type your message...'
                            className='flex max-h-20 w-full overflow-y-auto bg-inherit text-sm placeholder:text-muted-foreground placeholder:text-sm focus-visible:outline-none'
                            rows={1}
                            style={{ resize: 'none' }} // Prevent scrollbars from appearing
                        />
                    </label>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='size-6 w-fit px-2 pt-0 text-primary'
                        type='submit'
                        disabled={(!inputMessage.trim() && !file) || sendMessageMutation.isPending}
                        loading={sendMessageMutation.isPending}
                        suffix={<Send className='size-[20px]' />}>
                        <span className='sr-only'>Send</span>
                    </Button>
                </div>
            </form>
        </div>
    );
}

function MessageItem({ message, tripData, turoId }: MessageItemProps) {
    const authorImage = {
        [AUTHOR_TYPE.SYSTEM]: '/images/robot.png',
        [AUTHOR_TYPE.HOST]: tripData?.hostImage || '/images/dummy_avatar.png',
        [AUTHOR_TYPE.CLIENT]: tripData?.userImage || '/images/dummy_avatar.png'
    };

    const isClientMessage = message.author === AUTHOR_TYPE.CLIENT;

    const isHostMessage = message.author === AUTHOR_TYPE.HOST;

    // const images = tripData?.vehicleImages;

    const zipcode = tripData?.vehzipcode;

    const deliveryDate = formatDateAndTime(message.deliveryDate, zipcode, 'MMM DD, YYYY | h:mm A');

    if (isClientMessage) {
        return (
            <div className='flex max-w-[75%] '>
                {message.author !== AUTHOR_TYPE.HOST && (
                    <img
                        src={authorImage[message.author]}
                        alt={message.author}
                        width={32}
                        height={32}
                        className='mr-2 size-8 rounded-full border object-cover object-center'
                    />
                )}

                <div className='flex flex-col gap-2 rounded-lg rounded-tl-none bg-[#E1EFFE] px-3 py-2 dark:bg-[#2e4161] '>
                    <span className=' break-words text-xs'>{message.message}</span>

                    {message.mediaUrl && (
                        <ImagePreview
                            url={message?.mediaUrl || '/images/image_not_available.png'}
                            alt='media content'
                            className='md:w[250px] h-[86px] w-[200px] rounded-[7px] border object-cover object-center'
                        />
                    )}

                    <p className='flex items-center justify-end text-[10px] text-muted-foreground'>{deliveryDate}</p>
                </div>
            </div>
        );
    }

    if (isHostMessage) {
        return (
            <div className='ml-auto flex max-w-[75%] flex-col gap-2 rounded-lg rounded-br-none bg-primary/40 px-3 py-2'>
                <span className='overflow-wrap-anywhere break-words text-xs'>{message.message}</span>

                {message?.mediaUrl && (
                    <ImagePreview
                        url={message?.mediaUrl || '/images/image_not_available.png'}
                        alt='media content'
                        className='md:w[250px] h-[86px] w-[200px] rounded-[7px] border object-cover object-center'
                    />
                )}
                <p className='flex items-center justify-end text-[10px] text-muted-foreground'> {deliveryDate}</p>
            </div>
        );
    }

    return (
        <div className='flex max-w-[75%]'>
            {message.author !== AUTHOR_TYPE.CLIENT && (
                <img
                    src={authorImage[message.author]}
                    alt={message.author}
                    width={32}
                    height={32}
                    className='mr-2 size-8 rounded-full border'
                />
            )}

            {message.message.toLocaleLowerCase() === CHAT_CREATE_RESERVATION_MESSAGE.toLowerCase() ? (
                <div className='flex flex-col gap-2 rounded-lg bg-muted px-3 py-2 text-sm'>
                    <span className='overflow-wrap-anywhere break-words'>{message.message}</span>
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

                    <div className='text-xs'>
                        Start Date :<span className='font-medium '> {formatDateAndTime(tripData?.starttime, tripData?.vehzipcode)}</span>
                    </div>

                    <div className='text-xs'>
                        End Date : <span className='font-medium '> {formatDateAndTime(tripData?.endtime, tripData?.vehzipcode)}</span>
                    </div>

                    <div className='text-xs'>
                        Pickup & Return :<span className='font-medium capitalize'> {getFullAddress({ tripDetails: tripData })}</span>
                    </div>

                    <p className='flex items-center justify-end text-[10px] text-muted-foreground'>{deliveryDate}</p>
                </div>
            ) : (
                <div className='overflow-wrap-anywhere flex flex-col gap-2 break-words rounded-lg rounded-tl-none bg-muted px-3 py-2 text-xs'>
                    <span
                        style={{
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            wordWrap: 'break-word'
                        }}>
                        {message.message}
                    </span>

                    {turoId && message.message.toLowerCase() === CHAT_TRIP_APPROVAL_MESSAGE.toLowerCase() ? (
                        <a
                            href={getTuroVehicleLink(turoId)}
                            target='_blank'
                            rel='noreferrer'
                            className='flex w-fit items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black text-xs transition-colors hover:bg-yellow-600'>
                            Block on Turo
                        </a>
                    ) : null}

                    {message.mediaUrl && <img src={message.mediaUrl} alt='media content' className='mt-2 h-auto max-w-full rounded-lg' />}
                    <p className='flex items-center justify-end text-[10px] text-muted-foreground'>{deliveryDate}</p>
                </div>
            )}
        </div>
    );
}
