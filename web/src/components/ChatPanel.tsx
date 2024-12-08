import React, { useState } from 'react';
import { Message } from '../types';
import './ChatPanel.css';

interface ChatPanelProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, setMessages }) => {
  const [inputText, setInputText] = useState('');

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    const botMessage: Message = {
      id: Date.now() + 1,
      text: "This is a mock response from the chatbot.",
      role: 'assistant'
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="chat-panel">
      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            {message.role === 'assistant' && (
              <img src="/cat.svg" alt="Assistant" className="message-avatar" />
            )}
            <div className="message-content">{message.text}</div>
          </div>
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