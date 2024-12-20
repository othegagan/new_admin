'use client';

import { Button } from '@/components/ui/extension/button';
import {
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    CalendarHeading,
    RangeCalendar
} from '@/components/ui/extension/calendar';
import { DatePickerContent, DateRangePicker } from '@/components/ui/extension/date-picker';
import { cn } from '@/lib/utils';
import { getLocalTimeZone, parseDate, today } from '@internationalized/date';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Group } from 'react-aria-components';
import { GoDash } from 'react-icons/go';
import { useMediaQuery } from 'react-responsive';

interface DateRangeCalendarProps {
    startDate: string;
    endDate: string;
    setStartDate: (value: string) => void;
    setEndDate: (value: string) => void;
    disabledDates?: any;
}

export function DateRangeCalendar({ startDate, endDate, setStartDate, setEndDate, disabledDates }: DateRangeCalendarProps) {
    const [dates, setDates] = useState<any>({
        start: parseDate(startDate),
        end: parseDate(endDate)
    });

    useEffect(() => {
        setDates({
            start: parseDate(startDate),
            end: parseDate(endDate)
        });
    }, [startDate, endDate]);

    function onDateSelect(item: any) {
        setDates(item);
        setStartDate(format(item.start.toDate(getLocalTimeZone()), 'yyyy-MM-dd'));
        setEndDate(format(item.end.toDate(getLocalTimeZone()), 'yyyy-MM-dd'));
    }

    const isTabletOrLarger = useMediaQuery({ query: '(min-width: 768px)' });

    return (
        <DateRangePicker aria-label='Select Date' shouldCloseOnSelect={true}>
            <Group>
                <Button
                    variant='outline'
                    className={cn(
                        'flex w-full cursor-pointer items-center justify-start rounded-md border border-neutral-200 px-3 py-2 text-left font-normal text-sm',
                        !dates && 'text-muted-foreground'
                    )}>
                    {dates?.end ? (
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center justify-start'>
                                <CalendarIcon className='mr-1 size-4' /> {format(dates.start.toDate(getLocalTimeZone()), 'LLL dd, y')}
                            </div>
                            <GoDash className='mx-3' />
                            <div className='flex items-center justify-end'>{format(dates.end.toDate(getLocalTimeZone()), 'LLL dd, y')}</div>
                        </div>
                    ) : (
                        <span>Pick a date</span>
                    )}
                </Button>
            </Group>

            <DatePickerContent>
                <RangeCalendar
                    className='w-fit select-none'
                    aria-label='Date range (uncontrolled)'
                    value={dates}
                    onChange={onDateSelect}
                    visibleDuration={{ months: isTabletOrLarger ? 2 : 1 }}
                    pageBehavior='visible'
                    minValue={today(getLocalTimeZone())}>
                    <CalendarHeading />
                    <div className='hidden gap-6 overflow-auto md:flex'>
                        <CalendarGrid>
                            <CalendarGridHeader>{(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                            <CalendarGridBody>{(date) => <CalendarCell date={date} />}</CalendarGridBody>
                        </CalendarGrid>
                        <CalendarGrid offset={{ months: 1 }}>
                            <CalendarGridHeader>{(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                            <CalendarGridBody>{(date) => <CalendarCell date={date} />}</CalendarGridBody>
                        </CalendarGrid>
                    </div>
                    <div className='flex gap-6 overflow-auto md:hidden'>
                        <CalendarGrid>
                            <CalendarGridHeader>{(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}</CalendarGridHeader>
                            <CalendarGridBody>{(date) => <CalendarCell date={date} />}</CalendarGridBody>
                        </CalendarGrid>
                    </div>
                </RangeCalendar>
            </DatePickerContent>
        </DateRangePicker>
    );
}
