'use client';

import { useReviewRequiredTrips } from '@/hooks/useTrips';
import { cn } from '@/lib/utils';
import { tripDismissalFromNeedsReview } from '@/server/trips';
import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '../ui/extension/adaptive-dialog';

interface TripDismissDialogProps {
    className?: string;
    tripId: number;
    dismissalKey:
        | 'cardExtensionFailed'
        | 'failedautotripExtension'
        | 'failedDriverVerifications'
        | 'newRequest'
        | 'paymentFailed'
        | 'startFailed';
}

export default function TripDismissDialog({ className, tripId, dismissalKey }: TripDismissDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { refetchAll } = useReviewRequiredTrips();

    function handleOpen() {
        setIsOpen(true);
    }

    function handleClose() {
        setIsOpen(false);
        setIsSubmitting(false);
    }

    async function handleSubmit() {
        setIsSubmitting(true);
        try {
            const payload: any = {
                cardExtensionFailed: false,
                failedautotripExtension: false,
                failedDriverVerifications: false,
                newRequest: false,
                paymentFailed: false,
                startFailed: false,
                tripid: tripId
            };

            payload[dismissalKey] = true;

            const response = await tripDismissalFromNeedsReview(payload);
            if (response.success) {
                toast.success(response.message);
                setIsOpen(false);
                setIsSubmitting(false);
                refetchAll();
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
                <X className='size-5 ' /> Dismiss
            </button>

            {isOpen && (
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
            )}
        </>
    );
}
