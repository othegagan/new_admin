'use client';

import { PAGE_ROUTES } from '@/constants/routes';
import { currencyFormatter, formatDateAndTime } from '@/lib/utils';
import '@/styles/fullcalendar.css';
import type { EventSourceInput } from '@fullcalendar/core/index.js';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { addDays, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MdBlock } from 'react-icons/md';

interface CalendarComponentProps {
    trips: any[];
    blockedDates: any[];
    dynamicPricies: any[];
    calendarRef: React.RefObject<FullCalendar | null>;
    currentMonth: Date;
    vehiclePricePerDay: number;
    zipcode: string;
}

export default function CalendarComponent({
    trips,
    blockedDates,
    dynamicPricies,
    calendarRef,
    currentMonth,
    vehiclePricePerDay,
    zipcode
}: CalendarComponentProps) {
    const router = useRouter();
    const [formattedTrips, setFormattedTrips] = useState<any[]>([]);

    useEffect(() => {
        const transformedEvents = trips.map((trip) => {
            const tripId = trip.tripid;
            const { backgroundColor, textColor, statusText } = getColorForStatus(trip.statusCode);
            const zipcode = trip.vehicleDetails[0].zipcode;
            const startDate = formatDateAndTime(trip.starttime, zipcode, 'YYYY-MM-DDTHH:mm:ss');
            const endDate = addDays(new Date(formatDateAndTime(trip.endtime, zipcode, 'YYYY-MM-DDTHH:mm:ss')), 1).toISOString();
            return {
                title: `BID: ${tripId} - ${statusText}`,
                start: startDate,
                end: endDate,
                allDay: true,
                id: tripId,
                status: trip.status,
                backgroundColor,
                textColor
            };
        });

        setFormattedTrips(transformedEvents);
    }, [trips]);

    const renderEventContent = (eventInfo: any) => {
        return <div className='my-0.5 py-0.5 text-12'>{eventInfo.event.title}</div>;
    };

    const renderDayCellContent = (dayInfo: any) => {
        const date = dayInfo.date;

        const dynamicPrice = dynamicPricies?.find((price: any) => {
            const startDate = parseISO(formatDateAndTime(price.fromDate, zipcode, 'YYYY-MM-DD'));
            const endDate = parseISO(formatDateAndTime(price.toDate, zipcode, 'YYYY-MM-DD'));
            return isSameDay(date, startDate) || isSameDay(date, endDate) || isWithinInterval(date, { start: startDate, end: endDate });
        });

        const price = dynamicPrice ? dynamicPrice?.price : vehiclePricePerDay;

        const blockedDate = blockedDates?.find((b: any) => {
            const startDate = parseISO(formatDateAndTime(b.startdate, zipcode, 'YYYY-MM-DD'));
            const endDate = parseISO(formatDateAndTime(b.enddate, zipcode, 'YYYY-MM-DD'));
            return isSameDay(date, startDate) || isSameDay(date, endDate) || isWithinInterval(date, { start: startDate, end: endDate });
        });

        return (
            <div className='h-full'>
                <div className='flex items-center justify-between p-1 text-12'>
                    {blockedDate ? (
                        <div className='flex items-center justify-end'>
                            <MdBlock className='text-red-300' size={16} />
                        </div>
                    ) : (
                        <p> {''}</p>
                    )}
                    {dayInfo.dayNumberText}
                </div>
                <div className='bg-muted pl-2 text-center text-[13px] text-neutral-700 dark:text-neutral-200'>
                    {currencyFormatter({ value: price, roundTo: 0 })}
                </div>
            </div>
        );
    };

    const handleEventClick = (data: { event: { id: string } }) => {
        const tripId = data.event.id;
        router.push(`${PAGE_ROUTES.TRIP_DETAILS}/${tripId}`);
    };

    return (
        <>
            <div className='w-full'>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                    initialView='dayGridMonth'
                    initialDate={currentMonth}
                    events={[...formattedTrips] as EventSourceInput}
                    eventClick={handleEventClick}
                    headerToolbar={false}
                    eventContent={renderEventContent}
                    dayCellContent={renderDayCellContent}
                />
            </div>
        </>
    );
}

const getColorForStatus = (status: string) => {
    switch (true) {
        case ['REREQ', 'TRMODREQ'].includes(status):
            return {
                backgroundColor: '#FFA500',
                textColor: '#FFFFFF',
                statusText: 'Requested'
            };
        case ['REAPP', 'REMODHLD', 'RECANREQ'].includes(status):
            return {
                backgroundColor: '#FFC107',
                textColor: '#000000',
                statusText: 'Upcoming'
            };
        case ['RECANREQ'].includes(status):
            return {
                backgroundColor: '#FFC107',
                textColor: '#000000',
                statusText: 'Cancellation Requested'
            };
        case ['TRSTR', 'TRMODHLD'].includes(status):
            return {
                backgroundColor: '#007BFF',
                textColor: '#FFFFFF',
                statusText: 'Ongoing'
            };
        case ['TRCOM'].includes(status):
            return {
                backgroundColor: '#34A853',
                textColor: '#FFFFFF',
                statusText: 'Completed'
            };
        case ['RECAN'].includes(status):
            return {
                backgroundColor: '#DC3545',
                textColor: '#FFFFFF',
                statusText: 'Cancelled'
            };
        case ['REREJ'].includes(status):
            return {
                backgroundColor: '#DC3545',
                textColor: '#FFFFFF',
                statusText: 'Rejected'
            };
        default:
            return {
                backgroundColor: '#6C757D',
                textColor: '#FFFFFF',
                statusText: ''
            };
    }
};
