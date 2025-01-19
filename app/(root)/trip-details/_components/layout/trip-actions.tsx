'use client';

import AcceptTripCancellationDialog from '@/components/extra/trip-accept-calcellation';
import TripApproveDialog from '@/components/extra/trip-approve-dialog';
import TripCompleteDialog from '@/components/extra/trip-complete-dialog';
import TripRejectDialog from '@/components/extra/trip-reject-dialog';
import TripStartDialog from '@/components/extra/trip-start-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PAGE_ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import type { Trip } from '@/types';
import { ArrowLeftRight, MoreVertical } from 'lucide-react';
import { useCallback, useState } from 'react';
import TripModificationDialog from '../modification/trip-modification-dialog';
import TripExtraChargesDialog from './trip-extra-charges-dialog';

interface TripActionsProps {
    className?: string;
    trip: Trip;
}

function TripActionButtons({ trip, isMobile, onActionComplete }: { trip: Trip; isMobile?: boolean; onActionComplete?: () => void }) {
    const renderButton = (content: React.ReactNode) => (isMobile ? <DropdownMenuItem asChild>{content}</DropdownMenuItem> : content);

    return (
        <>
            {['TRCOM', 'RECAN', 'REREJ'].includes(trip?.statusCode) === false && renderButton(<TripModificationDialog tripData={trip} />)}

            {['TRCOM'].includes(trip?.statusCode) &&
                renderButton(
                    <TripExtraChargesDialog
                        tripId={trip.tripid}
                        extraDayCharges={trip.tripPaymentTokens[0]?.extraDayCharges}
                        lateFee={trip.tripPaymentTokens[0]?.lateFee}
                        extraMileCost={trip.tripPaymentTokens[0]?.extraMileageCost}
                        buttonText='Extra Charges'
                        onActionComplete={onActionComplete}
                    />
                )}

            {['REREQ', 'REAPP', 'TRSTR'].includes(trip?.statusCode) &&
                renderButton(
                    <Button
                        href={`${PAGE_ROUTES.TRIP_DETAILS}/${trip.tripid}${PAGE_ROUTES.TRIP_DETAILS_SWAP}`}
                        variant='ghost'
                        type='button'
                        className='font-semibold text-neutral-700 dark:text-neutral-300'>
                        <ArrowLeftRight className='size-5' />
                        Swap Vehicle
                    </Button>
                )}

            {['REREQ'].includes(trip?.statusCode) &&
                renderButton(<TripRejectDialog tripId={trip.tripid} buttonText='Reject Trip' onActionComplete={onActionComplete} />)}

            {['REAPP'].includes(trip?.statusCode) &&
                renderButton(<TripRejectDialog tripId={trip.tripid} buttonText='Cancel Trip' onActionComplete={onActionComplete} />)}

            {['RECANREQ'].includes(trip?.statusCode) &&
                renderButton(
                    <AcceptTripCancellationDialog
                        tripId={trip.tripid}
                        buttonText='Accept Cancellation'
                        onActionComplete={onActionComplete}
                    />
                )}

            {['REREQ'].includes(trip?.statusCode) &&
                renderButton(
                    <TripApproveDialog
                        tripId={trip.tripid}
                        debitOrCreditCard={trip.isDebitCard ? 'debit' : 'credit'}
                        defaultDepositToBeCollectedFlag={trip.depositToBeCollected}
                        buttonText='Approve Trip'
                        onActionComplete={onActionComplete}
                    />
                )}

            {['REAPP'].includes(trip?.statusCode) &&
                renderButton(
                    <TripStartDialog
                        tripId={trip.tripid}
                        isRentalAgreed={trip.isRentalAgreed}
                        isInsuranceVerified={trip.isInsuranceVerified}
                        isLicenceVerified={trip.isLicenseVerified}
                        isPhoneVerified={trip.isPhoneVarified}
                        buttonText='Start Trip'
                        onActionComplete={onActionComplete}
                    />
                )}

            {['TRSTR'].includes(trip?.statusCode) &&
                renderButton(
                    <TripCompleteDialog
                        tripId={trip.tripid}
                        captureAmount={trip?.tripPaymentTokens[0]?.tripTaxAmount + trip.deductionAmount}
                        buttonText='End Trip'
                        onActionComplete={onActionComplete}
                    />
                )}
        </>
    );
}

export function TripActions({ className, trip }: TripActionsProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleActionComplete = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <div className={cn('flex items-center gap-2', className)}>
            {/* Desktop Actions */}
            <div className='hidden items-center gap-2 md:flex'>
                <span className='sr-only'>Trip Actions</span>
                <TripActionButtons trip={trip} />
            </div>

            {/* Mobile Actions */}
            <div className='md:hidden'>
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon'>
                            <MoreVertical className='h-5 w-5' />
                            <span className='sr-only'>Trip Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <TripActionButtons trip={trip} isMobile onActionComplete={handleActionComplete} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
