import { CHANNELS } from '@/constants';
import { env } from '@/env';
import { api } from '@/lib/apiService';
import { JSONparsefy } from '@/lib/utils';
import type { CreateUserProps } from '@/types';
import axios from 'axios';
import { getSession } from 'next-auth/react';

const USER_MANAGEMENT_BASEURL = env.NEXT_PUBLIC_USER_MANAGEMENT_BASEURL;
const USER_TOKEN_BASEURL = env.NEXT_PUBLIC_USER_TOKEN_BASEURL;

export async function getBundeeToken(firebaseToken: string) {
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/login`;
    const payload = {
        authToken: firebaseToken
    };

    const response = await axios.post(url, payload);
    return JSONparsefy(response.data);
}
export async function getUserByEmail(email?: string) {
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/getUserByEmail`;
    if (email) {
        const payload = {
            email: email,
            channelName: CHANNELS.BUNDEE
        };
        return await api.post<any>(url, payload);
    }

    const session = await getSession();
    if (session) {
        const payload = {
            email: session.email,
            channelName: CHANNELS.BUNDEE
        };
        return await api.post<any>(url, payload);
    }

    return null;
}

export async function createHostUser({ firstName, lastName, email, mobilePhone, channelName, userRole }: CreateUserProps) {
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/createUser`;
    const payload = {
        firstname: firstName,
        lastname: lastName,
        email: email,
        mobilephone: mobilePhone,
        userRole: userRole,
        channelName: channelName || CHANNELS.BUNDEE,
        vehicleowner: true
    };
    return await api.post<any>(url, payload);
}

export async function createEmployeeUser({ firstName, lastName, email, mobilePhone, channelName, hostId, userRole }: CreateUserProps) {
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/createUser`;
    const payload = {
        firstname: firstName,
        lastname: lastName,
        email: email,
        mobilephone: mobilePhone,
        userRole: userRole,
        channelName: channelName || CHANNELS.BUNDEE,
        vehicleowner: false,
        employee: true,
        hostId: hostId
    };
    return await api.post<any>(url, payload);
}

export async function updateUser(payload: any) {
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/updateUserWithImage`;
    return await api.post<any>(url, payload);
}

export async function deleteEmployee(iduser: string, email: string) {
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/deleteEmployees`;
    const payload = { email: email, iduser: iduser };
    return await api.post<any>(url, payload);
}

export async function diableUser(iduser: string, isactive: boolean) {
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/disableUser`;
    const payload = { fromValue: iduser, isactive: isactive };
    return await api.post<any>(url, payload);
}

export async function addNewUserToFirebase({
    email,
    firstName,
    lastName
}: {
    email: string;
    firstName: string;
    lastName: string;
}) {
    const url = `${USER_TOKEN_BASEURL}/createUser`;
    const payload = {
        email,
        emailVerified: true,
        password: '123456',
        displayName: `${firstName} ${lastName}`,
        disabled: false
    };
    return await api.post<any>(url, payload);
}
