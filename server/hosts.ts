import { env } from '@/env';
import { api } from '@/lib/apiService';
import { getSession } from 'next-auth/react';

const USER_MANAGEMENT_BASEURL = env.NEXT_PUBLIC_USER_MANAGEMENT_BASEURL;

export async function getAllHosts() {
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/getAllHost`;
    const payload = {};

    return await api.post<any>(url, payload);
}

export async function getAllHostEmployees() {
    const session = await getSession();
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/getOwnerEmployeeMappingById`;
    const payload = { fromvalue: 'hostidEmployees', id: session?.iduser };

    return api.post<any>(url, payload);
}
