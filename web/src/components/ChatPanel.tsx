import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChatContext } from '../contexts/ChatContext';
import { Message } from '../types';
import './ChatPanel.css';

const ChatMessage: React.FC<{ message: Message }> = React.memo(({ message }) => (
  <div className={`message ${message.role}`}>
    {message.role === 'assistant' && (
      <>
        <img src="/cat.svg" alt="Assistant" className="message-avatar" />
        {message.isLoading && (
          <div className="loading-indicator">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
      </>
    )}
    <div className="message-content">
      {message.role === 'assistant' ? (
        <ReactMarkdown>{message.text}</ReactMarkdown>
      ) : (
        message.text
      )}
    </div>
  </div>
));

interface ChatPanelProps {
  assistant_id: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ assistant_id }) => {
  const { messages, setMessages, sessionId, setSessionId } = useChatContext();
  const [inputText, setInputText] = useState('');

  const api = {
    createSession: () =>
      fetch('http://localhost:8000/create_session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_assistant_id: assistant_id })
      }),

    sendMessage: (sessionId: string, query: string) =>
      fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_assistant_id: assistant_id,
          session_id: sessionId,
          query
        })
      })
  };

  const initializeSession = async () => {
    try {
      const response = await api.createSession();
      const data = await response.json();
      setSessionId(data.session_id);
      setMessages([{
        id: Date.now(),
        text: "I've loaded your document. What can I help with?",
        role: 'assistant'
      }]);
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  };

  useEffect(() => {
    if (!sessionId) initializeSession();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !sessionId) return;

    const messages = {
      user: { id: Date.now(), text: inputText, role: 'user' as const },
      bot: {
        id: Date.now() + 1,
        text: '',
        role: 'assistant' as const,
        isLoading: true
      }
    };

    setMessages(prev => [...prev, messages.user, messages.bot]);
    setInputText('');

    try {
      const response = await api.sendMessage(sessionId, messages.user.text);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error('Response body is null');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(msg =>
          msg.id === messages.bot.id
            ? { ...msg, text: msg.text + chunk, isLoading: !chunk }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === messages.bot.id
          ? { ...msg, text: 'Error: Failed to get response from server', isLoading: false }
          : msg
      ));
    }
  };

  const canClearChat = messages.length > 1;

  return (
    <div className="chat-panel">
      <div className="button-group">
        <button
          onClick={canClearChat ? initializeSession : undefined}
          className={`clear-button ${!canClearChat ? 'disabled' : ''}`}
          disabled={!canClearChat}
        >
          +
        </button>
      </div>
      <div className="messages-container">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      <div className="input-container">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          rows={1}
        />
        <button className="send-button" onClick={handleSend}>
          <img src="/send-icon.svg" alt="Send" />
        </button>
      </div>
    </div>
  );
};