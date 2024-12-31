'use client';

import { Main } from '@/components/layout/main';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import MainMessageComponent from '../../messages/_components/MainMessage';
import { TripActions } from '../_components/layout/trip-actions';

export default function TripDetails() {
    const params = useParams();
    const tripId = Number(params.tripId);

    const customDelivery = false;
    return (
        <Main fixed className='mx-auto h-full w-full max-w-[1600px] py-4'>
            {/* Header */}
            <header className='border-b pb-2'>
                <div className='flex items-center'>
                    <Link href='#' className='flex items-center font-medium text-muted-foreground text-sm'>
                        <ChevronLeft className='mr-2 h-4 w-4' />
                        Back
                    </Link>
                    <TripActions className='ml-auto' />
                </div>
            </header>

            {/* Main Content */}
            <div className='px-0'>
                <div className='grid gap-6 lg:grid-cols-[1fr,400px]'>
                    {/* Left Column - Trip Details */}
                    <div className='h-[calc(100dvh-10rem)] space-y-6 overflow-y-auto pt-2 pr-2'>
                        {/* User Info */}
                        <div className='flex items-center gap-4'>
                            <img src='/placeholder.svg' alt='User' className='h-16 w-16 rounded-full' />
                            <div>
                                <h1 className='font-semibold text-lg'>Mariah Golzavez Shane (Trip #1234)</h1>
                                <p className='text-gray-500 text-sm'>Tue, Dec 10, 2024 at 11:01 AM</p>
                            </div>
                            <span className='ml-auto rounded-md bg-green-100 px-4 py-2 font-medium text-green-800 text-sm'>
                                Ready to Drive
                            </span>
                        </div>

                        {/* Custom Delivery Required */}
                        {customDelivery && (
                            <Card className=' p-4'>
                                <p className='text-sm'>
                                    Custom Delivery Required: <span className='text-gray-500'>[Address]</span>
                                </p>
                            </Card>
                        )}

                        <Tabs defaultValue='summary' className='w-full'>
                            <TabsList className='sticky top-0 z-10 flex h-auto w-full overflow-x-auto overflow-y-hidden border-b bg-background px-4 pl-[60px]'>
                                <TabsTrigger
                                    value='summary'
                                    className='flex-grow basis-1/3 rounded-full data-[state=active]:border-primary data-[state=active]:bg-primary/30 data-[state=active]:shadow-none sm:basis-auto '>
                                    Summary
                                </TabsTrigger>
                                <TabsTrigger
                                    value='chat'
                                    className='flex-grow basis-1/3 rounded-full data-[state=active]:border-primary data-[state=active]:bg-primary/30 data-[state=active]:shadow-none sm:basis-auto md:hidden'>
                                    Trip Chat
                                </TabsTrigger>
                                <TabsTrigger
                                    value='payments'
                                    className='flex-grow basis-1/3 rounded-full data-[state=active]:border-primary data-[state=active]:bg-primary/30 data-[state=active]:shadow-none sm:basis-auto '>
                                    Payments
                                </TabsTrigger>
                                <TabsTrigger
                                    value='checklist'
                                    className='flex-grow basis-1/3 rounded-full data-[state=active]:border-primary data-[state=active]:bg-primary/30 data-[state=active]:shadow-none sm:basis-auto '>
                                    <span className='hidden sm:inline'>Checklist & Media</span>
                                    <span className='sm:hidden'>Checklist</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value='logs'
                                    className='flex-grow basis-1/3 rounded-full data-[state=active]:border-primary data-[state=active]:bg-primary/30 data-[state=active]:shadow-none sm:basis-auto '>
                                    Logs
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value='summary' className='mt-6 px-4'>
                                <TripSummary />
                            </TabsContent>
                            <TabsContent
                                value='chat'
                                className={cn('mt-4 px-4', customDelivery ? 'h-[calc(100dvh-25rem)]' : 'h-[calc(100dvh-21rem)]')}>
                                <ChatInterface tripId={tripId} />
                            </TabsContent>
                            <TabsContent value='payments' className='mt-6 px-4'>
                                {/* Payments content */}
                            </TabsContent>
                            <TabsContent value='checklist' className='mt-6 px-4'>
                                {/* Checklist content */}
                            </TabsContent>
                            <TabsContent value='logs' className='mt-6 px-4'>
                                {/* Logs content */}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column - Chat (Desktop Only) */}
                    <div className='hidden h-[calc(100dvh-8rem)] overflow-y-auto pt-4 lg:block'>
                        <div className='inset-0 left-full z-50 flex h-full w-full flex-1 flex-col rounded-md bg-background shadow-sm sm:static sm:z-auto'>
                            <MainMessageComponent tripId={tripId} className='h-full lg:h-full' />
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    );
}

function TripSummary() {
    return (
        <div className='space-y-6'>
            <div className='flex items-start gap-4'>
                <img src='/placeholder.svg' alt='Jeep Wrangler' className='h-24 w-32 rounded-lg object-cover' />
                <div>
                    <div className='flex items-center gap-2'>
                        <span className='font-medium text-sm'>Bundee</span>
                        <h3 className='font-semibold text-lg'>Jeep Wrangler JL</h3>
                    </div>
                    <p className='text-gray-500 text-sm'>9M4662R</p>
                    <div className='mt-2'>
                        <span className='font-bold text-orange-600 text-xl'>$40/day</span>
                    </div>
                </div>
                <span className='ml-auto rounded bg-gray-100 px-3 py-1 text-gray-600 text-sm'>Requested</span>
            </div>

            <div className='space-y-4'>
                <div className='flex items-start gap-2'>
                    <svg className='mt-1 h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                        />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                    </svg>
                    <div>
                        <p className='font-medium'>Vehicle Location:</p>
                        <p className='text-gray-600'>78704, 505 Barton Springs Road, Austin, Texas</p>
                    </div>
                </div>

                <div className='space-y-4'>
                    <h4 className='font-medium'>Duration (4 days)</h4>
                    <Card className='p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='font-medium'>Thu, Dec 19, 2024</p>
                                <p className='text-gray-600'>10:00 AM</p>
                            </div>
                            <div className='text-orange-600'>To</div>
                            <div className='text-right'>
                                <p className='font-medium'>Mon, Dec 23, 2024</p>
                                <p className='text-gray-600'>10:00 AM</p>
                            </div>
                        </div>
                        <div className='mt-4 space-y-2'>
                            <div className='flex items-start gap-2'>
                                <svg className='mt-1 h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                    />
                                </svg>
                                <div>
                                    <p className='font-medium'>Pick-up:</p>
                                    <p className='text-gray-600'>198 Blvd, Frazer St, Texas</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-2'>
                                <svg className='mt-1 h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                                    />
                                </svg>
                                <div>
                                    <p className='font-medium'>Drop-off:</p>
                                    <p className='text-gray-600'>0887 Main St, Flitz Bar, Austin, Texas</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ChatInterface({ tripId }: { tripId: number }) {
    return (
        <div className='flex h-full flex-1 flex-col'>
            <div className='inset-0 left-full z-50 flex h-full w-full flex-1 flex-col rounded-md bg-background shadow-sm sm:static sm:z-auto'>
                <MainMessageComponent tripId={tripId} className='h-full lg:h-full' />
            </div>
        </div>
    );
}
