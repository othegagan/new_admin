import { QUERY_KEYS } from '@/constants/query-keys';
import { getTripChatHistory } from '@/server/chat';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const useChat = (tripId: number) => {
    const [inputMessage, setInputMessage] = useState('');

    const {
        data: messageList = [],
        isLoading: loadingMessages,
        error: messageError,
        isError: isMessageError
    } = useQuery({
        queryKey: [QUERY_KEYS.chatHistory, tripId],
        queryFn: async () => await getTripChatHistory(tripId),
        enabled: !!tripId,
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
