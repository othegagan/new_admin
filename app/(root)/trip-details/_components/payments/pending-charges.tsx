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
        <div className='flex items-center justify-between pt-2 font-light'>
            <div>
                Pending Charges
                <PendingChargesDialog pendingCharges={pendingCharges} zipcode={zipcode} />
            </div>

            <div className='font-light'> ${pendingPaymentsSum.toFixed(2)}</div>
        </div>
    );
}

function PendingChargesDialog({ pendingCharges, zipcode }: PendingChargesDialogProps) {
    const [open, setOpen] = useState(false);

    function close() {
        setOpen(false);
    }

    return (
        <>
            <button onClick={() => setOpen(true)} type='button' className='pl-5 text-blue-500'>
                View Schedule
            </button>

            <AdaptiveDialog isOpen={open} onClose={close} title='Pending Charges' size='md'>
                <AdaptiveBody>
                    <div className='grid gap-4'>
                        {pendingCharges.map((payment: { amount: number; paymentdate: string | Date }, i: Key | null | undefined) => {
                            // Skip payments with amounts close to 0
                            if (payment.amount < 0.01 && payment.amount > -0.01) {
                                return null;
                            }

                            const collectedDate = formatDateAndTime(payment.paymentdate, zipcode);

                            return (
                                <div className='grid grid-cols-4 gap-5' key={i}>
                                    <div className='col-span-3'>
                                        To be collected in future
                                        <div className='text-muted-foreground text-xs'>{collectedDate}</div>
                                    </div>
                                    <div className='col-span-1 flex items-center justify-end'>${payment.amount.toFixed(2)}</div>
                                </div>
                            );
                        })}
                    </div>
                </AdaptiveBody>
            </AdaptiveDialog>
        </>
    );
}
