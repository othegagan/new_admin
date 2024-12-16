export const ROLES = {
    DRIVER: 'Driver',
    HOST: 'Host',
    ADMIN: 'Admin',
    EMPLOYEE: 'Employee'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const CHANNELS = {
    BUNDEE: 'Bundee',
    FLUX: 'Flux',
    TURO: 'Turo'
} as const;

export type Channel = (typeof CHANNELS)[keyof typeof CHANNELS];
