import { toTitleCase } from '@/lib/utils';

export function VehicleCard({ car }: { car: any }) {
    const primaryImage = car.imageresponse.find((image: any) => image.isPrimary)?.imagename || '';
    const vehicleName = toTitleCase(`${car.make} ${car.model} ${car.year}`);

    return (
        <div className='group flex w-full cursor-pointer items-center gap-2 border-b text-left text-sm transition-all hover:bg-accent'>
            <div className='flex flex-col gap-1.5'>
                <div className='aspect-video h-full w-24 flex-center overflow-hidden rounded-[6px] border'>
                    <img
                        src={primaryImage || '/images/image_not_available.png'}
                        alt={vehicleName}
                        className='h-full w-full object-cover object-center'
                    />
                </div>
                <div className='bg-[#0A4AC61A] px-3 py-1 text-center text-xs md:hidden'>
                    {car.isVehicleOnTrip ? 'On Trip' : 'Available'}
                </div>
            </div>

            <div className='flex flex-1 select-text flex-col gap-1.5'>
                <div className='flex w-full flex-col gap-1'>
                    <div className='line-clamp-1 select-text font-bold text-14 group-hover:line-clamp-none'>{vehicleName}</div>
                    <div className='select-text font-medium text-muted-foreground text-xs uppercase'>VIN: {car.vin}</div>
                </div>

                <div className='flex w-full items-center justify-between md:max-w-[80%]'>
                    <div className='select-text font-semibold text-foreground text-xs'>{car.number}</div>
                    <div className='ml-10 select-text font-medium text-muted-foreground text-xs'>ID: {car.id}</div>
                </div>
            </div>
            <div className='hidden bg-[#0A4AC61A] px-3 py-1 text-center text-xs md:block'>
                {car.isVehicleOnTrip ? 'On Trip' : 'Available'}
            </div>
        </div>
    );
}

export function SelectedVehicleDetails({ vehicleData }: { vehicleData: any }) {
    const primaryImage = vehicleData.imageresponse.find((image: any) => image.isPrimary)?.imagename || '';
    const vehicleName = toTitleCase(`${vehicleData.make} ${vehicleData.model} ${vehicleData.year}`);

    return (
        <div className='group flex cursor-pointer items-center gap-2 text-left text-sm md:gap-4'>
            <div className='aspect-video h-full w-24 flex-center overflow-hidden rounded-[6px] border'>
                <img
                    src={primaryImage || '/images/image_not_available.png'}
                    alt={vehicleName}
                    className='h-full w-full object-cover object-center'
                />
            </div>

            <div className='flex h-full w-full flex-1 select-text flex-col justify-between gap-1.5'>
                <div className='flex w-full flex-col gap-1'>
                    <div className='line-clamp-1 select-text font-bold text-14 group-hover:line-clamp-none'>{vehicleName}</div>
                </div>

                <div className='flex w-full flex-col justify-between md:flex-row md:items-center'>
                    <div className='select-text font-semibold text-foreground text-xs'>{vehicleData.number}</div>
                    <div className='select-text font-medium text-muted-foreground text-xs'>ID: {vehicleData.id}</div>
                </div>
            </div>
            <div className='hidden bg-[#0A4AC61A] px-3 py-1 text-xs md:block'>{vehicleData.isVehicleOnTrip ? 'On Trip' : 'Available'}</div>
        </div>
    );
}
