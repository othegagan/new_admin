import { PAGE_ROUTES } from '@/constants/routes';
import { redirect } from 'next/navigation';
import { use } from 'react';

export default function VehicleDefaultPage({ params }: { params: Promise<{ vehicleId: string }> }) {
    const { vehicleId } = use(params);
    redirect(`${PAGE_ROUTES.VEHICLES}/${vehicleId}${PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR}`);
}
