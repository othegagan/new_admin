'use client';
import { Main } from '@/components/layout/main';
import { use } from 'react';
import BasicVehicleDetails from '../_components/layout/basic-vehicle-details';
import Tabs from '../_components/layout/tabs';

interface VehicleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ vehicleId: string }>;
}

interface VehicleIdValidatiorProps {
    vehicleId: string | string[];
    children: React.ReactNode;
}

export default function VehicleLayout({ children, params }: VehicleLayoutProps) {
    const { vehicleId } = use(params);

    return (
        <VehicleIdValidatior vehicleId={vehicleId}>
            <Main fixed>
                <BasicVehicleDetails vehicleId={Number(vehicleId)} />

                <div className='flex flex-col overflow-hidden '>
                    <Tabs />
                    <div className='h-[90%] overflow-y-auto overflow-x-hidden'>{children}</div>
                </div>
            </Main>
        </VehicleIdValidatior>
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
