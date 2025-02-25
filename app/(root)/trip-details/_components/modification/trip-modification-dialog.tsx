'use client';

import { PriceCalculatedListSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import useAvailabilityDates from '@/hooks/useAvailabilityDates';
import { validateBookingTime } from '@/hooks/useVehicles';
import { cn, convertToTimeZoneISO, formatDateAndTime, formatTime, roundToTwoDecimalPlaces } from '@/lib/utils';
import { calculatePrice } from '@/server/priceCalculation';
import type { Trip } from '@/types';
import { differenceInHours, format, isBefore, isEqual, isWithinInterval, parseISO } from 'date-fns';
import { FilePenLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import TripModificationResult from './TripModificationResult';
import TripModificationPriceListComponent from './modification-pricelist';
import TimeSelect from './time-select';
import { TripModificationEndDateCalendar, TripModificationStartDateCalendar } from './trip-modification-calendars';
import useTripModificationDialog from './useTripModificatonDialog';

import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/components/ui/extension/dialog';
import useTripModification from '@/hooks/useTripModification';

export default function TripModificationDialog({ tripData }: { tripData: Trip }) {
    const tripModificationModal = useTripModificationDialog();

    const [newStartDate, setNewStartDate] = useState<string | null>(null);
    const [newEndDate, setNewEndDate] = useState<string | null>(null);

    const [newStartTime, setNewStartTime] = useState('10:00:00');
    const [newEndTime, setNewEndTime] = useState('10:00:00');

    const [isExtension, setIsExtension] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(false);

    const [priceLoading, setPriceLoading] = useState(false);
    const [priceCalculatedList, setPriceCalculatedList] = useState(null);
    const [priceError, setPriceError] = useState('');

    const { unavailableDates, unformattedDates } = useAvailabilityDates(tripData.vehicleId, tripData.reservationid, tripData?.vehzipcode);

    const [dateSelectionError, setDateSelectionError] = useState('');

    // Initialization
    useEffect(() => {
        setNewStartDate(formatDateAndTime(tripData.starttime, tripData?.vehzipcode, 'YYYY-MM-DD'));
        setNewEndDate(formatDateAndTime(tripData.endtime, tripData?.vehzipcode, 'YYYY-MM-DD'));
        setNewStartTime(formatTime(tripData.starttime, tripData?.vehzipcode));
        setNewEndTime(formatTime(tripData.endtime, tripData?.vehzipcode));
    }, []);

    // Price Calculation
    useEffect(() => {
        if (!isInitialLoad && newStartDate && newEndDate && newStartTime && newEndTime) {
            getPriceCalculation();
        } else {
            setIsInitialLoad(true);
        }
    }, [newStartDate, newEndDate, newStartTime, newEndTime, isInitialLoad]);

    async function getPriceCalculation() {
        try {
            const originalStartDateTime = `${format(formatDateAndTime(tripData.starttime, tripData?.vehzipcode, 'yyyy-MM-DD'), 'yyyy-MM-dd')}T${formatTime(tripData.starttime, tripData?.vehzipcode)}`;
            const originalEndDateTime = `${format(formatDateAndTime(tripData.endtime, tripData?.vehzipcode, 'yyyy-MM-DD'), 'yyyy-MM-dd')}T${formatTime(tripData.endtime, tripData?.vehzipcode)}`;
            const parsedOriginalStartDate = parseISO(originalStartDateTime);
            const parsedOriginalEndDate = parseISO(originalEndDateTime);
            const parsedNewStartDate = parseISO(`${newStartDate}T${newStartTime}`);
            const parsedNewEndDate = parseISO(`${newEndDate}T${newEndTime}`);

            // check if the new start date and end date are not as same as the original start and end date
            if (isEqual(parsedNewStartDate, parsedOriginalStartDate) && isEqual(parsedNewEndDate, parsedOriginalEndDate)) {
                setPriceError('Please select a new start and end date that are different from the original start and end date.');
                return;
            }

            // Check if the new start date is not before the new end date
            if (!isBefore(parsedNewStartDate, parsedNewEndDate)) {
                setPriceError('Please select an end date that comes after the start date.');
                return;
            }

            // Don't check if the trip status is started
            if (!(tripData?.status.toLowerCase() === 'started')) {
                // check for short notice late night reservation
                const { isValid, error } = validateBookingTime(`${newStartDate}T${newStartTime}`);

                if (!isValid) {
                    throw new Error(error);
                }
            }

            // Check for any unavailable dates within the new date range
            //@ts-ignore
            const unAvailabilityDates = unformattedDates?.map((date) => parseISO(date));

            const hasUnavailableDate = unAvailabilityDates?.some((date: any) =>
                isWithinInterval(date, { start: parsedNewStartDate, end: parsedNewEndDate })
            );

            if (hasUnavailableDate) {
                setDateSelectionError('Some dates are unavailable. Please adjust your selection.');
                return;
            }

            const originalDiff = differenceInHours(parsedOriginalEndDate, parsedOriginalStartDate);
            const newDiff = differenceInHours(parsedNewEndDate, parsedNewStartDate);

            if (newDiff > originalDiff) {
                setIsExtension(true);
            } else {
                setIsExtension(false);
            }

            setPriceError('');
            setPriceLoading(true);
            setPriceCalculatedList(null);

            const payload = {
                vehicleid: tripData.vehicleId,
                startTime: convertToTimeZoneISO(`${newStartDate}T${newStartTime}`, tripData.vehzipcode),
                endTime: convertToTimeZoneISO(`${newEndDate}T${newEndTime}`, tripData.vehzipcode),
                airportDelivery: tripData.airportDelivery,
                customDelivery: tripData.delivery,
                hostid: tripData.hostid,
                tripid: tripData.tripid
            };

            // console.log(payload);
            const responseData = await calculatePrice(payload);

            if (responseData.success) {
                const data = responseData.data;
                setPriceCalculatedList(data.priceCalculatedList?.[0]);
            } else {
                setPriceError(responseData.message);
            }
        } catch (error: any) {
            console.error(error);
            setPriceError(error.message);
        } finally {
            setPriceLoading(false);
        }
    }

    function openModifiyDialog() {
        tripModificationModal.onOpen();
    }

    function closeModifyDialog() {
        // tripModificationModal.onClose();
        // setIsExtension(false);
        // setPriceCalculatedList(null);
        // setPriceError('');
        // setPriceLoading(false);
        // setDateSelectionError('');
        // setIsInitialLoad(true);
        // setNewStartDate(formatDateAndTime(tripData.starttime, tripData?.vehzipcode, 'default'));
        // setNewEndDate(formatDateAndTime(tripData.endtime, tripData?.vehzipcode, 'default'));
        // setNewStartTime(formatTime(tripData.starttime, tripData?.vehzipcode));
        // setNewEndTime(formatTime(tripData.endtime, tripData?.vehzipcode));
        // if (submitted) {
        // }
        window.location.reload();
    }

    const { submitting, handleTripModification } = useTripModification();

    function handleSubmit() {
        const payload = {
            type: isExtension ? 'extension' : 'reduction',
            tripid: tripData.tripid,
            vehzipcode: tripData.vehzipcode,
            newStartDate,
            newEndDate,
            newStartTime,
            newEndTime,
            priceCalculatedList,
            paymentMethod: null
        };

        handleTripModification(payload);
    }

    return (
        <>
            <Button
                variant='ghost'
                type='button'
                onClick={openModifiyDialog}
                className='font-semibold text-neutral-700 dark:text-neutral-300'>
                <FilePenLine className='size-5' /> Modify Trip
            </Button>

            {tripModificationModal.isOpen && (
                <Dialog>
                    <DialogOverlay isDismissable={false} onOpenChange={closeModifyDialog} isOpen={tripModificationModal.isOpen}>
                        <DialogContent
                            role='alertdialog'
                            className={cn('p-4', tripModificationModal.submitted ? 'lg:max-w-lg' : 'lg:max-w-[1000px]')}>
                            <DialogHeader>
                                <DialogTitle className='text-left' aria-labelledby='modification-dialog-title'>
                                    {tripModificationModal.submitted ? '' : 'Modify Trip Date Time'}
                                </DialogTitle>
                            </DialogHeader>
                            {!tripModificationModal.submitted ? (
                                <>
                                    <AdaptiveBody>
                                        <p className='-mt-2 text-muted-foreground text-sm'>
                                            Please select new dates and times for the trip below and may change the total trip cost
                                        </p>
                                        <div className='mt-2 grid grid-cols-1 gap-4 md:gap-7 lg:grid-cols-2'>
                                            <div className='w-full'>
                                                <div className='w-full space-y-3'>
                                                    <p className='font-semibold text-14'>Current Trip Summary</p>
                                                    <div className='flex w-full flex-col items-center justify-center gap-4 rounded-lg bg-primary/10 p-2 lg:p-4'>
                                                        <div className='flex w-full justify-between gap-2 '>
                                                            <div className='text-center text-14'>
                                                                {splitFormattedDateAndTime(
                                                                    formatDateAndTime(tripData.starttime, tripData.vehzipcode)
                                                                )}
                                                            </div>
                                                            <div className='size-12 flex-center whitespace-nowrap rounded-full bg-primary/60 font-semibold text-white'>
                                                                To
                                                            </div>
                                                            <div className='text-center text-14'>
                                                                {splitFormattedDateAndTime(
                                                                    formatDateAndTime(tripData.endtime, tripData.vehzipcode)
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='text-14 '>
                                                            Trip duration: {tripData.tripPaymentTokens[0]?.totaldays}
                                                            {tripData?.tripPaymentTokens[0]?.totaldays === 1 ? 'Day' : 'Days'}
                                                        </div>
                                                        <div className='flex w-full items-center justify-between border-black/40 border-t px-2 pt-2'>
                                                            <p className='font-bold text-14'>Total Rental Charges</p>
                                                            <p className='font-bold text-14'>
                                                                ${roundToTwoDecimalPlaces(tripData?.tripPaymentTokens[0]?.tripTaxAmount)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='mt-3 flex w-full flex-col gap-2 text-sm'>
                                                    <div className=' flex items-center gap-3 p-1'>
                                                        <div className='flex w-full flex-1 flex-col gap-3'>
                                                            <Label className='font-semibold text-14'>New Start Date</Label>
                                                            <TripModificationStartDateCalendar
                                                                unavailableDates={unavailableDates}
                                                                isTripStarted={tripData.status.toLowerCase() === 'started'}
                                                                date={newStartDate}
                                                                setDate={setNewStartDate}
                                                                setIsInitialLoad={setIsInitialLoad}
                                                                isDisabled={tripData.status.toLowerCase() === 'started'}
                                                                setDateSelectionError={setDateSelectionError}
                                                            />
                                                        </div>
                                                        <TimeSelect
                                                            label='New Start Time'
                                                            isDisabled={tripData.status.toLowerCase() === 'started'}
                                                            defaultValue={formatTime(tripData.starttime, tripData?.vehzipcode)}
                                                            onChange={(time: any) => {
                                                                setNewStartTime(time);
                                                                setIsInitialLoad(false);
                                                            }}
                                                        />
                                                    </div>
                                                    <div className=' flex items-center gap-3 p-1'>
                                                        <div className='flex w-full flex-1 flex-col gap-3'>
                                                            <Label className='font-semibold text-14'>New End Date</Label>
                                                            <TripModificationEndDateCalendar
                                                                unavailableDates={unavailableDates}
                                                                date={newEndDate}
                                                                setDate={setNewEndDate}
                                                                isTripStarted={tripData.status.toLowerCase() === 'started'}
                                                                setIsInitialLoad={setIsInitialLoad}
                                                                isDisabled={false}
                                                                setDateSelectionError={setDateSelectionError}
                                                                newStartDate={newStartDate}
                                                            />
                                                        </div>
                                                        <TimeSelect
                                                            label='New End Time'
                                                            defaultValue={formatTime(tripData.endtime, tripData?.vehzipcode)}
                                                            onChange={(time: any) => {
                                                                setNewEndTime(time);
                                                                setIsInitialLoad(false);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {dateSelectionError ||
                                                    (priceError && (
                                                        <div className='mt-2 flex gap-2'>
                                                            <IoInformationCircleOutline className='text-destructive' />
                                                            <p className='font-normal text-destructive text-xs'>
                                                                {dateSelectionError || priceError}
                                                            </p>
                                                        </div>
                                                    ))}
                                            </div>
                                            <div className='flex flex-col gap-4 '>
                                                {!priceError ? (
                                                    <div>
                                                        {priceLoading ? (
                                                            <div className='mt-4 text-center'>
                                                                <PriceCalculatedListSkeleton />
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                {priceCalculatedList && !dateSelectionError && (
                                                                    <TripModificationPriceListComponent
                                                                        pricelist={priceCalculatedList}
                                                                        newStartDate={newStartDate}
                                                                        newEndDate={newEndDate}
                                                                        newStartTime={newStartTime}
                                                                        newEndTime={newEndTime}
                                                                        zipCode={tripData?.vehzipcode}
                                                                        originalTripTaxAmount={
                                                                            tripData?.tripPaymentTokens[0]?.tripTaxAmount
                                                                        }
                                                                        isExtension={isExtension}
                                                                        isAirportDeliveryChoosen={tripData.airportDelivery}
                                                                        isCustomDeliveryChoosen={tripData.delivery}
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </AdaptiveBody>

                                    <AdaptiveFooter>
                                        <Button type='button' onClick={closeModifyDialog} variant='outline'>
                                            Keep Current & Close
                                        </Button>
                                        <Button
                                            type='button'
                                            onClick={handleSubmit}
                                            loading={submitting}
                                            disabled={priceLoading || !priceCalculatedList || Boolean(priceError) || submitting}
                                            className={`bg-primary ${dateSelectionError || priceLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
                                            Save Changes
                                        </Button>
                                    </AdaptiveFooter>
                                </>
                            ) : (
                                <TripModificationResult
                                    success={tripModificationModal.success}
                                    onClose={closeModifyDialog}
                                    message={tripModificationModal.message}
                                />
                            )}
                        </DialogContent>
                    </DialogOverlay>
                </Dialog>
            )}
        </>
    );
}

export function splitFormattedDateAndTime(input: string) {
    const parts = input.split(' | ');
    if (parts.length !== 2) {
        return input;
    }
    const [datePart, timePart] = parts;
    return (
        <div>
            {datePart}
            <br />
            {timePart}
        </div>
    );
}
