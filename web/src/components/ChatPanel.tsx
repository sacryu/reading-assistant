import React, { useEffect, useState } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import { Message } from '../types';
import './ChatPanel.css';


const ChatMessage: React.FC<{ message: Message }> = React.memo(({ message }) => (
  <div className={`message ${message.role}`}>
    {message.role === 'assistant' && (
      <img src="/cat.svg" alt="Assistant" className="message-avatar" />
    )}
    <div className="message-content">{message.text}</div>
  </div>
));


export const ChatPanel: React.FC = () => {
  const { messages, setMessages, sessionId, setSessionId } = useChatContext();
  const [inputText, setInputText] = useState('');
  const CHAT_ASSISTANT_ID = "957af222b5ca11efb7770242ac1e0006";

  useEffect(() => {
    if (!sessionId) {
      createSession();
    }
  }, []);

  const createSession = async () => {
    try {
      const response = await fetch('http://localhost:8000/create_session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_assistant_id: CHAT_ASSISTANT_ID
        }),
      });
      const data = await response.json();
      setSessionId(data.session_id);
      
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !sessionId) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      role: 'user'
    };

    const botMessage: Message = {
      id: Date.now() + 1,
      text: '',
      role: 'assistant'
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    setInputText('');

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_assistant_id: CHAT_ASSISTANT_ID,
          session_id: sessionId,
          query: userMessage.text,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(msg =>
          msg.id === botMessage.id
            ? { ...msg, text: msg.text + chunk }
            : msg
        ));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Update the bot message to show the error
      setMessages(prev => prev.map(msg =>
        msg.id === botMessage.id
          ? { ...msg, text: 'Error: Failed to get response from server' }
          : msg
      ));
    }
  };

  return (
    <div className="chat-panel">
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