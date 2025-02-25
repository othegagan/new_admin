'use client';

import TimeSelect from '@/app/(root)/trip-details/_components/modification/time-select';
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from '@/components/ui/extension/dialog';
import { cn, convertToTimeZoneISO, formatDateAndTime, formatTime } from '@/lib/utils';
import { sendMessageInChat } from '@/server/chat';
import { undoTripRejectionOrCancellation } from '@/server/trips';
import { getLocalTimeZone, parseDate } from '@internationalized/date';
import { Undo2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { AdaptiveBody, AdaptiveFooter } from '../ui/extension/adaptive-dialog';
import { Label } from '../ui/extension/field';
import { Textarea } from '../ui/textarea';

import {
    Calendar,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    CalendarHeading
} from '@/components/ui/extension/calendar';
import { DatePicker, DatePickerButton, DatePickerContent } from '@/components/ui/extension/date-picker';
import { format } from 'date-fns';

interface UndoDialogProps {
    className?: string;
    buttonText?: 'Undo Rejection' | 'Undo Cancellation';
    tripId: number;
    startDate: string;
    endDate: string;
    zipcode: string;
    onActionComplete?: () => void;
}

const rejectionText =
    'This action will reinstate the trip. If a refund was previously issued, a chargeback will be initiated. Are you sure you want to undo the rejection?';

const cancellationText =
    'This action will reinstate the trip. If a refund was previously issued, a chargeback will be initiated. Are you sure you want to undo the cancellation?';

export default function TripUndoDialog({ buttonText, tripId, startDate, endDate, zipcode, onActionComplete, className }: UndoDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [comments, setComments] = useState('');

    const [newStartDate, setNewStartDate] = useState(parseDate(formatDateAndTime(startDate, zipcode, 'YYYY-MM-DD')));
    const [newEndDate, setNewEndDate] = useState(parseDate(formatDateAndTime(endDate, zipcode, 'YYYY-MM-DD')));

    const [newStartTime, setNewStartTime] = useState(formatTime(startDate, zipcode) || '10:00:00');
    const [newEndTime, setNewEndTime] = useState(formatTime(endDate, zipcode) || '10:00:00');

    function handleOpen() {
        setIsOpen(true);
    }

    function handleClose() {
        setIsOpen(false);
        setComments('');
        setIsSubmitting(false);
        onActionComplete?.();
        setNewStartDate(parseDate(formatDateAndTime(startDate, zipcode, 'YYYY-MM-DD')));
        setNewEndDate(parseDate(formatDateAndTime(endDate, zipcode, 'YYYY-MM-DD')));
        setNewStartTime(formatTime(startDate, zipcode) || '10:00:00');
        setNewEndTime(formatTime(endDate, zipcode) || '10:00:00');
    }

    async function handleSubmit() {
        setIsSubmitting(true);

        const startDate = format(newStartDate.toDate(getLocalTimeZone()), 'yyyy-MM-dd');
        const endDate = format(newEndDate.toDate(getLocalTimeZone()), 'yyyy-MM-dd');

        const UTCStartDate = convertToTimeZoneISO(`${startDate}T${newStartTime}`, zipcode);
        const UTCEndDate = convertToTimeZoneISO(`${endDate}T${newEndTime}`, zipcode);

        // Check if the start date is greater than current utc date
        if (new Date(UTCStartDate) < new Date()) {
            toast.error('Start date cannot be in the past');
            setIsSubmitting(false);
            return;
        }
        // Check if the end date is greater than current utc date
        if (new Date(UTCEndDate) < new Date()) {
            toast.error('End date cannot be in the past');
            setIsSubmitting(false);
            return;
        }

        // Check if the end date is greater than the start date
        if (new Date(UTCEndDate) < new Date(UTCStartDate)) {
            toast.error('End date cannot be before the start date');
            setIsSubmitting(false);
            return;
        }

        try {
            const payload = {
                tripid: tripId,
                startTime: UTCStartDate,
                endTime: UTCEndDate
            };

            const response = await undoTripRejectionOrCancellation(payload);
            if (response.success) {
                if (comments) await sendMessageInChat(tripId, comments);
                toast.success(response.message);
                setIsOpen(false);
                handleClose();
                onActionComplete?.();
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error.message);
            setIsSubmitting(false);
            console.error(error.message);
        } finally {
            onActionComplete?.();
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Button
                variant='ghost'
                type='button'
                className={cn(
                    'flex flex-row items-center gap-2 py-2 font-semibold text-[14px] text-neutral-700 dark:text-neutral-400',
                    className
                )}
                onClick={handleOpen}>
                <Undo2 className='size-5 ' /> {buttonText}
            </Button>

            {isOpen && (
                <Dialog>
                    <DialogOverlay isDismissable={false} onOpenChange={handleClose} isOpen={isOpen}>
                        <DialogContent role='alertdialog' className='xl:max-w-[60%]'>
                            <DialogHeader>
                                <DialogTitle className='text-left' aria-labelledby={`${buttonText}-dialog`}>
                                    {buttonText}?
                                </DialogTitle>
                            </DialogHeader>
                            <AdaptiveBody className='flex flex-col gap-4'>
                                <div className='flex flex-col gap-1 text-muted-foreground text-sm'>
                                    {buttonText === 'Undo Rejection' ? rejectionText : cancellationText}
                                </div>
                                <div className='space-y-2'>
                                    <Label>
                                        Message <span className='text-muted-foreground'>(Optional)</span>
                                    </Label>
                                    <Textarea
                                        autoFocus={false}
                                        className='w-full'
                                        placeholder=''
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                    />
                                </div>

                                <div className='grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-6'>
                                    <div className=' flex items-center gap-3 p-1'>
                                        <div className='flex w-full flex-1 flex-col gap-2'>
                                            <Label>Start Date</Label>
                                            <DatePicker aria-label='Select Date' shouldCloseOnSelect={true} className='w-full flex-1'>
                                                <DatePickerButton date={newStartDate} className='w-full flex-1' />
                                                <DatePickerContent className='flex flex-col '>
                                                    <Calendar value={newStartDate} onChange={(value) => setNewStartDate(value)}>
                                                        <CalendarHeading />
                                                        <CalendarGrid>
                                                            <CalendarGridHeader>
                                                                {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
                                                            </CalendarGridHeader>
                                                            <CalendarGridBody>{(date) => <CalendarCell date={date} />}</CalendarGridBody>
                                                        </CalendarGrid>
                                                    </Calendar>
                                                </DatePickerContent>
                                            </DatePicker>
                                        </div>
                                        <TimeSelect
                                            label='Start Time'
                                            defaultValue={formatTime(startDate, zipcode)}
                                            onChange={(time: any) => setNewStartTime(time)}
                                        />
                                    </div>

                                    <div className=' flex items-center gap-3 p-1'>
                                        <div className='flex w-full flex-1 flex-col gap-2'>
                                            <Label>End Date</Label>
                                            <DatePicker aria-label='Select Date' shouldCloseOnSelect={true}>
                                                <DatePickerButton date={newEndDate} />
                                                <DatePickerContent className='flex flex-col '>
                                                    <Calendar value={newEndDate} onChange={(value) => setNewEndDate(value)}>
                                                        <CalendarHeading />
                                                        <CalendarGrid>
                                                            <CalendarGridHeader>
                                                                {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
                                                            </CalendarGridHeader>
                                                            <CalendarGridBody>{(date) => <CalendarCell date={date} />}</CalendarGridBody>
                                                        </CalendarGrid>
                                                    </Calendar>
                                                </DatePickerContent>
                                            </DatePicker>
                                        </div>
                                        <TimeSelect
                                            label='End Time'
                                            defaultValue={formatTime(endDate, zipcode)}
                                            onChange={(time: any) => setNewEndTime(time)}
                                        />
                                    </div>
                                </div>
                            </AdaptiveBody>
                            <AdaptiveFooter>
                                <Button variant='ghost' className='w-fit' disabled={isSubmitting} onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button className='w-fit' loading={isSubmitting} onClick={handleSubmit}>
                                    {buttonText}
                                </Button>
                            </AdaptiveFooter>
                        </DialogContent>
                    </DialogOverlay>
                </Dialog>
            )}
        </>
    );
}
