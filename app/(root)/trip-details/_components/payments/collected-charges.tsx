'use client';

import { AdaptiveBody, AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { formatDateAndTime } from '@/lib/utils';
import { type Key, useState } from 'react';

interface CollectedChargesProps {
    processedPayments: any;
    zipcode: string;
}

interface CollectedChargesDialogProps {
    processedCharges: any[];
    processedPaymentsSum: number;
    zipcode: string;
}

export default function CollectedCharges({ processedPayments, zipcode }: CollectedChargesProps) {
    const processedCharges: any[] = [];
    let processedPaymentsSum = 0;

    const pmtsKeys = Object.keys(processedPayments || {});
    for (const key of pmtsKeys) {
        const amount = processedPayments[key];
        processedCharges.push({
            paymentdate: key,
            amount
        });
        processedPaymentsSum += amount;
    }

    // Sort payments by date
    processedCharges.sort(
        (a: { paymentdate: string | Date }, b: { paymentdate: string | Date }) =>
            new Date(a.paymentdate).valueOf() - new Date(b.paymentdate).valueOf()
    );

    return (
        <div className='flex items-center justify-between'>
            <div>Collected Charges</div>
            <CollectedChargesDialog processedCharges={processedCharges} processedPaymentsSum={processedPaymentsSum} zipcode={zipcode} />
        </div>
    );
}

function CollectedChargesDialog({ processedCharges, processedPaymentsSum, zipcode }: CollectedChargesDialogProps) {
    const [open, setOpen] = useState(false);

    function close() {
        setOpen(false);
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                type='button'
                className='p-0 py-0 font-normal text-base text-foreground tracking-wide underline underline-offset-2'>
                ${processedPaymentsSum.toFixed(2)}
            </button>

            <AdaptiveDialog isOpen={open} onClose={close} title='Collected Charges' size='md'>
                <AdaptiveBody>
                    <div className='grid gap-4'>
                        {processedCharges.map((payment: { amount: number; paymentdate: string | Date }, i: Key | null | undefined) => {
                            // Skip payments with amounts close to 0
                            if (payment.amount < 0.01 && payment.amount > -0.01) {
                                return null;
                            }

                            const collectedDate = formatDateAndTime(payment.paymentdate, zipcode);

                            return (
                                <div className='grid grid-cols-4 gap-5' key={i}>
                                    <div className='col-span-3'>
                                        {payment.amount >= 0 ? 'Collected' : 'Refunded'} rental charges
                                        <div className='text-xs'>{collectedDate}</div>
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
