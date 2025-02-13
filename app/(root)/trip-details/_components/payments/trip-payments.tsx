'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LATEST_TRIP_VERSION } from '@/constants';
import type { RentalCharge, Trip } from '@/types';
import ChargeManuallyDialog from './charge-manually';
import CollectDepositDialog from './collect-deposit';
import CollectedCharges from './collected-charges';
import Ledge from './ledger';
import PendingCharges from './pending-charges';
import { PriceList } from './price-list';
import RefundDialog from './refund-dialog';
import ReleaseDepositDialog from './release-deposit';

interface TripPaymentsProps {
    fullTripResponse: any;
}

export default function TripPayments({ fullTripResponse }: TripPaymentsProps) {
    const trip: Trip = fullTripResponse.activetripresponse[0];
    const pricelist = trip?.tripPaymentTokens[0];

    const asPendingPayments = fullTripResponse.pendingPayments && Object.keys(fullTripResponse.pendingPayments).length > 0;
    const asFailedPayments = fullTripResponse.failedPaymentLogs && Object.keys(fullTripResponse.failedPaymentLogs).length > 0;
    const showManualCharge = asPendingPayments || asFailedPayments;

    // const showDepositRelease =
    //     ['REREQ', 'RECAN', 'REREJ'].includes(trip?.statusCode) === false && trip?.version >= LATEST_TRIP_VERSION && trip?.depositCollected;

    // const showCollectDeposit =
    //     ['REAPP', 'TRSTR'].includes(trip?.statusCode) && trip?.version >= LATEST_TRIP_VERSION && !trip?.depositCollected;

    const showDepositRelease =
        !['REREQ', 'RECAN', 'REREJ'].includes(trip?.statusCode) &&
        (trip?.version >= LATEST_TRIP_VERSION ? trip?.depositCollected : trip?.tripPaymentTokens[0]?.releasedAmountOnHold > 0);

    const showCollectDeposit =
        ['REAPP', 'TRSTR'].includes(trip?.statusCode) &&
        (trip?.version >= LATEST_TRIP_VERSION ? !trip?.depositCollected : !(trip?.tripPaymentTokens[0]?.depositHoldAmount > 0));

    const rowsAlreadyCharged = fullTripResponse?.rentalCharges.map((row: RentalCharge) => {
        if (row.chargeAmount === 0.0) return null;

        // Exclude Debt, Collected and Discounted rows
        if (!(row.isDebt && row.collectionStatusId === 2 && !row.isDiscount)) {
            return null;
        }

        return row;
    });

    // Show refund option if there is any row that is already charged
    const showRefundOption = rowsAlreadyCharged.filter((row: RentalCharge) => row !== null).length;

    return (
        <div className='flex flex-col pb-5'>
            <div className='flex-between gap-4'>
                <h4>Payments</h4>
                <DropdownMenu>
                    <DropdownMenuTrigger className='w-fit rounded font-medium text-primary text-sm lg:text-[14px]'>
                        Manage Payments
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='flex flex-col p-2'>
                        {showManualCharge ? (
                            <DropdownMenuItem asChild>
                                <ChargeManuallyDialog
                                    pendingPayments={fullTripResponse.pendingPayments}
                                    failedPayments={fullTripResponse.failedPaymentLogs}
                                    zipcode={trip.vehzipcode}
                                    tripId={trip.tripid}
                                />
                            </DropdownMenuItem>
                        ) : null}

                        {showDepositRelease ? (
                            <DropdownMenuItem asChild>{<ReleaseDepositDialog tripId={trip.tripid} />}</DropdownMenuItem>
                        ) : null}

                        {showCollectDeposit ? (
                            <DropdownMenuItem asChild>
                                <CollectDepositDialog tripId={trip.tripid} />
                            </DropdownMenuItem>
                        ) : null}

                        {showRefundOption ? (
                            <DropdownMenuItem asChild>
                                <RefundDialog fullTripResponse={fullTripResponse} />
                            </DropdownMenuItem>
                        ) : null}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {trip?.cardDetails?.length > 0 && (
                <div className='my-4 font-normal text-muted-foreground text-sm'>
                    Paid using <span className='capitalize'>{trip?.cardDetails[0]?.cardBrand}</span>(
                    {trip?.cardDetails[0]?.cardType === 'debit' ? 'Debit Card' : 'Credit Card'}) ending in
                    <span className='text-[20px]'> ••••</span> {trip?.cardDetails[0]?.last4Digit}
                </div>
            )}

            <PriceList pricelist={pricelist} isAirportDeliveryChoosen={trip.airportDelivery} isCustomDeliveryChoosen={trip.delivery} />

            <CollectedCharges processedPayments={fullTripResponse.processedPayments} zipcode={trip.vehzipcode} />

            <PendingCharges pendingPayments={fullTripResponse.pendingPayments} zipcode={trip.vehzipcode} />

            <div className='h-7' />

            <Ledge fullTripResponse={fullTripResponse} />
        </div>
    );
}
