'use server';

import { env } from '@/env';
import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

const BOOKING_SERVICES_BASEURL = env.NEXT_PUBLIC_BOOKING_SERVICES_BASEURL;
const USER_MANAGEMENT_BASEURL = env.NEXT_PUBLIC_USER_MANAGEMENT_BASEURL;

export async function getAllNotifications() {
    const session = await auth();
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/getNotification`;
    const payload = {
        id: session?.iduser,
        fromValue: 'allhostnotification'
    };
    const response = await api.post<any>(url, payload);
    return response;
}

export async function markNotificationAsRead(id: number) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/updateNotification`;
    const payload = {
        fromValue: id
    };
    const response = await api.post<any>(url, payload);
    return response;
}

export async function markMessageNotificationAsRead(tripId: number) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/updateMessageNotifications`;
    const payload = {
        tripId: tripId
    };

    const response = await api.post<any>(url, payload);
    return response;
}

export async function updatePushNotificationToken(deviceUUID: string, deviceToken: string, callBackUrl: string) {
    const session = await auth();
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/updatePushNotification`;
    const payload = {
        userid: session?.iduser,
        deviceUUID: deviceUUID,
        devicetoken: deviceToken,
        callBackUrl
    };
    const response = await api.post<any>(url, payload);
    return response;
}
