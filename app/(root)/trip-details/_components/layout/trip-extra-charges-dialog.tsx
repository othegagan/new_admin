'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { tripExtraCharges } from '@/server/trips';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface TripExtraChargesDialogProps {
    className?: string;
    tripId: number;
    extraDayCharges?: number;
    extraMileCost?: number;
    lateFee?: number;
    buttonText?: string;
    onActionComplete?: () => void;
}

export default function TripExtraChargesDialog({
    tripId,
    extraDayCharges = 0,
    lateFee = 0,
    extraMileCost = 0,
    buttonText = 'Extra Charges',
    onActionComplete
}: TripExtraChargesDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    const {
        handleSubmit,
        reset,
        register,
        formState: { isSubmitting, isDirty, errors }
    } = useForm({
        defaultValues: {
            extraDayCharges: extraDayCharges,
            lateFee: lateFee
        }
    });

    async function onSubmit(data: any) {
        try {
            const payload = {
                tripid: tripId,
                extraDayCharges: data.extraDayCharges,
                lateFee: data.lateFee
            };
            const response = await tripExtraCharges(payload);
            // api/v1/booking/captureTripsAmount
            if (response.success) {
                reset({
                    ...data
                });
                toast.success(response.message);
                handleClose();
                window.location.reload();
            } else {
                toast.error(response.message);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to cature extra charges.');
        }
    }

    function handleOpen() {
        setIsOpen(true);
    }

    function handleClose() {
        setIsOpen(false);
        reset();
        onActionComplete?.();
    }

    return (
        <>
            <Button variant='ghost' type='button' className='font-semibold text-neutral-700 dark:text-neutral-300' onClick={handleOpen}>
                <ArrowRight className='size-5 ' /> {buttonText}
            </Button>

            {isOpen && (
                <AdaptiveDialog onClose={handleClose} isOpen={isOpen} size='xl' title='Extra Charges'>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <AdaptiveBody className='flex flex-col gap-4'>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8'>
                                <div className='space-y-2'>
                                    <Label htmlFor='extraDayCharges'>Extra Day Charges</Label>
                                    <Input {...register('extraDayCharges')} id='extraDayCharges' type='number' min={0} />
                                    {errors.extraDayCharges && <p className='text-red-500 text-xs'>{errors.extraDayCharges.message}</p>}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='lateFee'>Late Fee</Label>
                                    <Input {...register('lateFee')} id='lateFee' type='number' min={0} />
                                    {errors.lateFee && <p className='text-red-500 text-xs'>{errors.lateFee.message}</p>}
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='lateFee'>Extra Mile Charge</Label>
                                    <Input disabled type='number' value={extraMileCost} />
                                </div>
                            </div>
                        </AdaptiveBody>
                        <AdaptiveFooter>
                            <Button variant='ghost' className='w-fit' disabled={isSubmitting} onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button className='w-fit' loading={isSubmitting} type='submit' disabled={!isDirty}>
                                Capture
                            </Button>
                        </AdaptiveFooter>
                    </form>
                </AdaptiveDialog>
            )}
        </>
    );
}
