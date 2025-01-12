'use client';

import { AdaptiveBody, AdaptiveDialog } from '@/components/ui/extension/adaptive-dialog';
import { currencyFormatter, formatDateAndTime } from '@/lib/utils';
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
        <div className='flex items-center justify-between pt-2'>
            <div>
                Collected Charges
                <CollectedChargesDialog processedCharges={processedCharges} zipcode={zipcode} processedPaymentsSum={processedPaymentsSum} />
            </div>

            <div> {currencyFormatter(processedPaymentsSum)}</div>
        </div>
    );
}

function CollectedChargesDialog({ processedCharges, zipcode, processedPaymentsSum }: CollectedChargesDialogProps) {
    const [open, setOpen] = useState(false);

    function close() {
        setOpen(false);
    }

    return (
        <>
            <button onClick={() => setOpen(true)} type='button' className='pl-5 text-blue-500'>
                View Collection History
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
                                        <div className='text-muted-foreground text-xs'>{collectedDate}</div>
                                    </div>
                                    <div className='col-span-1 flex items-center justify-end'>{currencyFormatter(payment.amount)}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className='mt-4 flex items-center justify-between border-t pt-2'>
                        <div className='font-semibold'>Total Collected Charges</div>

                        <div className='font-semibold'> {currencyFormatter(processedPaymentsSum)}</div>
                    </div>
                </AdaptiveBody>
            </AdaptiveDialog>
        </>
    );
}
