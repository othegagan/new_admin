import { EmployeesIcon, FindMyCarIcon, GuestsIcon, HostsIcon, TripsIcon, VehiclesIcon } from '@/public/icons';
import { Clock, MessageSquareText, SlidersHorizontal } from 'lucide-react';

export const AUTH_ROUTES = {
    SIGN_IN: '/sign-in',
    FORGOT_PASSWORD: '/forgot-password',
    TERMS: '/terms'
};

export const PAGE_ROUTES = {
    DASHBOARD: '/',
    PROFILE: '/profile',
    TRIPS: '/trips',
    TRIPS_TABS: {
        DAILY_VIEW: '/daily-view',
        REVIEW_REUIRED: '/review-required',
        ALL_TRIPS: '/all-trips'
    },
    TRIP_DETAILS: '/trip-details',
    TRIP_DETAILS_SWAP: '/swap',
    VEHICLES: '/vehicles',
    ADD_VEHICLE: '/add-vehicle',
    VEHICLE_DETAILS: {
        CALENDAR: '/calendar',
        DESCRIPTION: '/description',
        GUEST_GUIDELINES: '/guest-guidelines',
        IMPORT: '/import',
        LOCATION_DELIVERY: '/location-delivery',
        LOGS: '/logs',
        MAINTENANCE: '/maintenance',
        MASTER_DATA: '/master-data',
        MILEAGE_LIMITS: '/limits',
        NOTIFICATIONS: '/notifications',
        PHOTOS: '/photos',
        PRICING_DISCOUNTS: '/pricing-discounts',
        RENTAL_DURATION: '/rental-duration',
        TRP_HISTORY: '/trp-history',
        TELEMETICS: '/telematics',
        PLATFORM_SYNC: '/platform-sync'
    },
    CONFIGURATIONS: '/configurations',
    HOSTS: '/hosts',
    EMPLOYEES: '/employees',
    GUESTS: '/guests',
    FIND_MY_CAR: '/find-my-car',
    MESSAGES: '/messages',
    ACTIVITY_LOGS: '/activity-logs'
};

export const vehicleConfigTabs = {
    desktop: {
        calendar: {
            href: PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR,
            label: 'Calendar'
        },
        vehicleData: {
            href: PAGE_ROUTES.VEHICLE_DETAILS.MASTER_DATA,
            label: 'Master Data',
            items: [
                { href: PAGE_ROUTES.VEHICLE_DETAILS.MASTER_DATA, label: 'Master Data' },
                { href: PAGE_ROUTES.VEHICLE_DETAILS.IMPORT, label: 'Import Vehicle' },
                { href: PAGE_ROUTES.VEHICLE_DETAILS.PHOTOS, label: 'Photos' },
                { href: PAGE_ROUTES.VEHICLE_DETAILS.DESCRIPTION, label: 'Description' },
                { href: PAGE_ROUTES.VEHICLE_DETAILS.LOCATION_DELIVERY, label: 'Location Delivery' },
                { href: PAGE_ROUTES.VEHICLE_DETAILS.GUEST_GUIDELINES, label: 'Guest Guidelines' },
                { href: PAGE_ROUTES.VEHICLE_DETAILS.MILEAGE_LIMITS, label: 'Mileage Limits' },
                { href: PAGE_ROUTES.VEHICLE_DETAILS.RENTAL_DURATION, label: 'Rental Duration' }
            ]
        },
        remaining: [
            { href: PAGE_ROUTES.VEHICLE_DETAILS.PRICING_DISCOUNTS, label: 'Pricing & Discounts' },
            { href: PAGE_ROUTES.VEHICLE_DETAILS.PLATFORM_SYNC, label: 'Platform Sync' },
            { href: PAGE_ROUTES.VEHICLE_DETAILS.TELEMETICS, label: 'Telematics' },
            { href: PAGE_ROUTES.VEHICLE_DETAILS.NOTIFICATIONS, label: 'Notifications' },
            { href: PAGE_ROUTES.VEHICLE_DETAILS.MAINTENANCE, label: 'Maintenance' },
            { href: PAGE_ROUTES.VEHICLE_DETAILS.TRP_HISTORY, label: 'Trip History' },
            { href: PAGE_ROUTES.VEHICLE_DETAILS.LOGS, label: 'Activity Logs' }
        ]
    },
    mobile: [
        { id: 1, href: PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR, label: 'Calendar' },
        { id: 2, href: PAGE_ROUTES.VEHICLE_DETAILS.MASTER_DATA, label: 'Master Data' },
        { id: 3, href: PAGE_ROUTES.VEHICLE_DETAILS.IMPORT, label: 'Import Vehicle' },
        { id: 4, href: PAGE_ROUTES.VEHICLE_DETAILS.PHOTOS, label: 'Photos' },
        { id: 5, href: PAGE_ROUTES.VEHICLE_DETAILS.DESCRIPTION, label: 'Description' },
        { id: 6, href: PAGE_ROUTES.VEHICLE_DETAILS.LOCATION_DELIVERY, label: 'Location Delivery' },
        { id: 7, href: PAGE_ROUTES.VEHICLE_DETAILS.GUEST_GUIDELINES, label: 'Guest Guidelines' },
        { id: 8, href: PAGE_ROUTES.VEHICLE_DETAILS.MILEAGE_LIMITS, label: 'Mileage Limits' },
        { id: 9, href: PAGE_ROUTES.VEHICLE_DETAILS.RENTAL_DURATION, label: 'Rental Duration' },
        { id: 10, href: PAGE_ROUTES.VEHICLE_DETAILS.PLATFORM_SYNC, label: 'Platform Sync' },
        { id: 11, href: PAGE_ROUTES.VEHICLE_DETAILS.PRICING_DISCOUNTS, label: 'Pricing & Discounts' },
        { id: 12, href: PAGE_ROUTES.VEHICLE_DETAILS.TELEMETICS, label: 'Telematics' },
        { id: 13, href: PAGE_ROUTES.VEHICLE_DETAILS.NOTIFICATIONS, label: 'Notifications' },
        { id: 14, href: PAGE_ROUTES.VEHICLE_DETAILS.MAINTENANCE, label: 'Maintenance' },
        { id: 15, href: PAGE_ROUTES.VEHICLE_DETAILS.TRP_HISTORY, label: 'Trip History' },
        { id: 16, href: PAGE_ROUTES.VEHICLE_DETAILS.LOGS, label: 'Activity Logs' }
    ]
};

export const homePageItems = [
    {
        icon: <TripsIcon className='size-20' />,
        label: 'Trips',
        href: `${PAGE_ROUTES.TRIPS}${PAGE_ROUTES.TRIPS_TABS.REVIEW_REUIRED}`
    },
    {
        icon: <MessageSquareText className='size-20' />,
        label: 'Messages',
        href: PAGE_ROUTES.MESSAGES
    },
    {
        icon: <VehiclesIcon className='size-20' />,
        label: 'Vehicles',
        href: PAGE_ROUTES.VEHICLES
    },
    {
        icon: <FindMyCarIcon className='size-20' />,
        label: 'Find My Car',
        href: PAGE_ROUTES.FIND_MY_CAR
    },
    {
        icon: <Clock className='size-20' />,
        label: 'Activity Logs',
        href: PAGE_ROUTES.ACTIVITY_LOGS
    },
    {
        icon: <EmployeesIcon className='size-20' />,
        label: 'Employees',
        href: PAGE_ROUTES.EMPLOYEES
    },
    {
        icon: <GuestsIcon className='size-20' />,
        label: 'Guests',
        href: PAGE_ROUTES.GUESTS
    },
    {
        icon: <HostsIcon className='size-20' />,
        label: 'Hosts',
        href: PAGE_ROUTES.HOSTS
    },
    {
        icon: <SlidersHorizontal className='size-20' />,
        label: 'Configurations',
        href: PAGE_ROUTES.CONFIGURATIONS
    }
];
