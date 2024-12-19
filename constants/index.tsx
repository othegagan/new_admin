import { EmployeesIcon, FindMyCarIcon, GuestsIcon, HostsIcon, TripsIcon, VehiclesIcon } from '@/public/icons';
import type { NavItem, Role } from '@/types';
import { LucideHome, UserCog } from 'lucide-react';
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
const navItems: NavItem[] = [
    {
        title: 'Home',
        href: PAGE_ROUTES.DASHBOARD,
        icon: <LucideHome />,
        roles: [ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Trips',
        href: PAGE_ROUTES.TRIPS,
        icon: <TripsIcon />,
        roles: [ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Vehicles',
        href: PAGE_ROUTES.VEHICLES,
        icon: <VehiclesIcon />,
        roles: [ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Find My Car',
        href: PAGE_ROUTES.FIND_MY_CAR,
        icon: <FindMyCarIcon />,
        roles: [ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Hosts',
        href: PAGE_ROUTES.HOSTS,
        icon: <HostsIcon />,
        roles: [ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Guests',
        href: PAGE_ROUTES.GUESTS,
        icon: <GuestsIcon />,
        roles: [ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Employees',
        href: PAGE_ROUTES.EMPLOYEES,
        icon: <EmployeesIcon />,
        roles: [ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Configurations',
        href: PAGE_ROUTES.CONFIGURATIONS,
        icon: <UserCog />,
        roles: [ROLES.EMPLOYEE, ROLES.HOST]
    }
];

/**
 * Get Nav Items
 * This function filters the nav items based on the user's role.
 * @param role - The user's role.
 * @returns The filtered nav items.
 */
export const getNavItems = (role: Role) => {
    return navItems.filter((item) => {
        if (item.items) {
            // filter sub items
            item.items = item.items.filter((subItem) => {
                return subItem.roles?.includes(role);
            });
            // return true if there are sub items left
            return item.items.length > 0;
        }
        // filter top level items
        return item.roles?.includes(role);
    });
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
