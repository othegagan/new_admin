import { env } from '@/env';
import { api } from '@/lib/apiService';
import axios from 'axios';
import { getSession } from 'next-auth/react';

const BOOKING_SERVICES_BASEURL = env.NEXT_PUBLIC_BOOKING_SERVICES_BASEURL;
const CHAT_SERVICE_BASEURL = env.NEXT_PUBLIC_CHAT_SERVICE_BASEURL;

export async function getAllTripsOfHost(startTime: string, endTime: string) {
    const session = await getSession();
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/getActiveTripById`;
    const payload = {
        fromValue: 'hostidbetweendays',
        startTime: startTime,
        endTime: endTime,
        id: session?.iduser
    };

    const response = await api.post<any>(url, payload);
    return response;
}

export async function getReviewRequiredTrips() {
    const session = await getSession();
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/getActiveTripById`;
    const payload = {
        fromValue: 'needsReviewTrips',
        id: session?.iduser
    };

    const response = await api.post<any>(url, payload);
    return response;
}

export async function getTripDetails(bookingId: number) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/getActiveTripById`;
    const payload = {
        fromValue: 'tripid',
        id: bookingId
    };

    const response = await api.post<any>(url, payload);
    return response;
}

export async function getTripChatHistory(tripid: number, firebaseToken: string) {
    try {
        const url = `${CHAT_SERVICE_BASEURL}/getAllChatHistory`;

        const payload = {
            tripId: tripid,
            count: 1000
        };

        const response = await axios.post(url, payload, {
            headers: {
                Accept: '*/*',
                Authorization: `Bearer ${firebaseToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status !== 200) {
            throw new Error(`APIapi Error<any>! status: ${response.status}`);
        }

        const data = response.data;

        const messageData = data.messages
            .map((item: any) => ({
                author: item.author,
                message: item.body,
                deliveryDate: item.dateUpdated,
                mediaUrl: item.attributes?.mediaUrl || null
            }))
            .reverse();

        return messageData;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function sendMessageToCustomer(tripid: number, messageBody: string, firebaseToken: string) {
    try {
        const url = `${CHAT_SERVICE_BASEURL}/hostSendMessage`;

        const payload = {
            tripId: tripid,
            message: messageBody
        };

        const response = await axios.post(url, payload, {
            headers: {
                Accept: '*/*',
                Authorization: `Bearer ${firebaseToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status !== 200) {
            throw new Error(`APIapi Error<any>! status: ${response.status}`);
        }

        // const data = response.data;

        const res_client = {
            success: true
        };

        return res_client;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getAllMasterHostCheckList() {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/getAllMasterCheckList`;

    const response = await api.get<any>(url);
    return response;
}

export async function createHostCheckList(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/createTransactionCheckList`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function enterTripMiles(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/enterMiles`;

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
