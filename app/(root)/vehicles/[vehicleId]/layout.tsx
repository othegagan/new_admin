import { Main } from '@/components/layout/main';
import type * as React from 'react';
import BasicVehicleDetails from '../_components/basic-vehicle-details';
import VehicleConfigTabs from '../_components/vehicle-config-tabs';

interface VehicleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ vehicleId: string }>;
}

interface VehicleIdValidatiorProps {
    vehicleId: string | string[];
    children: React.ReactNode;
}

export default async function VehicleLayout({ children, params }: VehicleLayoutProps) {
    const { vehicleId } = await params;

    return (
        <Main fixed className=' md:pt-0'>
            {/* Header */}
            <VehicleIdValidatior vehicleId={vehicleId}>
                <BasicVehicleDetails vehicleId={Number(vehicleId)} />

                {/* Tabs */}
                <div className='my-4 w-full'>
                    <VehicleConfigTabs />
                </div>

                {/* Main Content */}
                <div className='overflow-y-auto border-t py-5'>{children}</div>
            </VehicleIdValidatior>
        </Main>
    );
}

export function VehicleIdValidatior({ vehicleId, children }: VehicleIdValidatiorProps) {
    const isValidVehicleId = (id: string | string[]) => {
        if (typeof id !== 'string' || id.trim() === '' || Number.isNaN(Number(id))) {
            return false;
        }
        return true;
    };

    if (!isValidVehicleId(vehicleId)) {
        return <div className='h-20 w-full flex-center font-semibold text-muted-foreground text-xl'>Invalid vehicle ID</div>;
    }

    return <>{children}</>;
}
