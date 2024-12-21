'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { auth } from '@/lib/auth';
import { convertToTimeZoneISO } from '@/lib/utils';
import { insertUnavailability } from '@/server/dynamicPricingAndUnavailability';
import '@/styles/fullcalendar.css';
import { addDays, format } from 'date-fns';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DateRangeCalendar } from '../DateRangeCalendar';

interface AddUnavailabilityFormProps {
    vin: string;
    vehicleId: number;
    refetchData: () => void;
    zipcode: string;
}
export default function AddUnavailabilityForm({ vin, vehicleId, refetchData, zipcode }: AddUnavailabilityFormProps) {
    const [open, setOpen] = useState(false);

    const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));

    function openDialog() {
        setOpen(true);
    }

    function closeDialog() {
        setOpen(false);
        setStartDate(format(new Date(), 'yyyy-MM-dd'));
        setEndDate(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
        reset();
    }

    const {
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        mode: 'onChange'
    });

    const onSubmit = async (formData: any) => {
        try {
            const session = await auth();
            const payload = {
                day: 0,
                vin: vin,
                vehicleid: vehicleId,
                hostid: session?.iduser,
                repeattype: 0,
                startdate: convertToTimeZoneISO(`${startDate}T00:00:00`, zipcode),
                enddate: convertToTimeZoneISO(`${endDate}T23:59:59`, zipcode)
            };

            const response = await insertUnavailability(payload);

            if (response.success) {
                refetchData();
                closeDialog();
                toast.success(response.message);
            } else {
                toast.error(response.message);
            }
        } catch (error: unknown) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <>
            <Button variant='black' className='w-fit' onClick={openDialog}>
                Add
            </Button>

            <AdaptiveDialog isOpen={open} onClose={closeDialog} title='Add New Unavailability'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <AdaptiveBody className='space-y-4'>
                        <div className='flex max-w-sm flex-col gap-2'>
                            <Label>Date Range</Label>
                            <DateRangeCalendar
                                startDate={startDate}
                                endDate={endDate}
                                setStartDate={setStartDate}
                                setEndDate={setEndDate}
                            />
                        </div>
                    </AdaptiveBody>
                    <AdaptiveFooter>
                        <Button variant='outline' onClick={closeDialog}>
                            Cancel
                        </Button>
                        <Button variant='black' type='submit' loading={isSubmitting} loadingText='Saving...'>
                            Save
                        </Button>
                    </AdaptiveFooter>
                </form>
            </AdaptiveDialog>
        </>
    );
}
