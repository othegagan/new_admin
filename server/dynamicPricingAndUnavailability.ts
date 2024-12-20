'use server';

import { env } from '@/env';
import { api } from '@/lib/apiService';

const BOOKING_SERVICES_BASEURL = env.NEXT_PUBLIC_BOOKING_SERVICES_BASEURL;
const HOST_VEHICLE_SERVICES_BASEURL = env.NEXT_PUBLIC_HOST_VEHICLE_SERVICES_BASEURL;

export async function getAllChannels() {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/getAllChannel`;

    const response = await api.get<any>(url);
    return response;
}

// Dynamic Prcing Operations

export async function insertDynamicPricing(payload: any) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/insertHostPriceConfiguration`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function updatetDynamicPricingById(payload: any) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/updateHostPriceConfiguration`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function deleteDynamicPricingById(id: number) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/softDeletePriceDetails`;
    const payload = { ids: id };

    const response = await api.post<any>(url, payload);
    return response;
}

// Unavailability Operations

export async function insertUnavailability(payload: any) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/insertVehicleUnavailability`;

    const response = await api.post<any>(url, payload);
    return response;
}

export async function updateUnavailability(payload: any) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/updateVehicleUnavailability`;

    const response = await api.post<any>(url, payload);

    return response;
}

export async function deleteUnavailabilityById(id: number) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/updateVehicleUnavailability`;
    const payload = {
        vinunavailableid: id,
        day: 0,
        repeattype: 0,
        startdate: '',
        enddate: ''
    };

    const response = await api.post<any>(url, payload);
    return response;
}
