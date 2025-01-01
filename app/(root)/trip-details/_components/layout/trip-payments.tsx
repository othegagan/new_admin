'use client';

import { roundToTwoDecimalPlaces } from '@/lib/utils';
import type { Trip } from '@/types';

interface TripPaymentsProps {
    trip: Trip;
}

export default function TripPayments({ trip }: TripPaymentsProps) {
    const pricelist = trip?.tripPaymentTokens[0];

    const isAirportDeliveryChoosen = trip.airportDelivery;

    return (
        <div className='flex flex-col gap-5 pb-5'>
            <div className='flex-between gap-4'>
                <h4>Payments</h4>
                <div className='w-fit rounded font-medium text-primary text-sm lg:text-[14px]'>Manage Payments</div>
            </div>
            {trip?.cardDetails?.length > 0 && (
                <div className='font-normal text-muted-foreground text-sm'>
                    Paid using <span className='capitalize'>{trip?.cardDetails[0]?.cardBrand}</span>(
                    {trip?.cardDetails[0]?.cardType === 'debit' ? 'Debit Card' : 'Credit Card'}) ending in
                    <span className='text-[20px]'> ••••</span> {trip?.cardDetails[0]?.last4Digit}
                </div>
            )}

            <div className='w-full space-y-2'>
                {/* Rental Charges */}
                {pricelist?.charges > 0 && (
                    <PriceItem
                        label={`Rental ($${pricelist?.perdayamount} x ${pricelist?.totaldays} ${pricelist?.totaldays === 1 ? 'day' : 'days'})`}
                        value={pricelist?.charges}
                    />
                )}

                {pricelist?.tripFee > 0 && <PriceItem label='Platform fee  ' value={pricelist?.tripFee} />}

                {/* Short Notice Fee */}
                {pricelist?.upCharges > 0 && <PriceItem label='Short notice rental fee' value={pricelist?.upCharges} />}

                {/* Trip Fee */}
                {(pricelist?.concessionCalculated || pricelist?.concessionFee) > 0 && (
                    <PriceItem
                        label='Airport concession recovery fee'
                        value={pricelist?.concessionCalculated || pricelist?.concessionFee}
                    />
                )}

                {/* Additional Services */}
                {pricelist?.deliveryCost > 0 && (
                    <PriceItem
                        label={isAirportDeliveryChoosen ? 'Airport Delivery Fee' : 'Custom Delivery Fee'}
                        value={pricelist?.deliveryCost}
                    />
                )}

                {pricelist?.Statesurchargeamount > 0 && <PriceItem label='State Surcharge' value={pricelist?.Statesurchargeamount} />}

                {pricelist?.registrationRecoveryFee > 0 && (
                    <PriceItem label='Vehicle licensing recovery fee ' value={pricelist?.registrationRecoveryFee} />
                )}

                {/* Extra Mileage Cost */}
                {pricelist?.extraMileageCost > 0 && (
                    <PriceItem
                        label={`Extra mile cost (${roundToTwoDecimalPlaces(pricelist?.extraMilage)} miles)`}
                        value={pricelist?.extraMileageCost}
                    />
                )}

                {/* Late Fee */}
                {pricelist?.lateFee > 0 && <PriceItem label='Late Fee' value={pricelist?.lateFee} />}

                {/* Extra Day Charges */}
                {pricelist?.extraDayCharges > 0 && <PriceItem label='Extra Day charges' value={pricelist?.extraDayCharges} />}

                {/* Discount */}
                {pricelist?.numberOfDaysDiscount > 0 && pricelist?.discountAmount > 0 && (
                    <PriceItem
                        label={`Discount  ${roundToTwoDecimalPlaces(pricelist?.discountPercentage)} %`}
                        value={pricelist?.discountAmount}
                    />
                )}

                {/* Sales Taxes */}
                {pricelist?.taxAmount > 0 && (
                    <PriceItem label={`Sales Taxes (${roundToTwoDecimalPlaces(pricelist?.taxPercentage)}%)`} value={pricelist?.taxAmount} />
                )}

                {/* Refund Amount */}
                {pricelist?.refundAmount > 0 && <PriceItem label='Refund ' value={pricelist?.refundAmount} sign='-' />}
                <hr />
                {/* Total Rental Charge */}
                <div className='flex items-center justify-between font-bold'>
                    <div>Total Rental Charge</div>
                    <div className='font-medium tracking-wide'>
                        {pricelist?.tripTaxAmount < 0 ? '-' : ''} ${roundToTwoDecimalPlaces(pricelist?.tripTaxAmount)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PriceItem({
    label,
    value,
    sign = '',
    children
}: {
    label: string;
    value: string | number;
    sign?: string;
    children?: React.ReactNode;
}) {
    const formattedValue =
        value === null || value === ''
            ? 'N/A' // Handle empty or null values
            : Number(value) < 0
              ? `- ${sign}$${roundToTwoDecimalPlaces(Math.abs(Number(value)))}`
              : `${sign} $${roundToTwoDecimalPlaces(Number(value))}`;

    return (
        <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1'>
                {label}
                {children}
            </div>
            <div className='font-normal tracking-wide'>{formattedValue}</div>
        </div>
    );
}
