import { QUERY_KEYS } from '@/constants/query-keys';
import {
    getAllVehiclesUnderHost,
    getVehicleConfigurationEvents,
    getVehicleFeaturesById,
    getVehicleMasterDataByVIN,
    getVehicleTripById,
    getVehicleUpdateLogsById
} from '@/server/vehicles';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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
    const queryClient = useQueryClient();
    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.vehicleFeaturesById, id],
            queryFn: async () => getVehicleFeaturesById(id)
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.vehicleFeaturesById]
            });
        }
    };
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

export const useVehicleConfigurationEvents = () => {
    const queryClient = useQueryClient();

    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.vehicleConfigurationEvents],
            queryFn: async () => getVehicleConfigurationEvents()
        }),
        refetchAll: () => {
            return queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.vehicleConfigurationEvents]
            });
        }
    };
};
