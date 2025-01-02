'use client';

import { useTripDetails } from '@/hooks/useTrips';
import { cn } from '@/lib/utils';
import { sendMessageInChat } from '@/server/chat';
import { tripStart } from '@/server/trips';
import { Check, CircleCheck, CircleX } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '../ui/extension/adaptive-dialog';
import { Label } from '../ui/extension/field';
import { Textarea } from '../ui/textarea';

interface TripStartDialogProps {
    className?: string;
    tripId: number;
    isRentalAgreed?: boolean;
    isInsuranceVerified?: boolean;
    isLicenceVerified?: boolean;
    isPhoneVerified?: boolean;
    buttonText?: string;
    onActionComplete?: () => void; // Callback function to close the mobile action menu
}

export default function TripStartDialog({
    className,
    tripId,
    isRentalAgreed,
    isLicenceVerified,
    isPhoneVerified,
    buttonText = 'Start Trip',
    onActionComplete
}: TripStartDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [comments, setComments] = useState('');
    const { refetchAll: refectTripDetails } = useTripDetails(tripId);

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
                changedBy: 'HOST'
            };

            const response = await tripStart(payload);
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
                className={cn('flex flex-row items-center gap-2 py-2 font-semibold text-[14px] text-green-600', className)}
                onClick={handleOpen}>
                <Check className='size-5 ' /> {buttonText}
            </Button>

            {isOpen && (
                <AdaptiveDialog onClose={handleClose} isOpen={isOpen} size='xl' title='Start Trip' interactOutside={false}>
                    <AdaptiveBody className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-2 text-sm'>
                            <CheckListItem className='flex-1' text="Driver's Licence Verification" checkMark={isLicenceVerified} />
                            <CheckListItem className='flex-1' text='Phone Number Verification' checkMark={isPhoneVerified} />
                            {isRentalAgreed !== undefined && (
                                <CheckListItem className='flex-1' text='Rental Agreement' checkMark={isRentalAgreed} />
                            )}

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
                            Start Trip
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </>
    );
}

function CheckListItem({ className, text, checkMark }: { className?: string; text: string; checkMark: boolean | undefined }) {
    return (
        <div className={cn('flex items-center gap-4', className)}>
            {checkMark ? <CircleCheck className='text-green-500' /> : <CircleX className='text-red-500' />}
            {text}
        </div>
    );
}
