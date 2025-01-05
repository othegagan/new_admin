'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type FullCalendar from '@fullcalendar/react';
import { add, eachMonthOfInterval, endOfYear, format, isEqual, parse, startOfMonth, startOfToday } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';

function getStartOfCurrentMonth() {
    return startOfMonth(startOfToday());
}

interface MonthPickerProps {
    currentMonth: Date;
    onMonthChange: (newMonth: Date) => void;
    setCurrentMonth: React.Dispatch<React.SetStateAction<Date>>;
    calendarRef: React.RefObject<FullCalendar | null>;
    className?: string;
}

export default function MonthPicker({ currentMonth, onMonthChange, setCurrentMonth, calendarRef, className }: MonthPickerProps) {
    const [currentYear, setCurrentYear] = React.useState(format(currentMonth, 'yyyy'));
    const firstDayCurrentYear = parse(currentYear, 'yyyy', new Date());

    const months = eachMonthOfInterval({
        start: firstDayCurrentYear,
        end: endOfYear(firstDayCurrentYear)
    });

    function previousYear() {
        const firstDayPreviousYear = add(firstDayCurrentYear, { years: -1 });
        setCurrentYear(format(firstDayPreviousYear, 'yyyy'));
    }

    function nextYear() {
        const firstDayNextYear = add(firstDayCurrentYear, { years: 1 });
        setCurrentYear(format(firstDayNextYear, 'yyyy'));
    }

    const handleMonthChange = (newMonth: Date) => {
        setCurrentMonth(newMonth);
        onMonthChange(newMonth);

        if (calendarRef.current) {
            const calendarApi = calendarRef.current.getApi();
            calendarApi.gotoDate(newMonth);
        }
    };

    const goToPreviousMonth = () => {
        const previousMonth = add(currentMonth, { months: -1 });
        handleMonthChange(previousMonth);
    };

    const goToNextMonth = () => {
        const nextMonth = add(currentMonth, { months: 1 });
        handleMonthChange(nextMonth);
    };

    return (
        <div className='flex items-center gap-2'>
            <MonthChangeButton onClick={goToPreviousMonth} variant='previous' />

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant='outline' className={cn('w-[220px] justify-start text-left font-normal', className)}>
                        <Calendar className='mr-2 h-4 w-4' />
                        {format(currentMonth, 'MMM yyyy')}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                    <div className='p-3'>
                        <div className='flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0'>
                            <div className='space-y-4'>
                                <div className='relative flex items-center justify-center pt-1'>
                                    <div className='font-medium text-sm' aria-live='polite' id='month-picker'>
                                        {format(firstDayCurrentYear, 'yyyy')}
                                    </div>
                                    <div className='flex items-center space-x-1'>
                                        <MonthChangeButton onClick={previousYear} variant='previous' className='absolute left-1' />
                                        <MonthChangeButton onClick={nextYear} variant='next' className='absolute right-1' />
                                    </div>
                                </div>
                                <div className='grid w-full grid-cols-3 gap-2' aria-labelledby='month-picker'>
                                    {months.map((month) => (
                                        <div
                                            key={month.toString()}
                                            className='relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-neutral-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md dark:[&:has([aria-selected])]:bg-neutral-800'>
                                            <PopoverClose>
                                                <div
                                                    className={cn(
                                                        'inline-flex h-9 w-16 items-center justify-center rounded-md p-0 font-normal text-sm ring-offset-white transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-selected:opacity-100 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-50',
                                                        isEqual(month, currentMonth) &&
                                                            'bg-neutral-900 text-neutral-50 hover:bg-neutral-900 hover:text-neutral-50 focus:bg-neutral-900 focus:text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900 dark:focus:bg-neutral-50 dark:focus:text-neutral-900 dark:hover:bg-neutral-50 dark:hover:text-neutral-900',
                                                        !isEqual(month, currentMonth) &&
                                                            isEqual(month, getStartOfCurrentMonth()) &&
                                                            'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50'
                                                    )}
                                                    tabIndex={-1}
                                                    onClick={() => handleMonthChange(month)}>
                                                    <time dateTime={format(month, 'yyyy-MM-dd')}>{format(month, 'MMM')}</time>
                                                </div>
                                            </PopoverClose>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            <MonthChangeButton onClick={goToNextMonth} variant='next' />
        </div>
    );
}

function MonthChangeButton({ onClick, variant, className }: { onClick: () => void; variant: 'previous' | 'next'; className?: string }) {
    return (
        <button
            type='button'
            id={`${variant === 'previous' ? 'previous-month' : 'next-month'}`}
            aria-label={`Go to ${variant === 'previous' ? 'previous' : 'next'} month`}
            className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'rounded-md bg-transparent px-2', className)}
            onClick={onClick}>
            {variant === 'previous' ? <ChevronLeft className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
        </button>
    );
}
