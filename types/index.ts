import type { CHANNELS, ROLES } from '@/constants';

export type Channel = (typeof CHANNELS)[keyof typeof CHANNELS];

export type Role = (typeof ROLES)[keyof typeof ROLES];

export interface NavItem {
    id?: number;
    title: string;
    href?: string;
    icon?: React.ReactNode;
    description?: string;
    items?: NavItem[];
    roles?: Role[];
}
