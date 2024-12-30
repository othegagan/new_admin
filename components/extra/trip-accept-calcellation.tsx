'use client';

import { useReviewRequiredTrips } from '@/hooks/useTrips';
import { cn } from '@/lib/utils';
import { acceptTripCancellation } from '@/server/trips';
import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface AcceptTripCancellationDialogProps {
    className?: string;
    tripId: number;
}

export default function AcceptTripCancellationDialog({ className, tripId }: AcceptTripCancellationDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { refetchAll } = useReviewRequiredTrips();

    async function handleSubmit() {
        setIsSubmitting(true);
        try {
            const payload: any = {
                tripid: tripId
            };

            const response = await acceptTripCancellation(payload);
            if (response.success) {
                refetchAll();
                toast.success(response.message);
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
            <Button
                type='button'
                loading={isSubmitting}
                loadingText='Cancelling...'
                className={cn(
                    'flex flex-row items-center gap-2 py-2 font-semibold text-[14px] text-neutral-700 dark:text-neutral-400',
                    className
                )}
                suffix={<X className='size-5 ' />}
                onClick={handleSubmit}>
                Cancel
            </Button>

            {/* {isOpen && (
                <AdaptiveDialog onClose={handleClose} isOpen={isOpen} size='xl' title='Dismiss'>
                    <AdaptiveBody className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-1 text-sm'>Are you sure you want to dismiss this trip (#{tripId})?</div>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='ghost' className='w-fit' disabled={isSubmitting} onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button className='w-fit' loading={isSubmitting} onClick={handleSubmit}>
                            Dismiss
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )} */}
        </>
    );
}
