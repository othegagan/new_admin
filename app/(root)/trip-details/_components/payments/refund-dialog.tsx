'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { currencyFormatter, formatDateAndTime } from '@/lib/utils';
import { sendMessageInChat } from '@/server/chat';
import { refundCharges } from '@/server/trips';
import type { RentalCharge } from '@/types';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface RefundDialogProps {
    fullTripResponse: any;
}

interface ChargeRows extends RentalCharge {
    checked?: boolean;
}

export default function RefundDialog({ fullTripResponse }: RefundDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'select' | 'review'>('select');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [chargeRows, setChargeRows] = useState<ChargeRows[]>(
        (fullTripResponse?.rentalCharges || [])
            ?.map((row: ChargeRows) => ({ ...row, checked: false }))
            .sort((a: any, b: any) => a.label.localeCompare(b.label)) || []
    );

    const tripId = fullTripResponse?.activetripresponse[0]?.tripid;
    const zipcode = fullTripResponse?.activetripresponse[0]?.vehzipcode;

    const collectionStatusList = fullTripResponse?.collectionStatusList || [];

    const getCollectionStatus = (statusId: number) =>
        collectionStatusList.find((status: any) => status.id === statusId)?.statusName || 'Unknown';

    const { selectedRefund, selectedIds, selectedCharges, displayEligibles } = useMemo(() => {
        let selectedRefund = 0;
        let eligibleRefund = 0;
        const selectedIds: number[] = [];
        const selectedCharges: ChargeRows[] = [];

        chargeRows.forEach((row) => {
            if (row.checked) {
                selectedRefund += row.total;
                selectedIds.push(row.id);
                selectedCharges.push(row);
            }
            if (row.isDebt && row.collectionStatusId === 2 && !row.isDiscount && !row.isRentalChargesRefund) {
                eligibleRefund += row.total;
            }
            if (row.collectionStatusId === 2 && row.isDiscount) {
                eligibleRefund += row.isDebt ? row.total : -row.total;
            }
        });

        return {
            selectedRefund,
            eligibleRefund,
            selectedIds,
            selectedCharges,
            displayEligibles: Math.abs(eligibleRefund - selectedRefund)
        };
    }, [chargeRows]);

    const toggleCheckbox = (id: number) => {
        const updatedRows = chargeRows.map((row) => (row.id === id ? { ...row, checked: !row.checked } : row));
        setChargeRows(updatedRows);
    };

    async function refund() {
        setIsSubmitting(true);

        try {
            const payload = {
                rentalChargesIds: selectedIds,
                tripChargesIds: [],
                tripid: tripId
            };
            const response = await refundCharges(payload);
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
            toast.error('Failed to refund logs', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    function renderRentalTripLedgerRows(rentalCharges: ChargeRows[]) {
        return rentalCharges.map((row: ChargeRows) => {
            if (row.chargeAmount === 0.0) return null;

            // Exclude Debt, Collected and Discounted rows
            if (!(row.isDebt && row.collectionStatusId === 2 && !row.isDiscount)) {
                return null;
            }

            const createdDateFormatted = row.isDiscount
                ? formatDateAndTime(row?.createdDate, zipcode, 'MMM DD, YYYY')
                : format(row?.createdDate, 'PP');

            const sign = row.isDebt ? ' ' : '-';
            const formattedDate = formatDateAndTime(row?.rentalDate, zipcode, 'MMM DD');
            const description = row?.label?.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-/g, ' ');

            const amount = `${sign} ${currencyFormatter(row?.chargeTotal)}`;
            const dayCost = `${currencyFormatter(row?.chargeAmount)}`;
            const discount = `- ${currencyFormatter(row?.chargesDiscount - row.chargesDiscountDisqualifier)}`;
            const concession = `${currencyFormatter(row?.concessionFee)}`;
            const registrationFee = `${currencyFormatter(row?.registrationRecoveryFee)}`;
            const surCharge = `${currencyFormatter(row?.stateSurcharge - row.stateSurchargeDiscount + row?.stateSurchargeDiscountDisqualifier)}`;
            const tax = ` ${currencyFormatter(row?.chargeTax - row?.taxDiscount + row?.taxDiscountDisqualifier)}`;
            const total = `${sign} ${currencyFormatter(row?.total)}`;

            //@ts-ignore
            const isPastDeadline = row?.collectionStatusId === 3 && row?.collectionDeadLine > row?.createdDate;
            const date = isPastDeadline ? row?.collectionDeadLine : row?.createdDate;
            const statusDate = formatDateAndTime(date, zipcode, 'MMM DD, YYYY, h:mm A');

            return (
                <TableRow
                    key={row.id}
                    aria-disabled={row.isRentalChargesRefund}
                    className={row.isRentalChargesRefund ? 'cursor-default bg-muted' : ''}>
                    <TableCell>
                        {!row.isRentalChargesRefund && (
                            <Checkbox checked={row.checked || false} onCheckedChange={() => toggleCheckbox(row.id)} />
                        )}
                    </TableCell>
                    <TableCell className='capitalize'>
                        <div>
                            {formattedDate} - {description}
                            <br />
                            <span className='text-muted-foreground text-xs '>
                                <span className='hidden md:inline-block'>Created on</span> {createdDateFormatted}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div>
                            <Popover>
                                <PopoverTrigger className='flex-start gap-2'>
                                    <span className='hidden md:inline-block'> {amount}</span>
                                    <span className='md:hidden'>{total}</span>
                                    <ChevronDown className='size-3' />
                                </PopoverTrigger>
                                <PopoverContent className='max-w-44'>
                                    <div className='flex flex-col gap-1'>
                                        <div className='flex-between gap-2'>
                                            <span className='text-xs'>Day Charge</span>
                                            <span className='text-left text-xs'>{dayCost}</span>
                                        </div>
                                        <div className='flex-between gap-2'>
                                            <span className='text-xs'>Discount</span>
                                            <span className='text-left text-xs'>{discount}</span>
                                        </div>
                                        <div className='flex-between gap-2'>
                                            <span className='text-xs'>Concession</span>
                                            <span className='text-left text-xs'>{concession}</span>
                                        </div>
                                        <div className='flex-between gap-2'>
                                            <span className='text-xs'>Registration</span>
                                            <span className='text-left text-xs'>{registrationFee}</span>
                                        </div>
                                        <div className='flex-between gap-2'>
                                            <span className='text-xs'>Surcharge</span>
                                            <span className='text-left text-xs'>{surCharge}</span>
                                        </div>
                                        <div className='flex-between gap-2 md:hidden'>
                                            <span className='text-xs'>Tax</span>
                                            <span className='text-left text-xs'>{tax}</span>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <div className=' text-wrap text-muted-foreground text-xs md:hidden'>
                                {row.isRentalChargesRefund ? 'Refunded' : getCollectionStatus(row?.collectionStatusId)} {statusDate}
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className='hidden text-left md:table-cell'>{tax}</TableCell>
                    <TableCell className='hidden text-left md:table-cell'>{total}</TableCell>
                    <TableCell className='hidden text-left md:table-cell'>
                        <span>{row.isRentalChargesRefund ? 'Refunded' : getCollectionStatus(row?.collectionStatusId)}</span>
                        <br />
                        <span className='text-muted-foreground text-xs'>{statusDate}</span>
                    </TableCell>
                </TableRow>
            );
        });
    }

    function renderReviewStep() {
        return (
            <>
                <p className='text-muted-foreground text-sm'>Please review the details carefully before confirming.</p>

                <div className='flex flex-col '>
                    <div className='mt-5 flex flex-col gap-2'>
                        {selectedCharges.map((charge, index) => {
                            const formattedDate = formatDateAndTime(charge?.rentalDate, zipcode, 'DD MMM YYYY');
                            return (
                                <div key={index} className='flex items-center justify-between'>
                                    <span>Rental Charges ({formattedDate})</span>
                                    <span>{currencyFormatter(charge.total)}</span>
                                </div>
                            );
                        })}
                    </div>
                    <hr />
                    <div className=' ml-auto flex items-center gap-2 '>
                        Total Refund Amount :<p className='font-bold text-lg'>{currencyFormatter(selectedRefund)}</p>
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='message' className='font-semibold'>
                            Message <span className='font-normal text-muted-foreground'>(Optional)</span>
                        </Label>
                        <Textarea value={message} id='message' onChange={(e) => setMessage(e.target.value)} rows={2} />
                    </div>
                </div>
            </>
        );
    }

    function openDialog() {
        setOpen(true);
        setStep('select');
    }

    function closeDialog() {
        setChargeRows(
            (fullTripResponse?.rentalCharges || [])
                ?.map((row: ChargeRows) => ({ ...row, checked: false }))
                .sort((a: any, b: any) => a.label.localeCompare(b.label)) || []
        );
        setMessage('');
        setStep('select');
        setOpen(false);
    }

    return (
        <>
            <div onClick={() => setOpen(true)} className='dropdown-item'>
                Initiate Refund
            </div>

            {open && (
                <AdaptiveDialog
                    isOpen={open}
                    onClose={closeDialog}
                    title={step === 'select' ? 'Initiate Refund' : 'Review Refund'}
                    className='sm:w-[70%] sm:max-w-full'>
                    <AdaptiveBody>
                        {step === 'select' ? (
                            <div>
                                <div className='mb-5 flex w-full flex-col items-center gap-2 md:flex-row md:items-end md:justify-around'>
                                    <div className='flex-between gap-10 border-2 px-3 py-2'>
                                        <span>Eligible Refund Amount</span>
                                        <b>{currencyFormatter(displayEligibles)}</b>
                                    </div>

                                    <div className='flex gap-10 text-sm'>
                                        <span>Selected Refund Amount</span>
                                        <b>{currencyFormatter(selectedRefund)}</b>
                                    </div>
                                </div>

                                <Table className='rounded-lg border'>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead />
                                            <TableHead>Description</TableHead>
                                            <TableHead className='text-left'>Details</TableHead>
                                            <TableHead className='hidden text-left md:table-cell'>Tax</TableHead>
                                            <TableHead className='hidden text-left md:table-cell'>Total</TableHead>
                                            <TableHead className='hidden text-left md:table-cell'>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>{renderRentalTripLedgerRows(chargeRows)}</TableBody>
                                </Table>
                            </div>
                        ) : (
                            renderReviewStep()
                        )}
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='outline' onClick={step === 'select' ? closeDialog : () => setStep('select')} size='sm'>
                            {step === 'select' ? 'Cancel' : 'Back'}
                        </Button>

                        <Button
                            onClick={step === 'select' ? () => setStep('review') : refund}
                            disabled={!selectedIds.length}
                            loading={isSubmitting}
                            size='sm'>
                            {step === 'select' ? 'Review Refund' : 'Confirm Refund'}
                        </Button>
                    </AdaptiveFooter>
                </AdaptiveDialog>
            )}
        </>
    );
}
