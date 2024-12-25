import { QUERY_KEYS } from '@/constants/query-keys';
import {
    getAllVehiclesUnderHost,
    getVehicleConfigurationEvents,
    getVehicleExpenseLogs,
    getVehicleFeaturesById,
    getVehicleMasterDataByVIN,
    getVehicleRepairLogs,
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

export const useVehicleRepairLogs = (id: number) => {
    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.vehicleRepairLogs, id],
            queryFn: async () => getVehicleRepairLogs(id)
        }),
        refetchAll: () => {
            return useQueryClient().invalidateQueries({
                queryKey: [QUERY_KEYS.vehicleRepairLogs]
            });
        }
    };
};

export const useVehicleExpenseLogs = (id: number) => {
    return {
        ...useQuery({
            queryKey: [QUERY_KEYS.vehicleExpenseLogs, id],
            queryFn: async () => getVehicleExpenseLogs(id)
        }),
        refetchAll: () => {
            return useQueryClient().invalidateQueries({
                queryKey: [QUERY_KEYS.vehicleExpenseLogs]
            });
        }
    };
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
