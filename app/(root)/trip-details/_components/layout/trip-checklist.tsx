'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { tripEndChecklist, tripStartChecklist } from '@/server/trips';
import type { Trip } from '@/types';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import TripMediaDisplay from './trip-media-display';
import TripMediaUploadDialog from './trip-media-upload-dialog';

interface TripChecklistProps {
    trip: Trip;
    checklist: Checklist;
}

interface Checklist {
    id: number;
    tripId: number;
    startFuelLevel: string;
    endFuelLevel: any;
    ac: boolean;
    wiperFluid: boolean;
    oil: boolean;
    preTripCarCleaned: boolean;
    postTripCarCleaned: boolean;
    brakes: boolean;
    headLight: boolean;
    preTripComments: string;
    postTripComments: any;
}

const fuelOptions = ['Empty', '1/8', '1/4', 'Half', '3/4', 'Full'];
const vehicleFunctioningItems: any[] = [
    { id: 'acpre', label: 'AC', key: 'ac' },
    { id: 'wiperFluidpre', label: 'Wiper Fluid', key: 'wiperFluid' },
    { id: 'oilpre', label: 'Oil', key: 'oil' },
    { id: 'preTripCarCleanedpre', label: 'Car cleaned', key: 'preTripCarCleaned' },
    { id: 'brakespre', label: 'Breaks', key: 'brakes' },
    { id: 'headLightpre', label: 'Headlights/Tail lights', key: 'headLight' }
];

export default function TripChecklist({ trip, checklist }: TripChecklistProps) {
    const {
        control: startControl,
        handleSubmit: handleStartSubmit,
        reset: resetStart,
        formState: { isSubmitting: isStartSubmitting, isDirty: isStartDirty }
    } = useForm({
        defaultValues: {
            openingMiles: trip?.openingMiles || 0,
            startFuelLevel: checklist?.startFuelLevel || '1/4',
            ac: checklist?.ac || false,
            wiperFluid: checklist?.wiperFluid || false,
            oil: checklist?.oil || false,
            preTripCarCleaned: checklist?.preTripCarCleaned || false,
            brakes: checklist?.brakes || false,
            headLight: checklist?.headLight || false,
            preTripComments: checklist?.preTripComments || ''
        }
    });

    const {
        control: endControl,
        handleSubmit: handleEndSubmit,
        reset: resetEnd,
        register: registerEnd,
        formState: { isSubmitting: isEndSubmitting, isDirty: isEndDirty }
    } = useForm({
        defaultValues: {
            closingMiles: trip?.closingMiles || 0,
            endFuelLevel: checklist?.endFuelLevel || '1/4',
            postTripCarCleaned: checklist?.postTripCarCleaned || false,
            postTripComments: checklist?.postTripComments || ''
        }
    });

    async function onSubmitStart(data: any) {
        try {
            const payload = { ...data, tripId: trip.tripid };
            const response = await tripStartChecklist(payload);
            if (response.success) {
                resetStart({
                    ...data
                });
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save trip start checklist.');
        }
    }

    async function onSubmitEnd(data: any) {
        try {
            const payload = { ...data, tripId: trip.tripid };
            const response = await tripEndChecklist(payload);
            if (response.success) {
                resetEnd({
                    ...data
                });
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save trip end checklist.');
        }
    }

    const asMediaFile = [
        trip?.hostTripStartingBlobs,
        trip?.hostTripCompletingBlobs,
        trip?.driverTripStartingBlobs,
        trip?.driverTripCompletingBlobs
    ].some((blobs) => blobs && blobs.length > 0);

    return (
        <div className='mb-6 w-full space-y-4 lg:space-y-8'>
            <Accordion type='single' collapsible className='w-full space-y-4'>
                <AccordionItem value='trip-start' className='border-0'>
                    <AccordionTrigger className='rounded-md border-0 bg-primary/10 px-4 shadow-none'>Trip Start Checklist</AccordionTrigger>
                    <AccordionContent>
                        {!['TRSTR', 'TRCOM'].includes(trip.statusCode) ? (
                            <form onSubmit={handleStartSubmit(onSubmitStart)} className='mt-4 flex flex-col gap-4'>
                                <div className='flex flex-col gap-4 md:flex-row-reverse md:justify-between'>
                                    <TripMediaUploadDialog
                                        hostId={trip.hostid}
                                        tripid={trip.tripid}
                                        belongsTo='starting'
                                        hostTripStartingBlobs={trip.hostTripStartingBlobs}
                                    />
                                    <div className='grid grid-cols-2 gap-4'>
                                        <Controller
                                            name='openingMiles'
                                            control={startControl}
                                            render={({ field }) => (
                                                <div>
                                                    <Label htmlFor='odoStartPre'>Odometer Start (miles)</Label>
                                                    <Input {...field} id='odoStartPre' type='number' min={1} />
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name='startFuelLevel'
                                            control={startControl}
                                            render={({ field }) => (
                                                <div>
                                                    <Label htmlFor='fuelpre'>Fuel Level</Label>
                                                    <Select {...field} onValueChange={field.onChange}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='Fuel Level' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fuelOptions.map((option) => (
                                                                <SelectItem key={option} value={option}>
                                                                    {option}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label>Vehicle Functioning</Label>
                                    <div className='grid max-w-xl grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                        {vehicleFunctioningItems.map(({ id, label, key }) => (
                                            <Controller
                                                key={id}
                                                name={key}
                                                control={startControl}
                                                render={({ field }) => (
                                                    <div className='flex items-start space-x-2'>
                                                        <Checkbox
                                                            id={id}
                                                            checked={field.value} // Bind the value
                                                            onCheckedChange={(checked) => field.onChange(checked)} // Handle change
                                                        />
                                                        <label htmlFor={id} className='font-medium text-sm'>
                                                            {label}
                                                        </label>
                                                    </div>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <Controller
                                    name='preTripComments'
                                    control={startControl}
                                    render={({ field }) => (
                                        <div>
                                            <Label htmlFor='preTripCommentsPre'>Additional Comments (Optional)</Label>
                                            <Textarea {...field} id='preTripCommentsPre' placeholder='' rows={2} />
                                        </div>
                                    )}
                                />
                                <Button type='submit' loading={isStartSubmitting} disabled={!isStartDirty} className='ml-auto w-fit'>
                                    Save Changes
                                </Button>
                            </form>
                        ) : (
                            <div className='mt-4 flex flex-col gap-3'>
                                <div className='flex flex-col gap-3 md:flex-row md:gap-32'>
                                    <div className=' text-base'>
                                        <span className='font-medium text-muted-foreground'>Odometer Start (miles): </span>
                                        {trip?.openingMiles}
                                    </div>
                                    <div className='text-base'>
                                        <span className='font-medium text-muted-foreground'>Fuel Level: </span> {checklist?.startFuelLevel}
                                    </div>
                                </div>
                                {checklist?.preTripComments && (
                                    <div className=' text-base'>
                                        <span className='font-medium text-muted-foreground'>Comments: </span>
                                        {checklist?.preTripComments}
                                    </div>
                                )}
                                <div className='space-y-2'>
                                    <Label className='font-medium text-base'>Vehicle Functioning</Label>
                                    <div className='mt-3 grid max-w-xl grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                        {!checklist ? (
                                            <>
                                                {vehicleFunctioningItems.map(({ id, label, key }) => (
                                                    <Controller
                                                        key={id}
                                                        name={key}
                                                        control={startControl}
                                                        render={({ field }) => (
                                                            <div className='flex items-start space-x-2'>
                                                                <Checkbox id={id} checked={field.value} disabled />
                                                                <label htmlFor={id} className='font-medium text-sm'>
                                                                    {label}
                                                                </label>
                                                            </div>
                                                        )}
                                                    />
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                {vehicleFunctioningItems.map(({ id, label, key }) => (
                                                    <div key={id} className='flex items-start space-x-2'>
                                                        <Checkbox id={id} checked={checklist[key as keyof Checklist]} disabled />
                                                        <label htmlFor={id} className='font-medium text-sm'>
                                                            {label}
                                                        </label>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value='trip-end' className='border-0'>
                    <AccordionTrigger className='rounded-md border-0 bg-primary/10 px-4 shadow-none'>Trip End Checklist</AccordionTrigger>
                    <AccordionContent>
                        {['TRSTR', 'TRCOM'].includes(trip.statusCode) ? (
                            <form onSubmit={handleEndSubmit(onSubmitEnd)} className='mt-4 flex flex-col gap-4'>
                                <div className='flex flex-col gap-4 md:flex-row-reverse md:justify-between'>
                                    <TripMediaUploadDialog
                                        hostId={trip.hostid}
                                        tripid={trip.tripid}
                                        belongsTo='ending'
                                        hostTripCompletingBlobs={trip.hostTripCompletingBlobs}
                                    />
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div className='space-y-2 px-0.5'>
                                            <Label htmlFor='closingMiles'>Odometer End (miles)</Label>
                                            <Input
                                                id='closingMiles'
                                                type='number'
                                                {...registerEnd('closingMiles', { required: 'Odometer reading is required.' })}
                                            />
                                        </div>
                                        <div className='space-y-2 px-0.5'>
                                            <Label htmlFor='endFuelLevel'>End Fuel Level</Label>
                                            <Controller
                                                name='endFuelLevel'
                                                control={endControl}
                                                render={({ field }) => (
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='Fuel Level' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fuelOptions.map((option) => (
                                                                <SelectItem key={option} value={option}>
                                                                    {option}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className='space-y-4 '>
                                    <Label>Vehicle Condition</Label>
                                    <Controller
                                        name='postTripCarCleaned'
                                        control={endControl}
                                        render={({ field }) => (
                                            <div className='flex items-center gap-4'>
                                                <Checkbox
                                                    id='postTripCarCleaned'
                                                    checked={field.value}
                                                    onCheckedChange={(checked) => field.onChange(checked)}
                                                />
                                                <Label htmlFor='postTripCarCleaned' className='font-medium text-sm'>
                                                    Car cleaned after delivery
                                                </Label>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='postTripComments'>
                                        Additional Comments <span className='text-muted-foreground'>(Optional)</span>
                                    </Label>
                                    <Textarea id='postTripComments' {...registerEnd('postTripComments')} rows={3} />
                                </div>

                                <Button type='submit' loading={isEndSubmitting} disabled={!isEndDirty} className='ml-auto w-fit'>
                                    Save Changes
                                </Button>
                            </form>
                        ) : (
                            <div className='mt-4 flex flex-col gap-3'>
                                <div className='flex flex-col gap-3 md:flex-row md:gap-32'>
                                    <div className=' text-base'>
                                        <span className='font-medium text-muted-foreground'>Odometer End (miles): </span>
                                        {trip?.closingMiles}
                                    </div>
                                    <div className='text-base'>
                                        <span className='font-medium text-muted-foreground'>Fuel Level: </span> {checklist?.startFuelLevel}
                                    </div>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox checked={checklist?.postTripCarCleaned} disabled id='postTripCarCleaned' />
                                    <label htmlFor='postTripCarCleaned' className='text-sm'>
                                        Car cleaned after delivery
                                    </label>
                                </div>

                                {checklist?.postTripComments && (
                                    <div className=' text-base'>
                                        <span className='font-medium text-muted-foreground'>Comments: </span>
                                        {checklist?.postTripComments}
                                    </div>
                                )}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {asMediaFile && (
                <div className='space-y-5'>
                    <div className='font-medium'>Media</div>
                    <TripMediaDisplay
                        hostTripStartingBlobs={trip?.hostTripStartingBlobs}
                        hostTripCompletingBlobs={trip?.hostTripCompletingBlobs}
                        driverTripStartingBlobs={trip?.driverTripStartingBlobs}
                        driverTripCompletingBlobs={trip?.driverTripCompletingBlobs}
                        hostAvatar={trip?.hostImage || '/dummy_avatar.png'}
                        hostName={`${trip?.hostFirstName} ${trip?.hostLastName}` || 'Host'}
                        driverAvatar={trip?.userImage || '/dummy_avatar.png'}
                        driverName={`${trip?.userFirstName} ${trip?.userlastName}` || 'Driver'}
                    />
                </div>
            )}
        </div>
    );
}

// {trip?.hostTripStartingBlobs.length > 0 && (
//     <div>
//         <h3 className='mb-2 font-medium text-gray-900 text-lg'>Media</h3>
//         {trip.hostTripStartingBlobs.map((blob: any, index: number) => (
//             <div key={index} className='md:basis-1/2 lg:basis-1/3'>
//                 <div className='p-1'>
//                     <Card>
//                         <CardContent className='flex aspect-square items-center justify-center p-6'>
//                             <div className='mb-2 text-left font-semibold text-xs'>
//                                 {new Date(blob.createdDate).toLocaleString()}
//                             </div>
//                             <div className='relative w-full pt-[100%]'>
//                                 <img
//                                     src={blob.url}
//                                     alt='Trip media'
//                                     className='absolute inset-0 h-full w-full rounded-md object-cover'
//                                 />
//                             </div>
//                             <Button variant='ghost' className='mt-2'>
//                                 Delete
//                             </Button>
//                         </CardContent>
//                     </Card>
//                 </div>
//             </div>
//         ))}
//     </div>
// )}

// <div>
//     {trip?.driverTripStartingBlobs?.length > 0 && (
//         <div className='mt-4'>
//             <h3 className='mb-2 font-medium text-gray-900 text-lg'>Driver Media</h3>
//             {trip.driverTripStartingBlobs.map((blob: any, index: number) => (
//                 <div key={index} className='md:basis-1/2 lg:basis-1/3'>
//                     <div className='p-1'>
//                         <Card>
//                             <CardContent className='flex aspect-square items-center justify-center p-6'>
//                                 <div className='mb-2 text-left font-semibold text-xs'>
//                                     {new Date(blob.createdDate).toLocaleString()}
//                                 </div>
//                                 <div className='relative w-full pt-[100%]'>
//                                     <img
//                                         src={blob.url}
//                                         alt='Trip media'
//                                         className='absolute inset-0 h-full w-full rounded-md object-cover'
//                                     />
//                                 </div>
//                                 <Button variant='ghost' className='mt-2'>
//                                     Delete
//                                 </Button>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </div>
//             ))}
//         </div>
//     )}
// </div>
