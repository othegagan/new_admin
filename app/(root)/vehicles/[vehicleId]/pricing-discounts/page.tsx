'use client';

import { CarLoadingSkeleton } from '@/components/skeletons';
import { Card, CardContent } from '@/components/ui/card';
import { useVehicleFeaturesById } from '@/hooks/useVehicles';
import { useParams } from 'next/navigation';
import Discounts from './_components/Discounts';
import DynamicPricingComponent from './_components/DynamicPricing';
import Pricing from './_components/PricingForm';

export default function PricingAndDiscountsPage() {
    const { vehicleId } = useParams();

    const { data: response, isLoading, error } = useVehicleFeaturesById(Number(vehicleId));

    if (isLoading) {
        return <CarLoadingSkeleton />;
    }

    if (error) {
        return <div className='h-32 w-full flex-center '>Error: {error.message}</div>;
    }

    if (!response?.success) {
        return <div className='h-32 w-full flex-center '>Error: {response?.message}</div>;
    }

    return (
        <div className='flex flex-col gap-6'>
            <Card>
                <CardContent className='flex flex-col gap-10'>
                    <Pricing />
                    <DynamicPricingComponent />
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Discounts />
                </CardContent>
            </Card>
        </div>
    );
}
