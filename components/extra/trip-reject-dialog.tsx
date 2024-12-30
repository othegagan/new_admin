'use client';

import { useReviewRequiredTrips } from '@/hooks/useTrips';
import { cn } from '@/lib/utils';
import { tripRejection } from '@/server/trips';
import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '../ui/extension/adaptive-dialog';
import { Label } from '../ui/extension/field';
import { Textarea } from '../ui/textarea';

interface TripRejectDialogProps {
    className?: string;
    tripId: number;
}

export default function TripRejectDialog({ className, tripId }: TripRejectDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { refetchAll } = useReviewRequiredTrips();

    const [comments, setComments] = useState('');

    function handleOpen() {
        setIsOpen(true);
    }

    function handleClose() {
        setIsOpen(false);
        setComments('');
        setIsSubmitting(false);
    }

    async function handleSubmit() {
        setIsSubmitting(true);
        try {
            const payload = {
                tripid: tripId,
                comments: comments || ''
            };

            const response = await tripRejection(payload);
            if (response.success) {
                refetchAll();
                toast.success(response.message);
                setIsOpen(false);
                setIsSubmitting(false);
            } else {
                toast.error(response.message);
                setIsSubmitting(false);
            }
        } catch (error: any) {
            toast.error(error.message);
            setIsSubmitting(false);
            console.error(error.message);
        }
    }

    return (
        <>
            <button
                type='button'
                className={cn(
                    'flex flex-row items-center gap-2 py-2 font-semibold text-[14px] text-neutral-700 dark:text-neutral-400',
                    className
                )}
                onClick={handleOpen}>
                <X className='size-5 ' /> Reject
            </button>

            {isOpen && (
                <AdaptiveDialog onClose={handleClose} isOpen={isOpen} size='xl' title='Reject Trip' interactOutside={false}>
                    <AdaptiveBody className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-1 text-sm'>
                            Rejecting this trip will notify the renter that their booking has been declined. You can optionally provide a
                            reason in the comments below. This action cannot be undone.
                        </div>
                        <div className='space-y-2'>
                            <Label>
                                Message <span className='text-muted-foreground'>(Optional)</span>
                            </Label>
                            <Textarea
                                autoFocus={false}
                                className='w-full'
                                placeholder=''
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </div>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='ghost' className='w-fit' disabled={isSubmitting} onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button className='w-fit' loading={isSubmitting} onClick={handleSubmit}>
                            Reject Trip
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </>
    );
}
