import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useChatContext } from '../contexts/ChatContext';
import { Message } from '../types';

const ChatMessage: React.FC<{ message: Message }> = React.memo(({ message }) => (
  <div
    className={`flex items-start mb-5 max-w-full ${message.role === 'assistant' ? 'self-start' : 'self-end flex-row-reverse'}`}
  >
    {message.role === 'assistant' && (
      <>
        <img 
          src="/cat.svg" 
          alt="Assistant" 
          className={`w-8 h-8 m-0 mx-2.5 ${
            message.isStreaming ? 'animate-bounce' : ''
          }`}
        />
        {message.isThinking && (
          <div className="flex gap-1 m-0 mx-2.5 pt-2.5">
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '-0.32s' }}></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '-0.16s' }}></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
          </div>
        )}
      </>
    )}
    <div
      className={`text-[16px] leading-[28px] break-words ${message.role === 'assistant'
        ? 'bg-transparent text-black p-0 max-w-full'
        : 'bg-gray-200 text-black p-3 rounded-lg max-w-[80%]'
        }`}
    >
      {message.role === 'assistant' ? (
        <div className="prose max-w-full text-[16px] leading-[28px]">
          <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);

  const scrollToBottom = () => {
    if (!userScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 100;
    
    setUserScrolled(!isAtBottom);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, userScrolled]);

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
    if (!sessionId) initializeSession()
  }, [sessionId, initializeSession]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputText]);

  const handleSend = async () => {
    if (!inputText.trim() || !sessionId) return;

    const messages = {
      user: { id: Date.now(), text: inputText, role: 'user' as const },
      bot: {
        id: Date.now() + 1,
        text: '',
        role: 'assistant' as const,
        isThinking: true,
        isStreaming: true
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

      let isFirstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setMessages(prev => prev.map(msg =>
            msg.id === messages.bot.id
              ? { ...msg, isStreaming: false }
              : msg
          ));
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        
        setMessages(prev => prev.map(msg =>
          msg.id === messages.bot.id
            ? {
                ...msg,
                text: msg.text + chunk,
                isThinking: false,
              }
            : msg
        ));

        if (isFirstChunk) {
          isFirstChunk = false;
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.map(msg =>
        msg.id === messages.bot.id
          ? { ...msg, text: 'Error: Failed to get response from server', isThinking: false, isStreaming: false }
          : msg
      ));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const canClearChat = messages.length > 1;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-5">
        <button
          onClick={canClearChat ? initializeSession : undefined}
          className={`absolute top-3 left-2 w-12 h-12 border-none rounded-lg 
          bg-white text-black text-3xl font-bold cursor-pointer flex items-center justify-center z-[1000] 
          transition-all duration-200 ease-in-out
          hover:bg-black/20 hover:text-black/65 
          disabled:opacity-50 disabled:cursor-not-allowed
          group`}
          disabled={!canClearChat}
        >
          +
          <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 
            bg-black text-white px-2 py-1 rounded text-sm
            opacity-0 invisible group-hover:opacity-100 group-hover:visible 
            transition-all duration-200 ease-in-out">
            NewChat
          </span>
        </button>
      </div>
      <div 
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-12"
      >
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} /> {/* Add this div as a scroll marker */}
      </div>
      <div className="relative flex items-center p-10 bg-white">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          rows={1}
          className="w-full p-5 bg-gray-100 resize-none rounded-2xl min-h-[40px] max-h-[200px] text-base leading-[1.5] focus:outline-none"
        />
        <button 
          onClick={handleSend}
          className={`absolute right-[45px] bottom-[52px] w-[40px] h-[40px] border-none rounded-full 
          bg-black cursor-pointer flex items-center justify-center
          transition-all duration-200 ease-in-out
          hover:bg-black/75
          group`}
        >
          <img 
            src="/send-icon.svg" 
            alt="Send" 
            className="w-8 h-8 brightness-0 invert" 
          />
          <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 
            bg-black text-white px-2 py-1 rounded text-sm
            opacity-0 invisible group-hover:opacity-100 group-hover:visible 
            transition-all duration-200 ease-in-out">
            Send
          </span>
        </button>
      </div>
    </div>
  );
};