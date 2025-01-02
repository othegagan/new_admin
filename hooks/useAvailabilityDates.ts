import { formatDateAndTime } from '@/lib/utils';
import { getAvailabilityDatesByVehicleId } from '@/server/vehicles';
import { useEffect, useState } from 'react';

const useAvailabilityDates = (vehicleId: any, tripid: any, zipCode?: any) => {
    const [unformattedDates, setUnformattedDates] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [unavailableDates, setUnavailableDates] = useState<any>([]);
    const [minDays, setMinDays] = useState(0);
    const [maxDays, setMaxDays] = useState(0);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await getAvailabilityDatesByVehicleId(vehicleId, tripid);
            if (response.success) {
                const data = response.data;
                // console.log("data", data.unAvailabilityDate)
                const bloackedDates = convertDates(data.unAvailabilityDate);
                setUnavailableDates(bloackedDates || []);
                setUnformattedDates(data.unAvailabilityDate);

                const vehicleBusinessConstraints = data.vehicleBusinessConstraints || [];
                const minMaxDays = vehicleBusinessConstraints.map((constraint: any) => {
                    const { maximumDays, minimumDays } = JSON.parse(constraint.constraintValue);
                    return { maximumDays, minimumDays };
                });

                const firstMinMax = minMaxDays.length > 0 ? minMaxDays[0] : {};
                setMinDays(firstMinMax?.minimumDays || 0);
                setMaxDays(firstMinMax?.maximumDays || 0);
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error in fetching availability dates', error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [vehicleId]);

    function convertDates(unAvailabilityDate: string[]): string[] {
        const result: string[] = [];

        for (const dateStr of unAvailabilityDate) {
            const converted = formatDateAndTime(dateStr, zipCode, 'YYYY-MM-DD');
            result.push(converted);
        }

        return result;
    }

    const refetch = fetchData;

    return { isLoading, isError, unavailableDates, minDays, maxDays, refetch, unformattedDates };
};

export default useAvailabilityDates;
