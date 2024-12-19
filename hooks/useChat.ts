import { QUERY_KEYS } from '@/constants/query-keys';
import { getTripChatHistory, sendMessageToCustomer } from '@/server/trips';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

const useChat = (bookingId: number, token: string) => {
    const [inputMessage, setInputMessage] = useState('');
    const queryClient = useQueryClient();

    const sendMessageMutation = useMutation({
        mutationFn: async () => {
            if (bookingId && token && inputMessage) {
                return await sendMessageToCustomer(bookingId, inputMessage, token);
            }
            throw new Error('Missing bookingId, token, or inputMessage');
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.chatHistory, bookingId]
            });
            setInputMessage('');
        },
        onError: (error) => {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
        }
    });

    const {
        data: messageList = [],
        isLoading: loadingMessages,
        error: messageError,
        isError: isMessageError
    } = useQuery({
        queryKey: [QUERY_KEYS.chatHistory, bookingId],
        queryFn: async () => await getTripChatHistory(bookingId, token),
        enabled: !!bookingId && !!token,
        refetchInterval: 8000
    });

    return {
        inputMessage,
        setInputMessage,
        sendMessageMutation,
        messageList,
        loadingMessages,
        messageError,
        isMessageError
    };
};

export default useChat;
