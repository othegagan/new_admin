'use client';

import { Main } from '@/components/layout/main';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { dummyMessages } from './dummyData';

export default function MessagesLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const showMobileDetail = pathname !== '/messages';

    return (
        <Main fixed className='h-full'>
            <section className='flex h-full gap-6'>
                <div className={`h-full w-full flex-none sm:w-56 lg:w-72 2xl:w-80 ${showMobileDetail ? 'hidden sm:block' : 'block'}`}>
                    {/* Header */}
                    <div className='-mx-4 sticky top-0 z-10 bg-background px-4 pb-3 shadow-md sm:static sm:z-auto sm:mx-0 sm:p-0 sm:shadow-none'>
                        <h3>Messages</h3>
                        <Input className='mt-3 w-full' placeholder='Search...' />
                    </div>

                    <div className='h-[calc(100svh-200px)] overflow-y-auto pt-2'>
                        {dummyMessages.map((message) => (
                            <Link key={message.id} href={`/messages/${message.id}`}>
                                <div className='block w-full cursor-pointer border-b px-3 py-4 hover:bg-muted'>
                                    <div className='flex items-center space-x-2'>
                                        <div className='relative'>
                                            <span className='relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border'>
                                                <img src={message.sender.avatar} alt={message.sender.name} className='object-cover' />
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className='max-w-[280px] truncate text-left font-semibold text-lg'>
                                                {message.sender.name}
                                            </h3>
                                            <p className='max-w-[280px] truncate text-left text-muted-foreground text-sm'>
                                                {message.lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='mt-2.5 flex w-full items-center justify-between space-x-2 pr-3'>
                                        <div className='inline-flex items-center text-nowrap rounded-md border border-transparent bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground text-xs transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'>
                                            Booking: {message.bookingId}
                                        </div>
                                        <span className='text-muted-foreground text-sm'>{message.lastMessageTime}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {children}
            </section>
        </Main>
    );
}

// export default function MessageDetail({ params }: { params: Promise<{ id: string }> }) {
//     const { id } = use(params);
