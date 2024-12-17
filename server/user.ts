import { CHANNELS } from '@/constants';
import { env } from '@/env';
import { api } from '@/lib/apiService';
import { JSONparsefy } from '@/lib/utils';

const USER_MANAGEMENT_BASEURL = env.NEXT_PUBLIC_USER_MANAGEMENT_BASEURL;

export async function getUserByEmail(email: string) {
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/getUserByEmail`;
    const payload = {
        email: email,
        channelName: CHANNELS.BUNDEE
    };
    return await api.post<any>(url, payload);
}

export async function getBundeeToken(firebaseToken: string) {
    const url = `${USER_MANAGEMENT_BASEURL}/v1/user/login`;
    const payload = {
        authToken: firebaseToken
    };

    const response = await api.post<any>(url, payload);
    // console.log(response)
    return JSONparsefy(response.data);
}
