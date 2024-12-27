import { QUERY_KEYS } from '@/constants/query-keys';
import { getTripChatHistory } from '@/server/trips';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const useChat = (bookingId: number, token: string) => {
    const [inputMessage, setInputMessage] = useState('');

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
        messageList,
        loadingMessages,
        messageError,
        isMessageError
    };
};

export default useChat;
