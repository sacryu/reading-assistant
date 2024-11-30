import React, { useState } from 'react';
import Split from 'react-split';
import './App.css';
import ChatPanel from './components/ChatPanel';
import DocumentViewer from './components/DocumentViewer';
import { Message } from './types';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedFile(file);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      setMessages([{
        role: 'assistant',
        content: `I've loaded ${file.name}. How can I help you understand it?`
      }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Split
        className="split"
        sizes={[50, 50]}
        minSize={300}
        gutterSize={10}
        snapOffset={30}
      >
        <DocumentViewer
          file={selectedFile}
          onFileSelect={handleFileSelect}
          isLoading={isLoading}
          error={error}
        />
        <ChatPanel messages={messages} setMessages={setMessages} />
      </Split>
    </div>
  );
};

export default App;