// import React, { useState } from 'react';
// import { Message } from '../types';
// import './ChatPanel.css';

// interface ChatPanelProps {
//   messages: Message[];
//   setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
// }

// export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, setMessages }) => {
//   const [inputText, setInputText] = useState('');

//   const handleSend = async () => {
//     if (!inputText.trim()) return;

//     // Add user message
//     const userMessage: Message = {
//       id: Date.now(),
//       text: inputText,
//       role: 'user'
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInputText('');

//     // Mock bot response
//     const botMessage: Message = {
//       id: Date.now() + 1,
//       text: "This is a mock response from the chatbot.",
//       role: 'assistant'
//     };

//     setTimeout(() => {
//       setMessages(prev => [...prev, botMessage]);
//     }, 1000);
//   };

//   return (
//     <div className="chat-panel">
//       <div className="messages-container">
//         {messages.map(message => (
//           <div
//             key={message.id}
//             className={`message ${message.role}`}
//           >
//             {message.text}
//           </div>
//         ))}
//       </div>
//       <div className="input-container">
//         <input
//           type="text"
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
//           placeholder="Type a message..."
//         />
//         <button onClick={handleSend}>Send</button>
//       </div>
//     </div>
//   );
// };

// ChatPanel.tsx
import { 
  MainContainer, 
  ChatContainer, 
  MessageList, 
  Message, 
  MessageInput 
} from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MessageContent } from './MessageContent';

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, setMessages }) => {
  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: text,
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);

    // Mock bot response with markdown
    const botMessage: Message = {
      id: Date.now() + 1,
      text: "Here's a code example:\n```python\nprint('Hello World!')\n```\nAnd here's some **bold** text.",
      role: 'assistant'
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div style={{ height: "600px" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messages.map(msg => (
              <Message
                key={msg.id}
                model={{
                  message: msg.role === 'assistant' ? 
                    <MessageContent content={msg.text} /> : 
                    msg.text,
                  direction: msg.role === 'user' ? 'outgoing' : 'incoming',
                  position: "single"
                }}
              />
            ))}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            onSend={handleSend}
            attachButton={false}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};