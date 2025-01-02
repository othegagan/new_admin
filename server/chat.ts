import { env } from '@/env';
import axios from 'axios';

const CHAT_SERVICE_BASEURL = env.NEXT_PUBLIC_CHAT_SERVICE_BASEURL;

export async function getTripChatHistory(tripid: number) {
    try {
        const url = `${CHAT_SERVICE_BASEURL}/getAllChatHistory`;

        const payload = {
            tripId: tripid,
            count: 1000,
            password: env.NEXT_PUBLIC_CHAT_SERVICE_PASSWORD
        };

        const response = await axios.post(url, payload, {
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json'
            }
        });

        if (response.status !== 200) {
            throw new Error(`API Error status: ${response.status}`);
        }

        const data = response.data;

        const messageData = data.messages
            .map((item: any) => ({
                author: item.author,
                message: item.body,
                deliveryDate: item.dateUpdated,
                mediaUrl: item.attributes?.mediaUrl || null
            }))
            .reverse();

        return messageData;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function sendMessageInChat(tripId: number, messageBody: string) {
    try {
        const url = `${CHAT_SERVICE_BASEURL}/hostSendMessage`;

        const payload = {
            tripId: tripId,
            message: messageBody,
            password: env.NEXT_PUBLIC_CHAT_SERVICE_PASSWORD
        };

        const response = await axios.post(url, payload, {
            headers: {
                Accept: '*/*',
                'Content-Type': 'application/json'
            }
        });

        if (response.status !== 200) {
            throw new Error(`API Error! status: ${response.status}`);
        }

        // const data = response.data;

        const res_client = {
            success: true
        };

        return res_client;
    } catch (error: any) {
        throw new Error(error.message);
    }
}
