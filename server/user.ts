import { CHANNELS } from '@/constants';
import { env } from '@/env';
import { api } from '@/lib/apiService';

export async function getUserByEmail(email: string) {
    const url = `${env.NEXT_PUBLIC_USER_MANAGEMENT_BASEURL}/v1/user/getUserByEmail`;
    const payload = {
        email: email,
        channelName: CHANNELS.BUNDEE
    };
    return await api.post(url, payload);
}
