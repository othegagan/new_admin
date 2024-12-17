// types/next-auth.d.ts

import type { Role } from '@/constants';
import 'next-auth';

declare module 'next-auth' {
    interface Session {
        email: string;
        iduser: number;
        name: string;
        employee: boolean;
        vehicleowner: boolean;
        mobilephone?: string;
        userimage: string | null;
        userRole: Role | null;
        channelName: string;
        bundeeToken: string;
        expires: string;
        firstname?: string;
        lastname?: string;
    }

    interface User {
        email: string;
        iduser: number;
        name: string;
        employee: boolean;
        vehicleowner: boolean;
        mobilephone?: string;
        userimage: string | null;
        userRole: Role | null;
        channelName: string;
        bundeeToken: string;
        firstname?: string;
        lastname?: string;
    }

    interface JWT extends User {}
}
