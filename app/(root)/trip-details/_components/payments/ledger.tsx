'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { currencyFormatter, formatDateAndTime } from '@/lib/utils';
import type { RentalCharge, TripChargeLedgerList } from '@/types';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';

interface LedgeProps {
    fullTripResponse: any;
}

interface CollectionStatus {
    id: number;
    statusName: string;
}

export default function Ledge({ fullTripResponse }: LedgeProps) {
    const zipcode = fullTripResponse?.activetripresponse[0]?.vehzipcode;

    const preTripChargeLedgerList = fullTripResponse?.tripChargeLedgerList.filter((charge: any) => charge.isPreTripCharge) || [];
    const postTripChargeLedgerList = fullTripResponse?.tripChargeLedgerList.filter((charge: any) => !charge.isPreTripCharge) || [];
    const rentalTripChargeLedgerList = (fullTripResponse?.rentalCharges || []).sort((a: any, b: any) => a.label.localeCompare(b.label));

    /**
     * Collection Status List
     * Status ID: 1, 2, 3, 4, 5, 6
     * Status Name: Future, Collected, Pending, Failed, Refunded, Deposit hold
     */

    const collectionStatusList: CollectionStatus[] = fullTripResponse.collectionStatusList;

    function getCollectionStatus(statusId: number) {
        return collectionStatusList.find((status: any) => status.id === statusId)?.statusName;
    }

    function renderPreTripLedgerRows(tripChargeLedgerList: TripChargeLedgerList[]) {
        return tripChargeLedgerList.map((row: TripChargeLedgerList) => {
            if (row.chargeAmount === 0.0) return null;

            const createdDateFormatted = formatDateAndTime(row?.createdDate, zipcode, 'MMM DD, YYYY, h:mm A');

            const sign = row.isDebt ? ' ' : '-';

            const amount = `${sign} $${row?.chargeAmount?.toFixed(2)}`;
            const concessionAmount = '0.00';
            const registrationAmount = '0.00';
            const surChargeAmount = '0.00';
            const taxAmount = `${sign} $${row?.chargeTax?.toFixed(2)}`;
            const totalAmount = `${sign} $${row?.chargeTotal?.toFixed(2)}`;

            const isPastDeadline = row?.collectionStatusId === 3 && row?.collectionDeadLine > row?.createdDate;
            const date = isPastDeadline ? row?.collectionDeadLine : row?.createdDate;
            const statusDate = formatDateAndTime(date, zipcode, 'MMM DD, YYYY, h:mm A');

            return (
                <TableRow key={row.id}>
                    <TableCell className='capitalize'>
                        <div>
                            {row.typeDescription}
                            <br />
                            <span className='text-muted-foreground text-xs '>
                                <span className='hidden md:inline-block'>Created on</span> {createdDateFormatted}
                            </span>
                        </div>
                    </TableCell>
                    <TableCell className='text-left'>
                        <div>
                            <Popover>
                                <PopoverTrigger className='flex-start gap-2'>
                                    <span className='hidden md:inline-block'> {amount}</span>
                                    <span className='md:hidden'>{totalAmount}</span>
                                    <ChevronDown className='size-3 md:hidden' />
                                </PopoverTrigger>
                                <PopoverContent className='max-w-44 md:hidden'>
                                    <div className='flex flex-col gap-1'>
                                        <div className='flex-between gap-2'>
                                            <span className='text-xs'>Day Charge</span>
                                            <span className='text-left text-xs'>{amount}</span>
                                        </div>
                                        <div className='flex-between gap-2'>
                                            <span className='text-xs'>Concession</span>
                                            <span className='text-left text-xs'>{concessionAmount}</span>
                                        </div>
                                        <div className='flex-between gap-2'>
                                            <span className='text-xs'>Registration</span>
                                            <span className='text-left text-xs'>{registrationAmount}</span>
                                        </div>
                                        <div className='flex-between gap-2'>
                                            <span className='text-xs'>Surcharge</span>
                                            <span className='text-left text-xs'>{surChargeAmount}</span>
                                        </div>
                                        <div className='flex-between gap-2 md:hidden'>
                                            <span className='text-xs'>Tax</span>
                                            <span className='text-left text-xs'>{taxAmount}</span>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <div className=' md:hidden'>
                                <span>{getCollectionStatus(row?.collectionStatusId)}</span>
                                <br />
                                <span className='text-muted-foreground text-xs'>{statusDate}</span>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className='hidden text-left md:table-cell'>{taxAmount}</TableCell>
                    <TableCell className='hidden text-left md:table-cell'>{totalAmount}</TableCell>
                    <TableCell className='hidden text-left md:table-cell'>
                        <span>{getCollectionStatus(row?.collectionStatusId)}</span>
                        <br />
                        <span className='text-muted-foreground text-xs'>{statusDate}</span>
                    </TableCell>
                </TableRow>
            );
        });
    }

    function renderRentalTripLedgerRows(rentalCharges: RentalCharge[]) {
        return rentalCharges.map((row: RentalCharge) => {
            if (row.chargeAmount === 0.0) return null;

            const createdDateFormatted = row.isDiscount
                ? formatDateAndTime(row?.createdDate, zipcode, 'MMM DD, YYYY, h:mm A')
                : format(row?.createdDate, 'PP, h:mm a');

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

            const isPastDeadline = row?.collectionStatusId === 3 && row?.collectionDeadLine > row?.createdDate;
            const date = isPastDeadline ? row?.collectionDeadLine : row?.createdDate;
            const statusDate = formatDateAndTime(date, zipcode, 'MMM DD, YYYY, h:mm A');

            return (
                <TableRow key={row.id}>
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
                            <div className=' md:hidden'>
                                <span>{getCollectionStatus(row?.collectionStatusId)}</span>
                                <br />
                                <span className='text-muted-foreground text-xs'>{statusDate}</span>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className='hidden text-left md:table-cell'>{tax}</TableCell>
                    <TableCell className='hidden text-left md:table-cell'>{total}</TableCell>
                    <TableCell className='hidden text-left md:table-cell'>
                        <span>{getCollectionStatus(row?.collectionStatusId)}</span>
                        <br />
                        <span className='text-muted-foreground text-xs'>{statusDate}</span>
                    </TableCell>
                </TableRow>
            );
        });
    }

    return (
        <Accordion type='single' collapsible>
            <AccordionItem value='payment-ledger' className='border-0'>
                <AccordionTrigger className='pb-0 font-semibold text-base tracking-wide hover:no-underline'>
                    <h4>Payment Ledger</h4>
                </AccordionTrigger>
                <AccordionContent className='pb-0'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className='text-left'>Amount</TableHead>
                                <TableHead className='hidden text-left md:table-cell'>Tax</TableHead>
                                <TableHead className='hidden text-left md:table-cell'>Total</TableHead>
                                <TableHead className='hidden text-left md:table-cell'>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {preTripChargeLedgerList?.length > 0 && renderPreTripLedgerRows(preTripChargeLedgerList)}
                            {rentalTripChargeLedgerList?.length > 0 && renderRentalTripLedgerRows(rentalTripChargeLedgerList)}
                            {postTripChargeLedgerList?.length > 0 && renderPreTripLedgerRows(postTripChargeLedgerList)}
                        </TableBody>
                    </Table>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
