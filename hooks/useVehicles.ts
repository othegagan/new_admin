import { QUERY_KEYS } from '@/constants/query-keys';
import {
    getAllVehiclesUnderHost,
    getVehicleFeaturesById,
    getVehicleMasterDataByVIN,
    getVehicleTripById,
    getVehicleUpdateLogsById
} from '@/server/vehicles';
import { useQuery } from '@tanstack/react-query';

export const useVehiclesUnderHost = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.allVechiclesUnderHost],
        queryFn: async () => getAllVehiclesUnderHost()
    });
};

export const useVehicleMasterDataByVIN = (vin: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.vehiclesByVin, vin],
        queryFn: async () => getVehicleMasterDataByVIN(vin),
        enabled: vin !== ''
    });
};

export const useVehicleFeaturesById = (id: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.vehicleFeaturesById, id],
        queryFn: async () => getVehicleFeaturesById(id)
    });
};

export const useVehicleUpdateLogsById = (id: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.vehicleUpdateLogsById, id],
        queryFn: async () => getVehicleUpdateLogsById(id)
    });
};

export const useVehicleTripById = (startDate: string, endDate: string, vehicleId: number) => {
    return useQuery({
        queryKey: [QUERY_KEYS.vehicleTripById, { startDate, endDate, vehicleId }],
        queryFn: async () => getVehicleTripById(startDate, endDate, vehicleId)
    });
};
