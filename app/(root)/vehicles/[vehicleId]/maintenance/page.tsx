'use client';

import TextWithSuggestions from '@/components/ui/extension/input-text-with-suggestions';
import { useState } from 'react';

export default function VehicleServiceSelector() {
    const [service, setService] = useState('Car Wash');

    const vehicleServices = [
        'Air Filter',
        'Battery',
        'Belts',
        'Brake Pads',
        'Brake Fluid',
        'Car Wash',
        'Fuel Filter',
        'Inspection',
        'Lights',
        'New Tires',
        'Oil Change',
        'Oil Filter',
        'Tire Rotation',
        'Suspension',
        'Wheel Alignment',
        'Tire Pressure'
    ];

    return (
        <div className='mx-auto h-64 max-w-sm'>
            <TextWithSuggestions
                value={service}
                onChange={setService}
                suggestions={vehicleServices}
                placeholder='Select or type a service'
                className='my-4'
            />
            <p className='mt-2 text-sm'>Selected Service: {service || 'None'}</p>
        </div>
    );
}
