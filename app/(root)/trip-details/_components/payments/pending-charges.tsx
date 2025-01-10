'use client';

import { AdaptiveBody, AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { formatDateAndTime } from '@/lib/utils';
import { type Key, useState } from 'react';

interface PendingChargesProps {
    pendingPayments: any;
    zipcode: string;
}

interface PendingChargesDialogProps {
    pendingCharges: any[];
    zipcode: string;
}

export default function PendingCharges({ pendingPayments, zipcode }: PendingChargesProps) {
    const pendingCharges: any[] = [];
    let pendingPaymentsSum = 0;

    const pmtsKeys = Object.keys(pendingPayments || {});
    for (const key of pmtsKeys) {
        const amount = pendingPayments[key];
        pendingCharges.push({
            paymentdate: key,
            amount
        });
        pendingPaymentsSum += amount;
    }

    // Sort payments by date
    pendingCharges.sort(
        (a: { paymentdate: string | Date }, b: { paymentdate: string | Date }) =>
            new Date(a.paymentdate).valueOf() - new Date(b.paymentdate).valueOf()
    );

    return (
        <div className='flex items-center justify-between pt-2 '>
            <div>
                Pending Charges
                <PendingChargesDialog pendingCharges={pendingCharges} zipcode={zipcode} />
            </div>

            <div> ${pendingPaymentsSum.toFixed(2)}</div>
        </div>
    );
}

function PendingChargesDialog({ pendingCharges, zipcode }: PendingChargesDialogProps) {
    const [open, setOpen] = useState(false);

    function close() {
        setOpen(false);
    }

    if (pendingCharges.length === 0) return null;

    return (
        <>
            <button onClick={() => setOpen(true)} type='button' className='pl-5 text-blue-500'>
                View Schedule
            </button>

            <AdaptiveDialog
                isOpen={open}
                onClose={close}
                title='Payment Schedule'
                size='md'
                description='A breakdown of the upcoming payments, including amounts and due dates.'>
                <AdaptiveBody>
                    <div className='grid gap-3'>
                        <div className='grid grid-cols-4 gap-5 rounded-t bg-muted px-4 py-2 font-semibold'>
                            <div className='col-span-3'>Due Date</div>
                            <div className='col-span-1 flex items-center '>Amount</div>
                        </div>
                        <div>
                            {pendingCharges.map((payment: { amount: number; paymentdate: string | Date }, i: Key | null | undefined) => {
                                // Skip payments with amounts close to 0
                                if (payment.amount < 0.01 && payment.amount > -0.01) {
                                    return null;
                                }

                                const collectedDate = formatDateAndTime(payment.paymentdate, zipcode, 'MMM DD, YYYY, h:mm A ');

                                return (
                                    <div className='grid grid-cols-4 gap-5 py-1' key={i}>
                                        <div className='col-span-3'>{collectedDate}</div>
                                        <div className='col-span-1 flex items-center font-semibold '>${payment.amount.toFixed(2)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </AdaptiveBody>
            </AdaptiveDialog>
        </>
    );
}
