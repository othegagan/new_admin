'use client';

import { Button } from '@/components/ui/button';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { Label } from '@/components/ui/extension/field';
import { convertToTimeZoneISO, formatDateAndTime } from '@/lib/utils';
import { updateUnavailability } from '@/server/dynamicPricingAndUnavailability';
import '@/styles/fullcalendar.css';
import { addDays, format } from 'date-fns';
import { SquarePen } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { DateRangeCalendar } from '../DateRangeCalendar';

interface UpdateUnavailabilityFormProps {
    refetchData: () => void;
    zipcode: string;
    hostId: number;
    dbStartDate: string;
    dbEndDate: string;
    dbId: number;
}

export default function UpdateUnavailabilityForm({ refetchData, zipcode, dbStartDate, dbEndDate, dbId }: UpdateUnavailabilityFormProps) {
    const [open, setOpen] = useState(false);

    const [startDate, setStartDate] = useState(formatDateAndTime(dbStartDate, zipcode, 'YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(formatDateAndTime(dbEndDate, zipcode, 'YYYY-MM-DD'));

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
            const payload = {
                vinunavailableid: dbId,
                day: 0,
                repeattype: 0,
                startdate: convertToTimeZoneISO(`${startDate}T00:00:00`, zipcode),
                enddate: convertToTimeZoneISO(`${endDate}T23:59:59`, zipcode)
            };

            const response = await updateUnavailability(payload);

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
            <Button variant='secondary' size='icon' className='h-auto w-auto p-1.5' onClick={openDialog}>
                <SquarePen className='size-4' />
            </Button>

            <AdaptiveDialog isOpen={open} onClose={closeDialog} title='Update Unavailability'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <AdaptiveBody className='mb-4 space-y-4'>
                        <div className='flex flex-col gap-2'>
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
                        <Button variant='black' type='submit' loading={isSubmitting} loadingText='Updating...'>
                            Update
                        </Button>
                    </AdaptiveFooter>
                </form>
            </AdaptiveDialog>
        </>
    );
}
