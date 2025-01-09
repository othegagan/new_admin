'use client';

import type { Trip } from '@/types';
import CollectedCharges from './collected-charges';
import Ledge from './ledger';
import { PriceList } from './price-list';

interface TripPaymentsProps {
    fullTripResponse: any;
}

export default function TripPayments({ fullTripResponse }: TripPaymentsProps) {
    const trip: Trip = fullTripResponse.activetripresponse[0];
    const pricelist = trip?.tripPaymentTokens[0];

    const isAirportDeliveryChoosen = trip.airportDelivery;

    return (
        <div className='flex flex-col gap-4 pb-5'>
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

            <PriceList pricelist={pricelist} isAirportDeliveryChoosen={isAirportDeliveryChoosen} />

            <CollectedCharges processedPayments={fullTripResponse.processedPayments} zipcode={trip.vehzipcode} />

            <Ledge fullTripResponse={fullTripResponse} />
        </div>
    );
}
