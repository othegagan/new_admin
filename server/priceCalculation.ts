import { env } from '@/env';
import { api } from '@/lib/apiService';

const HOST_VEHICLE_SERVICES_BASEURL = env.NEXT_PUBLIC_HOST_VEHICLE_SERVICES_BASEURL;
const BOOKING_SERVICES_BASEURL = env.NEXT_PUBLIC_BOOKING_SERVICES_BASEURL;

export async function calculatePrice(payload: any) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/calculatePrice`;
    // console.log('Serach Payload', searchQuery);
    const response = await api.post<any>(url, payload);
    return response;
}

export async function createTripExtension(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v2/booking/createTripModificationExtension`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function createTripReduction(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v2/booking/createTripModificationReduction`;

    const response = await api.post<any>(url, payload);
    return response;
}
