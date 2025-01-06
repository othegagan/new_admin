import { env } from '@/env';
import { api } from '@/lib/apiService';
import axios from 'axios';
import { getSession } from 'next-auth/react';

const HOST_VEHICLE_SERVICES_BASEURL = env.NEXT_PUBLIC_HOST_VEHICLE_SERVICES_BASEURL;
const AVAILABILITY_BASEURL = env.NEXT_PUBLIC_AVAILABILITY_BASEURL;
const BOOKING_SERVICES_BASEURL = env.NEXT_PUBLIC_BOOKING_SERVICES_BASEURL;
const TELEMATICS_BASEURL = env.NEXT_PUBLIC_TELEMATICS_SERVICE_BASEURL;

export async function getAllVehiclesUnderHost() {
    const session = await getSession();
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/getVehicleTripsDetails`;
    const payload = { hostId: session?.iduser };

    return await api.post<any>(url, payload);
}

export async function getVehiclesForMapView() {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/getVehicleForMapView`;
    const session = await getSession();
    const payload = { id: session?.iduser };
    const response = await api.post<any>(url, payload);
    return response;
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

export async function getVehicleUpdateLogsById(id: number) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/getVehicleLogByVehicleId`;
    const payload = { vehicleId: id };

    const response = await api.post<any>(url, payload);
    return response;
}

export async function getVehicleRepairLogs(id: number) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/getVehicleRepairLogsByVehicleId`;
    const payload = { vehicleId: id };

    const response = await api.post<any>(url, payload);
    return response;
}

export async function getVehicleExpenseLogs(id: number) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/getVehicleExpenseLogsByVehicleId`;
    const payload = { vehicleId: id };

    const response = await api.post<any>(url, payload);
    return response;
}

export async function getVehicleTripById(startTIme: string, endTime: string, vehicleId: number) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/getActiveTripById`;
    const payload = {
        startTime: startTIme,
        endTime: endTime,
        fromValue: 'vehicleidbetweendays',
        id: vehicleId
    };

    const response = await api.post<any>(url, payload);
    return response;
}

export async function copyVehicleFromOneToAnother(fromVehicleId: number, toVehicleId: number) {
    const url = `${HOST_VEHICLE_SERVICES_BASEURL}/v1/vehicle/copyVehicleFunctionality`;
    const payload = {
        fromVehicleId,
        toVehicleId
    };

    const response = await api.post<any>(url, payload);
    return response;
}

export async function getVehicleConfigurationEvents() {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/getAllVehicleConfigurationEvents`;
    const response = await api.get<any>(url);
    return response;
}

export async function insertVehicleConfigurationEvent(payload: any) {
    const url = `${BOOKING_SERVICES_BASEURL}/v1/booking/insertVehicleMessageContent`;
    const response = await api.post<any>(url, payload);
    return response;
}

interface UpdateVehicleFeaturesById {
    type:
        | 'calendar'
        | 'upload_master_data'
        | 'update_master_data'
        | 'upload_pricing_discounts'
        | 'upload_photos'
        | 'update_photos'
        | 'description'
        | 'update_guest_instructions'
        | 'upload_location_delivery'
        | 'upload_mileage_limits'
        | 'create_turo_id'
        | 'update_turo_id'
        | 'mix_max_rental_duration'
        | 'upload_activation'
        | 'update_activation'
        | 'telematics';

    payload: any;
}

export async function updateVehicleFeaturesById({ type, payload }: UpdateVehicleFeaturesById) {
    const urlMap: { [key: string]: string } = {
        upload_master_data: '/v1/vehicle/uploadVehicleDetailsAndFeatures',
        update_master_data: '/v1/vehicle/updateVehicleFeaturesandDetails',

        upload_pricing_discounts: '/v1/vehicle/uploadPricingAndDiscounts',

        upload_photos: '/v1/vehicle/uploadVehicleImage',
        update_photos: '/v1/vehicle/updateVehicleImage',

        description: '/v1/vehicle/uploadVehicleDescription',

        update_guest_instructions: '/v1/vehicle/updateGuestInstructionsAndGuideLines',

        upload_location_delivery: '/v1/vehicle/uploadVehicleLocationDelivery',

        upload_mileage_limits: '/v1/vehicle/uploadVehicleMilage',

        mix_max_rental_duration: '/v1/vehicle/setVehicleMinMax',

        create_turo_id: '/v1/vehicle/uploadVehicleConstraintLink',
        update_turo_id: '/v1/vehicle/updateVehicleConstraintLink',

        calendar: '/v1/vehicle/updateCalendar',
        telematics: '/v1/vehicle/updateTelematics',

        upload_activation: '/v1/vehicle/setVehicleActivation',
        update_activation: '/v1/vehicle/vehicleActiveUpdate'
    };

    const url = `${HOST_VEHICLE_SERVICES_BASEURL}${urlMap[type]}`;

    if (!url) {
        throw new Error(`Invalid update type: ${type}`);
    }

    const response = await api.post(url, payload);
    return response;
}

export async function getAvailabilityDatesByVehicleId(vehicleid: number, tripid: number) {
    const url = `${AVAILABILITY_BASEURL}/v1/availability/getAvailabilityDatesByVehicleId`;
    const payload = tripid
        ? {
              reservationId: tripid,
              vehicleid: vehicleid
          }
        : { vehicleid: vehicleid };

    const response = await api.post<any>(url, payload);
    return response;
}

export async function getTelematicsData(vehicleId: number) {
    const payload = JSON.stringify({
        fromValue: 'vehicleid',
        id: vehicleId
    });

    const url = `${TELEMATICS_BASEURL}/v1/telematics/getTelematicsData`;

    const response = await axios.post(url, payload, {
        headers: {
            'Content-Type': 'application/json',
            bundee_auth_token: '79088eb079137504d408cb876a6b547c55b282a48ba86ff2205a30f840a47fc6dd7829e180cbeeab5212bdf39b5a5668'
        }
    });

    if (response?.data?.errorCode === '1') {
        return {
            data: response.data,
            success: false,
            message: response.data.errorMessage
        };
    }

    return {
        data: response.data,
        success: true,
        message: response.data.errorMessage
    };
}

export async function getTelematicsEvents(telematicTripId: number) {
    const payload = JSON.stringify({
        fromValue: 'tripId',
        id: telematicTripId
    });

    const url = `${TELEMATICS_BASEURL}/v1/telematics/getTelematicsEvents`;

    const response = await axios.post(url, payload, {
        headers: {
            'Content-Type': 'application/json',
            bundee_auth_token: '79088eb079137504d408cb876a6b547c55b282a48ba86ff2205a30f840a47fc6dd7829e180cbeeab5212bdf39b5a5668'
        }
    });

    if (response?.data?.errorCode === '1') {
        return {
            data: response.data,
            success: false,
            message: response.data.errorMessage
        };
    }

    return {
        data: response.data,
        success: true,
        message: response.data.errorMessage
    };
}
