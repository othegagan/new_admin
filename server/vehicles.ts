'use server';

import { env } from '@/env';
import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';

const HOST_VEHICLE_SERVICES_BASEURL = env.NEXT_PUBLIC_HOST_VEHICLE_SERVICES_BASEURL;
const AVAILABILITY_BASEURL = env.NEXT_PUBLIC_AVAILABILITY_BASEURL;

export async function getAllVehiclesUnderHost() {
    const session = await auth();
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/getVehiclesByHostId`;
    const payload = { id: session?.iduser };

    return await api.post<any>(url, payload);
}

export async function getVehicleFeaturesById(id: number) {
    const url = `${AVAILABILITY_BASEURL}/v1/availability/getVehiclesnFeaturesById`;
    const payload = { vehicleid: id };

    return await api.post<any>(url, payload);
}

export async function getVehicleMasterDataByVIN(vin: string) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/checkVin`;
    const payload = { vin };

    return await api.post<any>(url, payload);
}

export async function createVehicle(hostId: number, vin: string) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/createVehicle`;
    const payload = {
        hostId: hostId,
        vin: vin
    };

    return await api.post<any>(url, payload);
}
