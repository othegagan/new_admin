'use client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Paperclip, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MessageDetail() {
    const router = useRouter();
    return (
        <div className=' inset-0 left-full z-50 flex h-full w-full flex-1 flex-col rounded-md bg-background shadow-sm sm:static sm:z-auto md:border'>
            {/* Chat Header */}
            <div className='mb-1 flex flex-none justify-between rounded-t-md border-b pb-2'>
                <div className='flex gap-3'>
                    <button type='button' className='px-0 sm:hidden' onClick={() => router.back()}>
                        <ArrowLeft /> <span className='sr-only'>Back</span>
                    </button>
                    <div className='flex items-center gap-2 md:px-4 md:py-1 lg:gap-4'>
                        <span className='relative flex size-10 shrink-0 overflow-hidden rounded-full lg:size-11'>
                            <img
                                className='aspect-square h-full w-full'
                                alt='alex_dev'
                                src='https://randomuser.me/api/portraits/men/32.jpg'
                            />
                        </span>
                        <div>
                            <h5>Alex John</h5>
                            <p>NNM2279</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Body */}
            <div className='flex flex-1 flex-col gap-2 rounded-md md:px-4 md:pt-0 md:pb-4'>
                <div className='flex size-full flex-1'>
                    <div className='chat-text-container -mr-4 relative flex flex-1 flex-col overflow-y-hidden'>
                        <div className='chat-flex flex h-40 w-full flex-grow flex-col-reverse justify-start gap-4 overflow-y-auto py-2 pr-4 pb-4'>
                            {/* Right side (sent message) */}
                            <div className='chat-box max-w-72 self-end break-words rounded-[16px_16px_0_16px] bg-primary/85 px-3 py-2 text-primary-foreground/75 '>
                                See you later, Alex!
                                <span className='mt-1 block text-right font-light text-muted-foreground text-xs italic'>11:15 AM</span>
                            </div>

                            {/* Left side (received message) */}
                            <div className='chat-box max-w-72 self-start break-words rounded-[16px_16px_16px_0] bg-secondary px-3 py-2 '>
                                Alright, talk to you later!
                                <span className='mt-1 block font-light text-muted-foreground text-xs italic'>11:11 AM</span>
                            </div>

                            <div className='chat-box max-w-72 self-end break-words rounded-[16px_16px_0_16px] bg-primary/85 px-3 py-2 text-primary-foreground/75 '>
                                See you later, Alex!
                                <span className='mt-1 block text-right font-light text-muted-foreground text-xs italic'>11:15 AM</span>
                            </div>
                            <div className='chat-box max-w-72 self-start break-words rounded-[16px_16px_16px_0] bg-secondary px-3 py-2 '>
                                Alright, talk to you later!
                                <span className='mt-1 block font-light text-muted-foreground text-xs italic'>11:11 AM</span>
                            </div>

                            <div className='chat-box max-w-72 self-end break-words rounded-[16px_16px_0_16px] bg-primary/85 px-3 py-2 text-primary-foreground/75 '>
                                See you later, Alex!
                                <span className='mt-1 block text-right font-light text-muted-foreground text-xs italic'>11:15 AM</span>
                            </div>
                            <div className='chat-box max-w-72 self-start break-words rounded-[16px_16px_16px_0] bg-secondary px-3 py-2 '>
                                Alright, talk to you later!
                                <span className='mt-1 block font-light text-muted-foreground text-xs italic'>11:11 AM</span>
                            </div>

                            <div className='chat-box max-w-72 self-end break-words rounded-[16px_16px_0_16px] bg-primary/85 px-3 py-2 text-primary-foreground/75 '>
                                See you later, Alex!
                                <span className='mt-1 block text-right font-light text-muted-foreground text-xs italic'>11:15 AM</span>
                            </div>
                            <div className='chat-box max-w-72 self-start break-words rounded-[16px_16px_16px_0] bg-secondary px-3 py-2 '>
                                Alright, talk to you later!
                                <span className='mt-1 block font-light text-muted-foreground text-xs italic'>11:11 AM</span>
                            </div>

                            <div className='chat-box max-w-72 self-end break-words rounded-[16px_16px_0_16px] bg-primary/85 px-3 py-2 text-primary-foreground/75 '>
                                See you later, Alex!
                                <span className='mt-1 block text-right font-light text-muted-foreground text-xs italic'>11:15 AM</span>
                            </div>

                            <div className='flex'>
                                <img
                                    src='/images/robot.png'
                                    alt='system'
                                    width={32}
                                    height={32}
                                    className='mr-2 size-8 rounded-full border'
                                />
                                <div className='flex flex-col gap-2 rounded-lg bg-muted px-3 py-2 text-sm'>
                                    <span>A New Reservation was Requested</span>
                                </div>
                            </div>

                            <div className='ml-auto flex w-max max-w-[75%] flex-col gap-2 rounded-lg rounded-br-none bg-primary/40 px-3 py-2 font-medium text-sm'>
                                collect the deposit<p className='flex items-center justify-end text-[10px]'> Nov 27, 2024 | 11:56 AM</p>
                            </div>

                            <div className='flex'>
                                <img
                                    src='/images/robot.png'
                                    alt='system'
                                    width={32}
                                    height={32}
                                    className='mr-2 size-8 rounded-full border'
                                />
                                <div className='flex flex-col gap-2 rounded-lg rounded-tl-none bg-muted px-3 py-2 text-sm'>
                                    The Reservation Request has been Approved
                                    <p className='flex items-center justify-end text-[10px] text-muted-foreground'>
                                        Nov 27, 2024 | 11:56 AM
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Textbox and send */}
                <form className='flex w-full flex-none gap-2'>
                    <div className='flex flex-1 items-center gap-2 rounded-md border border-input px-2 py-1 focus-within:outline-none focus-within:ring-1 focus-within:ring-ring lg:gap-4'>
                        <Button variant='ghost' size='icon' className='w-fit'>
                            <Paperclip className='size-5' />
                        </Button>
                        <label className='flex-1'>
                            <span className='sr-only'>Chat Text Box</span>
                            <input
                                placeholder='Type your messages...'
                                className='h-8 w-full bg-inherit focus-visible:outline-none'
                                type='text'
                            />
                        </label>
                        <Button variant='ghost' size='icon' className='w-fit'>
                            <Send className='size-5' />
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
