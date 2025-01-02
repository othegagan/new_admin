import useTripModificationDialog from '@/app/(root)/trip-details/_components/modification/useTripModificatonDialog';
import { convertToTimeZoneISO } from '@/lib/utils';
import { createTripExtension, createTripReduction } from '@/server/priceCalculation';
import { getSession } from 'next-auth/react';
import { useState } from 'react';

interface UseTripModificationProps {
    type?: 'reduction' | 'extension' | string;
    tripid: number;
    vehzipcode: string;
    userId?: number;
    newStartDate: string | null;
    newEndDate: string | null;
    newStartTime: string | null;
    newEndTime: string | null;
    priceCalculatedList: any;
}

export default function useTripModification() {
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const tripModificationModal = useTripModificationDialog();

    async function handleTripModification({
        type,
        tripid,
        vehzipcode,
        newStartDate,
        newEndDate,
        newStartTime,
        newEndTime,
        priceCalculatedList
    }: UseTripModificationProps) {
        setSubmitting(true);
        try {
            const session = await getSession();
            const payload = {
                tripid,
                userId: String(session?.iduser),
                startTime: convertToTimeZoneISO(`${newStartDate}T${newStartTime}`, vehzipcode),
                endTime: convertToTimeZoneISO(`${newEndDate}T${newEndTime}`, vehzipcode),
                pickupTime: newStartTime,
                dropTime: newEndTime,
                totalDays: String(priceCalculatedList.numberOfDays),
                taxAmount: priceCalculatedList.taxAmount,
                tripTaxAmount: priceCalculatedList?.tripTaxAmount,
                totalamount: priceCalculatedList.totalAmount,
                tripamount: String(priceCalculatedList.tripAmount),
                upCharges: priceCalculatedList.upcharges,
                deliveryCost: priceCalculatedList.delivery,
                perDayAmount: priceCalculatedList.pricePerDay,
                extreaMilageCost: 0,
                isPaymentChanged: true,
                Statesurchargeamount: priceCalculatedList.stateSurchargeAmount,
                Statesurchargetax: priceCalculatedList.stateSurchargeTax,
                changedBy: 'HOST',
                ...priceCalculatedList,
                paymentauthorizationconfigid: 1,
                deductionfrequencyconfigid: 1,
                authorizationpercentage: priceCalculatedList.authPercentage,
                authorizationamount: priceCalculatedList.authAmount,
                comments: ''
            };

            const fieldsToRemove = [
                'authAmount',
                'authPercentage',
                'delivery',
                'hostPriceMap',
                'numberOfDays',
                'pricePerDay',
                'stateSurchargeAmount',
                'stateSurchargeTax',
                'totalAmount',
                'tripAmount',
                'upcharges'
            ];

            fieldsToRemove.forEach((field) => delete payload[field]);

            const response = type === 'reduction' ? await createTripReduction(payload) : await createTripExtension(payload);

            // // console.log('Extensionresponse', response);
            if (response.success) {
                setSuccess(true);
                tripModificationModal.setSuccess(true);
            } else {
                setSuccess(false);
                tripModificationModal.setMessage(response.message);
                tripModificationModal.setSuccess(false);
            }
        } catch (error) {
            console.error(error);
            setSuccess(false);
            tripModificationModal.setSuccess(false);
        } finally {
            setSubmitting(false);
            setSubmitted(true);
            tripModificationModal.setSubmitted(true);
        }
    }

    return {
        submitting,
        submitted,
        success,
        handleTripModification
    };
}
