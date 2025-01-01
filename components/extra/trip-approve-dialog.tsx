'use client';

import { DEPOSIT_HOLD_AMOUNT } from '@/constants';
import { useReviewRequiredTrips } from '@/hooks/useTrips';
import { cn } from '@/lib/utils';
import { tripApproval } from '@/server/trips';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '../ui/extension/adaptive-dialog';
import { Label } from '../ui/extension/field';
import { Textarea } from '../ui/textarea';

interface TripApproveDialogProps {
    className?: string;
    tripId: number;
    debitOrCreditCard?: 'credit' | 'debit';
    defaultDepositToBeCollectedFlag: boolean;
    buttonText?: string;
    onActionComplete?: () => void;
}

export default function TripApproveDialog({
    className,
    tripId,
    defaultDepositToBeCollectedFlag = true,
    debitOrCreditCard,
    buttonText = 'Approve',
    onActionComplete
}: TripApproveDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [depositToBeCollected, setDepositToBeCollected] = useState<boolean>(defaultDepositToBeCollectedFlag);
    const [comments, setComments] = useState('');

    const { refetchAll } = useReviewRequiredTrips();

    function handleOpen() {
        setIsOpen(true);
    }

    function handleClose() {
        setIsOpen(false);
        setDepositToBeCollected(defaultDepositToBeCollectedFlag);
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
                depositToBeCollected: depositToBeCollected
            };

            const response = await tripApproval(payload);
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
        } finally {
            onActionComplete?.();
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
                <AdaptiveDialog onClose={handleClose} isOpen={isOpen} size='xl' title='Approve Trip' interactOutside={false}>
                    <AdaptiveBody className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-1 text-sm'>
                            <div>
                                This booking was made using a <span className='capitalize'>{debitOrCreditCard}</span> Card.
                            </div>
                            <div>
                                We recommend the collection of ${DEPOSIT_HOLD_AMOUNT} as security deposit from the guest to ensure smooth
                                transactions. The funds will be released after the trip is completed, provided there are no issues.
                            </div>
                        </div>
                        <div className='space-y-2'>
                            <Label>
                                Approval Message <span className='text-muted-foreground'>(Optional)</span>
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

                        <div className='flex items-start gap-2'>
                            <Checkbox
                                className='checkbox checkbox-primary mt-2 size-[22px]'
                                id='deposit'
                                defaultChecked={depositToBeCollected}
                                onCheckedChange={() => setDepositToBeCollected(!depositToBeCollected)}
                            />
                            <div>
                                <label htmlFor='deposit' className='font-semibold'>
                                    Collect Deposit
                                </label>
                                <p className='text-muted-foreground text-sm'>
                                    By checking this box, you agree to collect security deposit for this customer on all future bookings.
                                    This can be reversed later in the Customer's Profile.
                                </p>
                            </div>
                        </div>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='ghost' className='w-fit' disabled={isSubmitting} onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button className='w-fit' loading={isSubmitting} onClick={handleSubmit}>
                            Approve Trip
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </>
    );
}
