import { ConfigurationsIcon, EmployeesIcon, FindMyCarIcon, GuestsIcon, HostsIcon, TripsIcon, VehiclesIcon } from '@/public/icons';
import type { NavGroupProps, Role } from '@/types';
import { HomeIcon, User2 } from 'lucide-react';
import { PAGE_ROUTES } from './routes';

export const ROLES = {
    DRIVER: 'Driver',
    HOST: 'Host',
    EMPLOYEE: 'Host Employee'
} as const;

export const CHANNELS = {
    BUNDEE: 'Bundee',
    FLUX: 'Flux',
    TURO: 'Turo'
} as const;

/**
 * Nav Items
 * This is the main navigation items for the application.
 * Each item can have a sub items which can be accessed by the user with the role.
 * The user can access the sub items if the user has the role for the sub item.
 * Add the roles for each item in the `roles` array.
 */

const navItems: NavGroupProps[] = [
    {
        title: '',
        items: [
            {
                title: 'Home',
                url: PAGE_ROUTES.DASHBOARD,
                icon: <HomeIcon />,
                roles: [ROLES.EMPLOYEE, ROLES.HOST]
            },
            {
                title: 'Trips',
                url: PAGE_ROUTES.TRIPS,
                icon: <TripsIcon />,
                roles: [ROLES.EMPLOYEE, ROLES.HOST]
            },
            {
                title: 'Vehicles',
                url: PAGE_ROUTES.VEHICLES,
                icon: <VehiclesIcon />,
                roles: [ROLES.EMPLOYEE, ROLES.HOST]
            },
            {
                title: 'Find My Car',
                url: PAGE_ROUTES.FIND_MY_CAR,
                icon: <FindMyCarIcon />,
                roles: [ROLES.EMPLOYEE, ROLES.HOST]
            },
            {
                title: 'Hosts',
                url: PAGE_ROUTES.HOSTS,
                icon: <HostsIcon />,
                roles: [ROLES.EMPLOYEE, ROLES.HOST]
            },
            {
                title: 'Guests',
                url: PAGE_ROUTES.GUESTS,
                icon: <GuestsIcon />,
                roles: [ROLES.EMPLOYEE, ROLES.HOST]
            },
            {
                title: 'Employees',
                url: PAGE_ROUTES.EMPLOYEES,
                icon: <EmployeesIcon />,
                roles: [ROLES.EMPLOYEE, ROLES.HOST]
            }
        ]
    },
    {
        title: 'Other',
        items: [
            {
                title: 'Configurations',
                url: PAGE_ROUTES.CONFIGURATIONS,
                icon: <ConfigurationsIcon />,
                roles: [ROLES.EMPLOYEE, ROLES.HOST]
            },
            {
                title: 'Profile',
                url: '/profile',
                icon: <User2 />,
                roles: [ROLES.EMPLOYEE, ROLES.HOST]
            }
            // {
            //     title: 'Settings',
            //     icon: <Settings />,
            //     roles: [ROLES.EMPLOYEE, ROLES.HOST],
            //     items: [
            //         {
            //             title: 'Profile',
            //             url: '/settings',
            //             icon: <UserCog />,
            //             roles: [ROLES.EMPLOYEE, ROLES.HOST]
            //         },
            //         {
            //             title: 'Account',
            //             url: '/settings/account',
            //             icon: <PanelTopClose />,
            //             roles: [ROLES.EMPLOYEE, ROLES.HOST]
            //         }
            //     ]
            // },
        ]
    }
];

/**
 * Get Nav Items
 * This function filters the nav items based on the user's role.
 * @param role - The user's role.
 * @returns The filtered nav items.
 */
export const getNavItems = (role: Role): NavGroupProps[] => {
    return navItems
        .map((group) => {
            // Create a copy of the group to avoid mutating the original
            const filteredGroup = { ...group };

            if (group.items) {
                // Filter the items array
                filteredGroup.items = group.items
                    .map((item) => {
                        // Handle nested items (like in Settings)
                        if (item.items) {
                            return {
                                ...item,
                                items: item.items.filter((subItem) => subItem.roles?.includes(role))
                            };
                        }
                        // Handle regular items
                        return item;
                    })
                    .filter(
                        (item) =>
                            // Keep items that either have roles matching or have remaining nested items
                            item.roles?.includes(role) || (item.items && item.items.length > 0)
                    );
            }

            return filteredGroup;
        })
        .filter(
            (group) =>
                // Only keep groups that have remaining items
                group.items && group.items.length > 0
        );
};

export const stateList = [
    { id: 1, name: 'Alabama', value: 'alabama', abbreviation: 'AL' },
    { id: 2, name: 'Alaska', value: 'alaska', abbreviation: 'AK' },
    { id: 3, name: 'Arizona', value: 'arizona', abbreviation: 'AZ' },
    { id: 4, name: 'Arkansas', value: 'arkansas', abbreviation: 'AR' },
    { id: 5, name: 'California', value: 'california', abbreviation: 'CA' },
    { id: 6, name: 'Colorado', value: 'colorado', abbreviation: 'CO' },
    { id: 7, name: 'Connecticut', value: 'connecticut', abbreviation: 'CT' },
    { id: 8, name: 'Delaware', value: 'delaware', abbreviation: 'DE' },
    { id: 9, name: 'Florida', value: 'florida', abbreviation: 'FL' },
    { id: 10, name: 'Georgia', value: 'georgia', abbreviation: 'GA' },
    { id: 11, name: 'Hawaii', value: 'hawaii', abbreviation: 'HI' },
    { id: 12, name: 'Idaho', value: 'idaho', abbreviation: 'ID' },
    { id: 13, name: 'Illinois', value: 'illinois', abbreviation: 'IL' },
    { id: 14, name: 'Indiana', value: 'indiana', abbreviation: 'IN' },
    { id: 15, name: 'Iowa', value: 'iowa', abbreviation: 'IA' },
    { id: 16, name: 'Kansas', value: 'kansas', abbreviation: 'KS' },
    { id: 17, name: 'Kentucky', value: 'kentucky', abbreviation: 'KY' },
    { id: 18, name: 'Louisiana', value: 'louisiana', abbreviation: 'LA' },
    { id: 19, name: 'Maine', value: 'maine', abbreviation: 'ME' },
    { id: 20, name: 'Maryland', value: 'maryland', abbreviation: 'MD' },
    { id: 21, name: 'Massachusetts', value: 'massachusetts', abbreviation: 'MA' },
    { id: 22, name: 'Michigan', value: 'michigan', abbreviation: 'MI' },
    { id: 23, name: 'Minnesota', value: 'minnesota', abbreviation: 'MN' },
    { id: 24, name: 'Mississippi', value: 'mississippi', abbreviation: 'MS' },
    { id: 25, name: 'Missouri', value: 'missouri', abbreviation: 'MO' },
    { id: 26, name: 'Montana', value: 'montana', abbreviation: 'MT' },
    { id: 27, name: 'Nebraska', value: 'nebraska', abbreviation: 'NE' },
    { id: 28, name: 'Nevada', value: 'nevada', abbreviation: 'NV' },
    { id: 29, name: 'New Hampshire', value: 'new hampshire', abbreviation: 'NH' },
    { id: 30, name: 'New Jersey', value: 'new jersey', abbreviation: 'NJ' },
    { id: 31, name: 'New Mexico', value: 'new mexico', abbreviation: 'NM' },
    { id: 32, name: 'New York', value: 'new york', abbreviation: 'NY' },
    {
        id: 33,
        name: 'North Carolina',
        value: 'north carolina',
        abbreviation: 'NC'
    },
    { id: 34, name: 'North Dakota', value: 'north dakota', abbreviation: 'ND' },
    { id: 35, name: 'Ohio', value: 'ohio', abbreviation: 'OH' },
    { id: 36, name: 'Oklahoma', value: 'oklahoma', abbreviation: 'OK' },
    { id: 37, name: 'Oregon', value: 'oregon', abbreviation: 'OR' },
    { id: 38, name: 'Pennsylvania', value: 'pennsylvania', abbreviation: 'PA' },
    { id: 39, name: 'Rhode Island', value: 'rhode island', abbreviation: 'RI' },
    {
        id: 40,
        name: 'South Carolina',
        value: 'south carolina',
        abbreviation: 'SC'
    },
    { id: 41, name: 'South Dakota', value: 'south dakota', abbreviation: 'SD' },
    { id: 42, name: 'Tennessee', value: 'tennessee', abbreviation: 'TN' },
    { id: 43, name: 'Texas', value: 'texas', abbreviation: 'TX' },
    { id: 44, name: 'Utah', value: 'utah', abbreviation: 'UT' },
    { id: 45, name: 'Vermont', value: 'vermont', abbreviation: 'VT' },
    { id: 46, name: 'Virginia', value: 'virginia', abbreviation: 'VA' },
    { id: 47, name: 'Washington', value: 'washington', abbreviation: 'WA' },
    { id: 48, name: 'West Virginia', value: 'west virginia', abbreviation: 'WV' },
    { id: 49, name: 'Wisconsin', value: 'wisconsin', abbreviation: 'WI' },
    { id: 50, name: 'Wyoming', value: 'wyoming', abbreviation: 'WY' }
];

export const fuseSettings = {
    threshold: 0.4,
    distance: 100,
    minMatchCharLength: 2,
    shouldSort: true,
    includeScore: true,
    useExtendedSearch: true,
    ignoreLocation: true,
    findAllMatches: true,
    isCaseSensitive: false
};

export const vehicleConfigTabsContent = {
    calendar: {
        title: 'Calendar',
        description: "View your vehicle's availability at one place!"
    },
    master_data: {
        title: 'Master Data',
        description: "Enter the vehicle's plate number, state, and color to complete your vehicle listing."
    },
    import: {
        title: 'Import Vehicle',
        description: 'Import vehicle information from another platform or from an existing vehicle on this platform.'
    },
    photos: {
        title: 'Photos',
        description: 'Upload high-quality photos of your vehicle to attract more renters.'
    },
    description: {
        title: 'Description',
        description:
            'Provide a detailed description of your vehicle, including its features, condition, and any unique selling points. It will be displayed to potential renters on the vehicle listing page.'
    },
    location_delivery: {
        title: 'Location & Delivery',
        description: 'Enter the primary location where your vehicle will be available for pickup and return.'
    },
    guest_guidelines: {
        title: 'Guest Guidelines',
        description: 'Set guidelines for your guests. These guidelines will be displayed to potential guests when they book your vehicle.'
    },
    mileage_limits: {
        title: 'Mileage Limits',
        description: ''
    },
    rental_duration: {
        title: 'Rental Duration',
        description: 'Set minimum and maximum rental durations to control booking flexibility.'
    },
    pricing: {
        title: 'Pricing',
        description: ''
    },
    discounts: {
        title: 'Discounts',
        description: 'The configured discount rate will be applied to the total reservation amount.'
    },
    platform_sync: {
        title: 'Platform Sync',
        description: 'Connect your vehicle listings to other rental platforms for effective booking management.'
    },
    telematics: {
        title: 'Telematics',
        description: ''
    },
    notifications: {
        title: 'Configure Automated Notifications',
        description: ''
    },
    maintenance: {
        title: 'Maintenance',
        description: 'Track maintenance, repairs, and expenses for your vehicle.'
    },
    trp_history: {
        title: 'Trip History',
        description: ''
    },
    activity_logs: {
        title: 'Activity Logs',
        description: 'Shows a detailed history of actions performed on your vehicle.'
    }
};
