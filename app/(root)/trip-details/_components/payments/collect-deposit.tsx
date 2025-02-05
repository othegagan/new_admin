'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { Textarea } from '@/components/ui/textarea';
import { sendMessageInChat } from '@/server/chat';
import { collectDeposit } from '@/server/trips';
import { useState } from 'react';
import { toast } from 'sonner';

interface CollectDepositDialogProps {
    tripId: number;
}

export default function CollectDepositDialog({ tripId }: CollectDepositDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    function closeDialog() {
        setOpen(false);
    }

    async function onSubmit() {
        setIsSubmitting(true);

        try {
            const payload = { tripId: tripId };
            const response = await collectDeposit(payload);
            if (response.success) {
                if (message) await sendMessageInChat(tripId, message);
                toast.success(response.message);
                setTimeout(() => window.location.reload(), 1500);
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to collect deposit. Please try again.');
            setIsSubmitting(false);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <div onClick={() => setOpen(true)} className='dropdown-item'>
                Collect Deposit
            </div>

            <AdaptiveDialog isOpen={open} onClose={closeDialog} title='Collect Security Deposit'>
                <AdaptiveBody className='flex flex-col gap-4'>
                    <p className='text-sm'>This action will place a security deposit hold.</p>

                    {/* Message Section */}
                    <div className=' space-y-2'>
                        <Label htmlFor='message' className='font-semibold'>
                            Message <span className='font-normal text-muted-foreground'>(Optional)</span>
                        </Label>
                        <Textarea value={message} id='message' onChange={(e) => setMessage(e.target.value)} rows={2} />
                    </div>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button variant='outline' onClick={closeDialog} size='sm'>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} loading={isSubmitting} size='sm'>
                        Collect Deposit
                    </Button>
                </AdaptiveFooter>
            </AdaptiveDialog>
        </>
    );
}
