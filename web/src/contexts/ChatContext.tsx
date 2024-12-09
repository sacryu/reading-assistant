import React, { createContext, useContext, useEffect, useState } from 'react';
import { Message } from '../types';

interface ChatContextType {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    sessionId: string | null;
    setSessionId: React.Dispatch<React.SetStateAction<string | null>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize sessionId from 本地浏览器
    const [sessionId, setSessionId] = useState<string | null>(() => {
        return localStorage.getItem('chatSessionId');
    });

    // Initialize messages from 本地浏览器
    const [messages, setMessages] = useState<Message[]>(() => {
        const saved = localStorage.getItem('chatMessages');
        return saved ? JSON.parse(saved) : [{
            id: Date.now(),
            text: "I've loaded your document. What can I help with?",
            role: 'assistant'
        }];
    });

    // save messages to 本地浏览器
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        }
    }, [messages]);

    // save sessionId to 本地浏览器
    useEffect(() => {
        if (sessionId) {
            localStorage.setItem('chatSessionId', sessionId);
        }
    }, [sessionId]);

    return (
        <ChatContext.Provider value={{ messages, setMessages, sessionId, setSessionId }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChatContext must be used within ChatProvider');
    return context;
};
