import { ConfigurationsIcon, EmployeesIcon, FindMyCarIcon, TripsIcon, VehiclesIcon } from '@/public/icons';
import { MessageSquareText, UserCog } from 'lucide-react';

export const AUTH_ROUTES = {
    SIGN_IN: '/sign-in',
    FORGOT_PASSWORD: '/forgot-password',
    TERMS: '/terms'
};

export const PAGE_ROUTES = {
    DASHBOARD: '/',
    PROFILE: '/profile',
    TRIPS: '/trips',
    VEHICLES: '/vehicles',
    ADD_VEHICLE: '/add-vehicle',
    VEHICLE_DETAILS: {
        CALENDAR: '/calendar',
        LOCATION: '/location'
    },
    CONFIGURATIONS: '/configurations',
    HOSTS: '/hosts',
    EMPLOYEES: '/employees',
    GUESTS: '/guests',
    FIND_MY_CAR: '/find-my-car',
    MESSAGES: '/messages'
};

export const vehicleConfigTabs = [
    { value: PAGE_ROUTES.VEHICLE_DETAILS.CALENDAR, label: 'Calendar' },
    { value: 'master-data', label: 'Master Data' },
    { value: 'pricing', label: 'Pricing & Discounts' },
    { value: 'platform-sync', label: 'Platform Sync' },
    { value: 'telematics', label: 'Telematics' },
    { value: 'notifications', label: 'Notifications' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'trip-history', label: 'Trip History' },
    { value: 'activity-logs', label: 'Activity Logs' }
];

export const homePageItems = [
    {
        icon: <TripsIcon className='size-20' />,
        label: 'Trips',
        href: PAGE_ROUTES.TRIPS
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
        icon: <EmployeesIcon className='size-20' />,
        label: 'Employees',
        href: PAGE_ROUTES.EMPLOYEES
    },
    {
        icon: <UserCog className='size-20' />,
        label: 'Hosts',
        href: PAGE_ROUTES.HOSTS
    },
    {
        icon: <ConfigurationsIcon className='size-20' />,
        label: 'Configurations',
        href: PAGE_ROUTES.CONFIGURATIONS
    }
];
