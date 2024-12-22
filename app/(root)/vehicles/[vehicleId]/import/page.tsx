'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/extension/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { vehicleConfigTabsContent } from '@/constants';
import { useVehiclesUnderHost } from '@/hooks/useVehicles';
import { cn } from '@/lib/utils';
import { copyVehicleFromOneToAnother } from '@/server/vehicles';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import SubHeader from '../../_components/layout/subheader';

export default function CopyDataPage() {
    const { vehicleId } = useParams();
    return (
        <div className='flex flex-col'>
            <SubHeader title={vehicleConfigTabsContent.import.title} description={vehicleConfigTabsContent.import.description} />
            <Tabs defaultValue='bundee' className='mt-4'>
                <TabsList className='w-[300px]'>
                    <TabsTrigger className='w-full' value='bundee'>
                        Bundee
                    </TabsTrigger>
                    <TabsTrigger className='w-full' value='turo'>
                        Turo
                    </TabsTrigger>
                </TabsList>
                <TabsContent value='bundee' className='w-full'>
                    <CopyBundeeDataForm toVehicleId={Number(vehicleId)} />
                </TabsContent>
                <TabsContent value='turo'>Coming Soon</TabsContent>
            </Tabs>
        </div>
    );
}

function CopyBundeeDataForm({ toVehicleId }: { toVehicleId: number }) {
    const { data: response, error, isLoading } = useVehiclesUnderHost();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!response?.success) {
        return <div>Error: {response?.message}</div>;
    }

    // Ensure hostVehicleDetails is defined and sorted by make
    const allHostsVehicles =
        response?.data?.hostVehicleDetails?.sort((a: { make: string | null }, b: { make: string | null }) => {
            if (a.make === null) return 1;
            if (b.make === null) return -1;
            return a.make.localeCompare(b.make);
        }) || [];

    // Ensure completedVehicles is defined and mapped properly
    const completedVehicles =
        allHostsVehicles
            .filter((vehicle: any) => vehicle.upploadStatus === 'completed')
            .map((vehicle: any) => ({
                id: vehicle.id,
                imageURL: vehicle.imageresponse.find((image: any) => image.isPrimary)?.imagename || '',
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                number: vehicle.number,
                color: vehicle.color,
                vin: vehicle.vin
            })) || [];

    if (completedVehicles.length === 0) {
        return <div>No vehicles found.</div>;
    }

    return <VehicleSelect vehicles={completedVehicles} toVehicleId={Number(toVehicleId)} />;
}

interface Vehicle {
    id: number;
    imageURL: string;
    make: string;
    model: string;
    year: string;
    number: string;
    color: string;
    vin: string;
}

function VehicleSelect({
    vehicles,
    toVehicleId
}: {
    vehicles: Vehicle[];
    toVehicleId: number;
}) {
    const [open, setOpen] = useState(false);

    const [fromVehicle, setFromVehicle] = useState<Vehicle | null>(null);

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting }
    } = useForm({
        mode: 'onChange'
    });

    const onSubmit = async () => {
        try {
            if (!fromVehicle) return;

            const response = await copyVehicleFromOneToAnother(fromVehicle.id, toVehicleId);

            if (response.success) {
                toast.success(response.message);
                setFromVehicle(null);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            console.error('Error copying:', error);
            toast.error('Error in copying :', error.message);
        }
    };
    return (
        <form onSubmit={handleSubmit(onSubmit)} className='mt-6 flex w-full flex-col gap-4 lg:mt-10'>
            <div className='flex flex-col gap-2 p-0.5'>
                <Label>Select a vehicle to copy from</Label>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <div className='flex w-[200px] cursor-pointer items-center justify-between gap-2 rounded-md border px-3 py-2 lg:w-[400px]'>
                            {fromVehicle ? (
                                <div className='flex items-center gap-2'>
                                    <div className='aspect-video h-full w-24 flex-center overflow-hidden rounded-[6px] border'>
                                        <img
                                            src={fromVehicle.imageURL || '/images/image_not_available.png'}
                                            alt={`${fromVehicle.make} ${fromVehicle.model} ${fromVehicle.year}`}
                                            className='h-full w-full object-cover object-center'
                                        />
                                    </div>
                                    <div className='flex flex-col gap-1'>
                                        <div className='line-clamp-1 select-text font-bold text-14 group-hover:line-clamp-none'>
                                            {fromVehicle.make} {fromVehicle.model} {fromVehicle.year}
                                        </div>
                                        <div className='select-text font-medium text-[10px] text-muted-foreground uppercase'>
                                            VIN: {fromVehicle.vin}
                                        </div>
                                        <div className='flex w-full items-center justify-between'>
                                            <div className='select-text font-semibold text-foreground text-xs'>{fromVehicle.number}</div>
                                            <div className='select-text font-medium text-muted-foreground text-xs'>
                                                ID: {fromVehicle.id}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className='text-14 text-muted-foreground'>Select a vehicle </p>
                            )}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className='w-[300px] p-0 lg:w-[400px]'>
                        <Command>
                            <CommandInput placeholder='Search Vehicle...' />
                            <CommandList>
                                <CommandEmpty>No vehicle found.</CommandEmpty>
                                <CommandGroup>
                                    {vehicles?.map((vehicle: Vehicle) => (
                                        <CommandItem
                                            key={vehicle.id}
                                            onSelect={() => {
                                                setFromVehicle(vehicle);
                                                setOpen(false);
                                            }}>
                                            <Check
                                                className={cn('mr-2 h-4 w-4', fromVehicle?.id === vehicle.id ? 'opacity-100' : 'opacity-0')}
                                            />
                                            <div className='aspect-video h-full w-24 flex-center overflow-hidden rounded-[6px] border'>
                                                <img
                                                    src={vehicle.imageURL || '/images/image_not_available.png'}
                                                    alt={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
                                                    className='h-full w-full object-cover object-center'
                                                />
                                            </div>

                                            <div className='ml-2 flex flex-1 select-text flex-col gap-1.5'>
                                                <div className='flex w-full flex-col gap-1'>
                                                    <div className='line-clamp-1 select-text font-bold text-14 group-hover:line-clamp-none'>
                                                        {vehicle.make} {vehicle.model} {vehicle.year}
                                                    </div>
                                                    <div className='select-text font-medium text-[10px] text-muted-foreground uppercase'>
                                                        VIN: {vehicle.vin}
                                                    </div>
                                                </div>

                                                <div className='flex w-full items-center justify-between'>
                                                    <div className='select-text font-semibold text-foreground text-xs'>
                                                        {vehicle.number}
                                                    </div>
                                                    <div className='select-text font-medium text-muted-foreground text-xs'>
                                                        ID: {vehicle.id}
                                                    </div>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            <Button type='submit' variant='black' disabled={!fromVehicle} loading={isSubmitting} loadingText='Copying...'>
                Copy from Bundee
            </Button>
        </form>
    );
}
