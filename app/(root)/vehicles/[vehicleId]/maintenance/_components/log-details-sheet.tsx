'use client';

import { DialogHeader } from '@/components/ui/dialog';
import ImagePreview from '@/components/ui/image-preview';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ExpenseIcon, ServiceIcon } from '@/public/icons';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { format } from 'date-fns';
import { AlignLeft, Calendar, CircleGauge, Clock, DollarSign, Paperclip } from 'lucide-react';

export function ServiceDetailsSheet({ open, onOpenChange, service: log }: any) {
    const isRepair = log.type === 'repair';
    const details = log.details;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className=' space-y-6 p-6 sm:max-w-md'>
                <VisuallyHidden>
                    <DialogHeader>
                        <DialogTitle>{details.typeOfService}</DialogTitle>
                        <DialogDescription>{details.typeOfService}</DialogDescription>
                    </DialogHeader>
                </VisuallyHidden>

                <div className='space-y-6'>
                    {/* Service/Expense Type Section */}
                    <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                        <div className='flex items-start gap-2'>
                            {isRepair ? (
                                <ServiceIcon className='mt-1 size-5 text-primary' />
                            ) : (
                                <ExpenseIcon className='mt-1 size-5 text-primary' />
                            )}
                            <div>
                                <h3 className='font-medium text-muted-foreground text-sm'>{isRepair ? 'Service Type' : 'Expense Type'}</h3>
                                <p className='text'>{details.typeOfService}</p>
                            </div>
                        </div>
                        <div className='mx-auto flex w-fit flex-col items-center rounded-full border-2 border-primary p-4'>
                            <span className='font-bold text-2xl'>$ {details.cost}</span>
                            <span className='text-muted-foreground text-sm'>Total Cost</span>
                        </div>
                    </div>

                    {/* Date and Time Section */}
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-1'>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                                <Calendar className='size-4' />
                                <span className='font-medium text-sm'>Date</span>
                            </div>
                            <p>{format(new Date(details.dateTime), 'PP') || 'N/A'}</p>
                        </div>
                        <div className='space-y-1'>
                            <div className='flex items-center gap-2 text-muted-foreground'>
                                <Clock className='size-4' />
                                <span className='font-medium text-sm'>Time</span>
                            </div>
                            <p>{format(new Date(details.dateTime), 'p') || 'N/A'}</p>
                        </div>
                    </div>

                    <div className='space-y-4 divide-y'>
                        {/* Odometer and Payment Method */}
                        <div className='grid grid-cols-2 gap-4 pb-4'>
                            <div className='space-y-1'>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <CircleGauge className='size-4' />
                                    <span className='font-medium text-sm'>Odometer</span>
                                </div>
                                <p>{details.odometer}</p>
                            </div>
                            <div className='space-y-1'>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <DollarSign className='size-4' />
                                    <span className='font-medium text-sm'>
                                        Payment <span className='hidden md:inline'>Method</span>
                                    </span>
                                </div>
                                <p>{details.paymentMethod}</p>
                            </div>
                        </div>

                        {details?.driver && (
                            <div className='space-y-1 pt-4'>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <DollarSign className='size-4' />
                                    <span className='font-medium text-sm'>Driver</span>
                                </div>
                                <p>{details.driver}</p>
                            </div>
                        )}

                        {/* Comments Section */}
                        {details.notes && (
                            <div className='space-y-2 pt-4'>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <AlignLeft className='size-4' />
                                    <span className='font-medium text-sm'>Comments</span>
                                </div>
                                <p className='text-muted-foreground text-sm'>{details.notes}</p>
                            </div>
                        )}

                        {/* Attachments Section */}
                        {details.imageName && (
                            <div className='space-y-3 pt-4'>
                                <div className='flex items-center gap-2 text-muted-foreground'>
                                    <Paperclip className='size-4' />
                                    <span className='font-medium text-sm'>Attachments</span>
                                </div>
                                <ImagePreview
                                    url={details.imageName || '/images/image_not_available.png'}
                                    alt={details.typeOfService}
                                    className=' w-[200px] rounded-[7px] object-cover object-center'
                                />
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
