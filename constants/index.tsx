import { ConfigurationsIcon, EmployeesIcon, FindMyCarIcon, GuestsIcon, HomeIcon, HostsIcon, TripsIcon, VehiclesIcon } from '@/public/icons';
import type { NavItem, Role } from '@/types';
import { PAGE_ROUTES } from './routes';

export const ROLES = {
    DRIVER: 'Driver',
    HOST: 'Host',
    ADMIN: 'Admin',
    EMPLOYEE: 'Employee'
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
        title: 'Dashboard',
        href: PAGE_ROUTES.DASHBOARD,
        icon: <HomeIcon />,
        roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Trips',
        href: PAGE_ROUTES.TRIPS,
        icon: <TripsIcon />,
        roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Vehicles',
        href: PAGE_ROUTES.VEHICLES,
        icon: <VehiclesIcon />,
        roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Find My Car',
        href: PAGE_ROUTES.FIND_MY_CAR,
        icon: <FindMyCarIcon />,
        roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Guests',
        href: PAGE_ROUTES.GUESTS,
        icon: <GuestsIcon />,
        roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Employees',
        href: PAGE_ROUTES.EMPLOYEES,
        icon: <EmployeesIcon />,
        roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Hosts',
        href: PAGE_ROUTES.HOSTS,
        icon: <HostsIcon />,
        roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.HOST]
    },
    {
        title: 'Configurations',
        href: PAGE_ROUTES.CONFIGURATIONS,
        icon: <ConfigurationsIcon />,
        roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.HOST]
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
