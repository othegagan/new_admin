import { env } from '@/env';
import { api } from '@/lib/apiService';

const HOST_VEHICLE_SERVICES_BASEURL = env.NEXT_PUBLIC_HOST_VEHICLE_SERVICES_BASEURL;

export async function getHostConstraint() {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/getHostPricingConstraint`;
    const payload = {};

    const response = await api.post<any>(url, payload);
    return response;
}

export async function updateHostConfigurations(payload: any) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/updateHostBusinessConstraint`;
    const response = await api.post<any>(url, payload);
    return response;
}

// export async function insertHostConfigurations(payload: any) {
//     const session = await getSession();
//     const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/insertHostBusinessConstraint`;
//     payload.hostId = session?.iduser;
//     const response = await api.post<any>(url, payload);
//     return response;
// }
