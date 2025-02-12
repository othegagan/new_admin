'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { Textarea } from '@/components/ui/textarea';
import { currencyFormatter, formatDateAndTime } from '@/lib/utils';
import { sendMessageInChat } from '@/server/chat';
import { chargeManually } from '@/server/trips';
import { useState } from 'react';
import { toast } from 'sonner';

interface ChargeManuallyDialogProps {
    pendingPayments: Record<string, number>;
    failedPayments: Record<string, number>;
    zipcode: string;
    tripId: number;
}

export default function ChargeManuallyDialog({ pendingPayments, failedPayments, tripId, zipcode }: ChargeManuallyDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPendingRows, setSelectedPendingRows] = useState<Record<string, boolean>>({});
    const [selectedFailedRows, setSelectedFailedRows] = useState<Record<string, boolean>>({});
    const [message, setMessage] = useState('');

    const pendingCharges = Object.entries(pendingPayments).map(([paymentdate, amount]) => ({
        paymentdate,
        amount
    }));

    const failedCharges = Object.entries(failedPayments).map(([paymentdate, amount]) => ({
        paymentdate,
        amount
    }));

    // Sort charges by date
    pendingCharges.sort((a, b) => new Date(a.paymentdate).valueOf() - new Date(b.paymentdate).valueOf());
    failedCharges.sort((a, b) => new Date(a.paymentdate).valueOf() - new Date(b.paymentdate).valueOf());

    function togglePendingRow(paymentdate: string) {
        setSelectedPendingRows((prev) => ({
            ...prev,
            [paymentdate]: !prev[paymentdate]
        }));
    }

    function toggleFailedRow(paymentdate: string) {
        setSelectedFailedRows((prev) => ({
            ...prev,
            [paymentdate]: !prev[paymentdate]
        }));
    }

    const selectedPendingKeys = Object.keys(selectedPendingRows).filter((key) => selectedPendingRows[key]);
    const selectedFailedKeys = Object.keys(selectedFailedRows).filter((key) => selectedFailedRows[key]);

    function closeDialog() {
        setSelectedPendingRows({});
        setSelectedFailedRows({});
        setMessage('');
        setIsSubmitting(false);
        setOpen(false);
    }

    async function collectManually() {
        setIsSubmitting(true);

        try {
            const payload = {
                tripid: tripId,
                pendingPayments: selectedPendingKeys,
                failedPayments: selectedFailedKeys
            };

            const response = await chargeManually(payload);
            if (response.success) {
                if (message) await sendMessageInChat(tripId, message);
                toast.success(response.message);
                setTimeout(() => window.location.reload(), 1500);
                closeDialog();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error(error);
            toast.error('Failed to charge pending amounts', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <div onClick={() => setOpen(true)} className='dropdown-item'>
                Charge Manually
            </div>

            <AdaptiveDialog
                isOpen={open}
                onClose={closeDialog}
                title='Collect Pending Amount'
                className='sm:w-[40%] sm:max-w-full'
                description="This action will manually charge the selected amount to the driver's payment method.">
                <AdaptiveBody>
                    <div className='mx-auto grid max-w-xl gap-3'>
                        {/* Future Payments */}
                        {pendingCharges?.length > 0 ? (
                            <div>
                                <div className=' font-semibold'>Future Collections</div>
                                {pendingCharges.map((payment) => {
                                    // Skip payments with amounts close to 0
                                    if (payment.amount < 0.01 && payment.amount > -0.01) {
                                        return null;
                                    }

                                    const collectedDate = formatDateAndTime(payment.paymentdate, zipcode, 'MMM DD, YYYY, h:mm A ');

                                    return (
                                        <label
                                            key={payment.paymentdate}
                                            htmlFor={payment.paymentdate}
                                            className='grid cursor-pointer grid-cols-3 gap-2 py-1 '>
                                            <div className='col-span-2 flex items-start gap-2'>
                                                <Checkbox
                                                    id={payment.paymentdate}
                                                    className='mt-1'
                                                    checked={!!selectedPendingRows[payment.paymentdate]}
                                                    onCheckedChange={() => togglePendingRow(payment.paymentdate)}
                                                    autoFocus={false}
                                                />
                                                <div>
                                                    <div>To be collected in future</div>
                                                    <div className='text-muted-foreground text-xs'>{collectedDate}</div>
                                                </div>
                                            </div>
                                            <div className='col-span-1 flex items-center font-semibold'>
                                                {currencyFormatter(payment.amount)}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : null}

                        {/* Failed Payments */}
                        {failedCharges?.length > 0 ? (
                            <div>
                                <div className=' font-semibold'>Failed Collections</div>
                                {failedCharges.length > 0 &&
                                    failedCharges.map((failed) => {
                                        const failedDate = formatDateAndTime(failed.paymentdate, zipcode, 'MMM DD, YYYY, h:mm A ');

                                        // Skip failed with amounts close to 0
                                        if (failed.amount < 0.01 && failed.amount > -0.01) {
                                            return null;
                                        }

                                        return (
                                            <label
                                                htmlFor={failed.paymentdate}
                                                key={failed.paymentdate}
                                                className='grid cursor-pointer grid-cols-3 gap-2 py-1 '>
                                                <div className='col-span-2 flex items-start gap-2'>
                                                    <Checkbox
                                                        id={failed.paymentdate}
                                                        className='mt-1'
                                                        checked={!!selectedFailedRows[failed.paymentdate]}
                                                        onCheckedChange={() => toggleFailedRow(failed.paymentdate)}
                                                    />
                                                    <div>
                                                        <div>Retry failed charges</div>
                                                        <div className='text-muted-foreground text-xs'>{failedDate}</div>
                                                    </div>
                                                </div>
                                                <div className='col-span-1 flex items-center font-semibold'>
                                                    {currencyFormatter(failed?.amount)}
                                                </div>
                                            </label>
                                        );
                                    })}
                            </div>
                        ) : null}
                    </div>

                    {/* Message Section */}
                    <div className='mt-5 space-y-2'>
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
                    <Button
                        onClick={collectManually}
                        disabled={!selectedPendingKeys.length && !selectedFailedKeys.length}
                        loading={isSubmitting}
                        size='sm'>
                        Collect Amount
                    </Button>
                </AdaptiveFooter>
            </AdaptiveDialog>
        </>
    );
}
