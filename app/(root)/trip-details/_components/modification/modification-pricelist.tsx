'use client';
import { Button } from '@/components/ui/extension/button';
import { Popover, PopoverDialog, PopoverTrigger } from '@/components/ui/extension/popover';
import { convertToTimeZoneISO, formatDateAndTime, roundToTwoDecimalPlaces } from '@/lib/utils';
import { IoInformationCircleOutline } from 'react-icons/io5';

interface TripModificationPriceListComponentProps {
    pricelist: any;
    zipCode: string;
    newStartDate: string | null;
    newEndDate: string | null;
    newStartTime: string;
    newEndTime: string;
    originalTripTaxAmount: number;
    isExtension: boolean;
    isAirportDeliveryChoosen: boolean;
    isCustomDeliveryChoosen: boolean;
}

export default function TripModificationPriceListComponent({
    pricelist,
    zipCode,
    newStartDate,
    newEndDate,
    newStartTime,
    newEndTime,
    originalTripTaxAmount,
    isExtension,
    isAirportDeliveryChoosen,
    isCustomDeliveryChoosen
}: TripModificationPriceListComponentProps) {
    let differenceAmount = 0;

    if (isExtension) differenceAmount = pricelist?.tripTaxAmount - originalTripTaxAmount;
    else differenceAmount = originalTripTaxAmount - pricelist?.tripTaxAmount;

    const startDateISO = convertToTimeZoneISO(`${newStartDate}T${newStartTime}`, zipCode);
    const endDateISO = convertToTimeZoneISO(`${newEndDate}T${newEndTime}`, zipCode);

    const tripStart = {
        date: formatDateAndTime(startDateISO, zipCode, 'MMM DD, YYYY '),
        time: formatDateAndTime(startDateISO, zipCode, 'h:mm A z')
    };
    const tripEnd = {
        date: formatDateAndTime(endDateISO, zipCode, 'MMM DD, YYYY '),
        time: formatDateAndTime(endDateISO, zipCode, 'h:mm A z')
    };

    return (
        <div className='w-full space-y-2'>
            <p className='font-semibold '>New Trip Summary</p>
            <div className='flex flex-col justify-center gap-3 rounded-lg bg-primary/5 p-2 '>
                <div className='flex w-full justify-between gap-2 p-4 pb-0'>
                    <div>
                        <p className='text-center '>{tripStart.date}</p>
                        <p className='text-center '>{tripStart.time}</p>
                    </div>

                    <div className='size-12 flex-center whitespace-nowrap rounded-full bg-primary/60 font-semibold text-white'>To</div>
                    <div>
                        <p className='text-center '>{tripEnd.date}</p>
                        <p className='text-center '>{tripEnd.time}</p>
                    </div>
                </div>

                {pricelist?.numberOfDays > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <p>Trip Duration</p>
                        <p>
                            {pricelist.numberOfDays} {pricelist.numberOfDays === 1 ? 'Day' : 'Days'}
                        </p>
                    </div>
                )}

                {pricelist?.charges > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <p>
                            Rental (${pricelist?.pricePerDay} X {pricelist?.numberOfDays}
                            {pricelist.numberOfDays === 1 ? 'Day' : 'Days'})
                        </p>
                        <p>${roundToTwoDecimalPlaces(pricelist?.charges)}</p>
                    </div>
                )}

                {(isAirportDeliveryChoosen || isCustomDeliveryChoosen) && (
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <div className='flex items-center gap-1'>
                            <p>Additional services chosen</p>
                            <PopoverTrigger>
                                <Button variant='ghost' className=' h-fit w-fit p-0' type='button'>
                                    <IoInformationCircleOutline className='size-5 text-neutral-600' />
                                </Button>
                                <Popover className='w-64'>
                                    <PopoverDialog className='space-y-2'>
                                        <div className='grid select-none gap-4'>
                                            <p className='font-medium text-muted-foreground leading-none'> Additional services chosen</p>
                                            <div className='space-y-1'>
                                                <div className='flex items-center justify-between'>
                                                    <div className='text-sm'>
                                                        {isAirportDeliveryChoosen ? 'Airport Delivery fee' : 'Custom Delivery fee'}
                                                    </div>
                                                    <div className='font-medium text-sm'>
                                                        ${roundToTwoDecimalPlaces(pricelist?.delivery)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </PopoverDialog>
                                </Popover>
                            </PopoverTrigger>
                        </div>
                        <div className='font-medium '>${roundToTwoDecimalPlaces(pricelist?.delivery)}</div>
                    </div>
                )}

                {pricelist?.numberOfDaysDiscount > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2 '>
                        <div className='flex items-center gap-1 text-xs'>
                            <p>Discount</p>
                            <span>
                                <PopoverTrigger>
                                    <Button variant='ghost' className=' flex h-fit w-fit items-center p-0' type='button'>
                                        <IoInformationCircleOutline className='size-5 text-neutral-600' />
                                    </Button>
                                    <Popover className='w-68'>
                                        <PopoverDialog className='space-y-2'>
                                            <div className='grid select-none gap-4'>
                                                <div className='space-y-2'>
                                                    <p className='font-medium text-muted-foreground leading-none'>Discount</p>
                                                </div>
                                                <div className='space-y-1'>
                                                    {pricelist?.discountAmount > 0 && (
                                                        <div className='flex items-center justify-between'>
                                                            <div className='text-sm'>
                                                                {pricelist?.numberOfDaysDiscount} Day Discount applied -
                                                                {roundToTwoDecimalPlaces(pricelist?.discountPercentage)} %
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </PopoverDialog>
                                    </Popover>
                                </PopoverTrigger>
                            </span>
                        </div>
                        <div className='font-medium text-green-500'>${roundToTwoDecimalPlaces(pricelist?.discountAmount)}</div>
                    </div>
                )}

                {pricelist?.upcharges > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <p>Short notice rental fee</p>
                        <p>${pricelist?.upcharges}</p>
                    </div>
                )}

                {(pricelist?.tripFee > 0 ||
                    pricelist?.concessionFee > 0 ||
                    pricelist?.statesurchargeamount > 0 ||
                    pricelist?.registrationRecoveryFee > 0) && (
                    <div className='flex items-center justify-between gap-2 px-2 '>
                        <div className='flex items-center gap-1'>
                            <p>Trip Fee</p>
                            <span>
                                <PopoverTrigger>
                                    <Button variant='ghost' className=' flex h-fit w-fit items-center p-0' type='button'>
                                        <IoInformationCircleOutline className='size-5 text-neutral-600' />
                                    </Button>
                                    <Popover className='w-[300px]'>
                                        <PopoverDialog className='space-y-2'>
                                            <div className='grid select-none gap-4'>
                                                <div className='space-y-2'>
                                                    <p className='font-medium text-muted-foreground leading-none'>Trip Fee</p>
                                                </div>
                                                <div className='space-y-1'>
                                                    {pricelist?.concessionCalculated > 0 && (
                                                        <div className='flex items-center justify-between'>
                                                            <div className='text-sm'>Airport concession recovery fee</div>
                                                            <div className='font-medium text-sm'>
                                                                ${roundToTwoDecimalPlaces(pricelist?.concessionCalculated)}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {pricelist?.stateSurchargeAmount > 0 && (
                                                        <div className='flex items-center justify-between'>
                                                            <div className='text-sm'>State Surcharge </div>
                                                            <div className='font-medium text-sm'>
                                                                ${roundToTwoDecimalPlaces(pricelist?.stateSurchargeAmount)}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {pricelist?.registrationRecoveryFee > 0 && (
                                                        <div className='flex items-center justify-between'>
                                                            <div className='text-sm'>Vehicle licensing recovery fee </div>
                                                            <div className='font-medium text-sm'>
                                                                ${roundToTwoDecimalPlaces(pricelist?.registrationRecoveryFee)}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {pricelist?.tripFee > 0 && (
                                                        <div className='flex items-center justify-between'>
                                                            <div className='text-sm'>Platform fee </div>
                                                            <div className='font-medium text-sm'>
                                                                ${roundToTwoDecimalPlaces(pricelist?.tripFee)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </PopoverDialog>
                                    </Popover>
                                </PopoverTrigger>
                            </span>
                        </div>
                        <div className=' '>
                            $
                            {roundToTwoDecimalPlaces(
                                pricelist?.concessionFee +
                                    pricelist?.stateSurchargeAmount +
                                    pricelist?.registrationRecoveryFee +
                                    pricelist?.tripFee
                            )}
                        </div>
                    </div>
                )}

                {pricelist?.taxAmount > 0 && (
                    <div className='flex items-center justify-between gap-2 px-2'>
                        <p>Sales Taxes ({pricelist?.taxPercentage}%)</p>
                        <p>${roundToTwoDecimalPlaces(pricelist?.taxAmount)}</p>
                    </div>
                )}

                {pricelist?.tripTaxAmount > 0 && (
                    <div className='flex w-full items-center justify-between border-foreground/40 border-t px-2 pt-2'>
                        <p className='font-bold '> New Rental Charges</p>
                        <p className='font-bold '>${roundToTwoDecimalPlaces(pricelist?.tripTaxAmount)}</p>
                    </div>
                )}

                <div className='flex w-full items-center justify-between border-foreground/40 border-t px-2 pt-2'>
                    <p className='font-bold '>Trip Cost Difference</p>
                    <p className='font-bold '>
                        {Math.round(differenceAmount) === 0 ? '' : isExtension ? '+' : '-'} $
                        {Math.abs(Number(roundToTwoDecimalPlaces(Number(differenceAmount))))}
                    </p>
                </div>
            </div>
        </div>
    );
}
