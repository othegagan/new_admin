'use client';

import { useTripDetails } from '@/hooks/useTrips';
import { cn } from '@/lib/utils';
import { sendMessageInChat } from '@/server/chat';
import { tripComplete } from '@/server/trips';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '../ui/extension/adaptive-dialog';
import { Label } from '../ui/extension/field';
import { Textarea } from '../ui/textarea';

interface TripCompleteDialogProps {
    className?: string;
    tripId: number;
    captureAmount?: number;
    buttonText?: string;
    onActionComplete?: () => void;
}

export default function TripCompleteDialog({
    className,
    tripId,
    buttonText = 'End Trip',
    captureAmount,
    onActionComplete
}: TripCompleteDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { refetchAll: refectTripDetails } = useTripDetails(tripId);

    const [comments, setComments] = useState('');

    function handleOpen() {
        setIsOpen(true);
    }

    function handleClose() {
        setIsOpen(false);
        setComments('');
        setIsSubmitting(false);
        onActionComplete?.();
    }

    async function handleSubmit() {
        setIsSubmitting(true);
        try {
            const payload = {
                tripid: tripId,
                comments: comments || '',
                paymentCategoryId: 1,
                captureAmount: captureAmount,
                changedBy: 'HOST'
            };

            const response = await tripComplete(payload);
            if (response.success) {
                if (comments) await sendMessageInChat(tripId, comments);
                refectTripDetails();
                toast.success(response.message);
                setIsOpen(false);
                setIsSubmitting(false);
                handleClose();
                window.location.reload();
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
                variant='ghost'
                type='button'
                className={cn(
                    'flex flex-row items-center gap-2 py-2 font-semibold text-[14px] text-neutral-700 dark:text-neutral-300',
                    className
                )}
                onClick={handleOpen}>
                <Check className='h-4 w-4' /> {buttonText}
            </Button>

            {isOpen && (
                <AdaptiveDialog onClose={handleClose} isOpen={isOpen} size='xl' title='End Trip' interactOutside={false}>
                    <AdaptiveBody className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-2 text-sm'>
                            <div className='space-y-2'>
                                <Label>
                                    Message <span className='text-muted-foreground'>(Optional)</span>
                                </Label>
                                <Textarea
                                    autoFocus={false}
                                    className='w-full'
                                    placeholder=''
                                    rows={4}
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                />
                            </div>
                        </div>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='ghost' className='w-fit' disabled={isSubmitting} onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button className='w-fit' loading={isSubmitting} onClick={handleSubmit}>
                            End Trip
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </>
    );
}
