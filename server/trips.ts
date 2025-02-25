import { env } from '@/env';
import { api } from '@/lib/apiService';

const BOOKING_SERVICES_BASEURL = env.NEXT_PUBLIC_BOOKING_SERVICES_BASEURL;
const AVAILABILITY_SERVICES_BASEURL = env.NEXT_PUBLIC_AVAILABILITY_BASEURL;

export async function getAllTripsOfHost(startDate: string, endDate: string) {
    const url = `${BOOKING_SERVICES_BASEURL}/v2/booking/hostTripBetweenDays`;
    const payload = {
        startDate: startDate,
        endDate: endDate
    };

    const response = await api.post<any>(url, payload);
    return response;
}

export async function getReviewRequiredTrips() {
    const url = `${BOOKING_SERVICES_BASEURL}/v2/booking/hostNeedsReviewTrips`;
    const payload = {};

    const response = await api.post<any>(url, payload);
    return response;
}

export async function getTripDetails(bookingId: number) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/getActiveTripForHost`;
    const payload = {
        fromValue: 'tripid',
        id: bookingId
    };

    const response = await api.post<any>(url, payload);

    return response;
}

export async function tripApproval(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/updateReservationApproval`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function tripRejection(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/updateReservationRejected`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function undoTripRejectionOrCancellation(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/bringBackToOldTrip`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function tripDismissalFromNeedsReview(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/updateNeedsReview`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function acceptTripCancellation(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/acceptCancellationRequest`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function tripStart(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/updateReservationStart`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function tripComplete(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/updateReservationCompleted`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function tripStartChecklist(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/tripStartCheckList`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function tripEndChecklist(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/tripEndCheckList`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function tripExtraCharges(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/updateExtraCharges`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function getVehiclesForSwap(payload: any) {
    const url = `${AVAILABILITY_SERVICES_BASEURL}/v1/availability/getByHostSearch`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function swapVehicle(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/createSwapRequest`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function refundCharges(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/refundFromLedger`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function chargeManually(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/manualCapture`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function releaseDeposit(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/manualDepositRelease`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function collectDeposit(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/collectDepositHold`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function deleteImageVideoUploaded(id: number) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/deleteMediaFile`;
    const payload = { id };
    const response = await api.post<any>(url, payload);
    return response;
}
