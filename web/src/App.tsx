import { CSSTransition, TransitionGroup } from 'react-transition-group';
import React, { useState, useEffect } from 'react';
import Split from 'react-split';
import './App.css';
import { ChatPanel } from './components/ChatPanel';
import DocumentViewer from './components/DocumentViewer';
import { Message } from './types';

const App: React.FC = () => {
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  // 从 localStorage 恢复状态
  useEffect(() => {
    const savedUrl = localStorage.getItem('documentUrl');
    const savedShowViewer = localStorage.getItem('showViewer');

    if (savedUrl && savedShowViewer === 'true') {
      setDocumentUrl(savedUrl);
      setShowViewer(true);
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        text: `I've loaded your document. How can I help you understand it?`
      }]);
    }
  }, []);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentUrl) return;

    const isValidUrl = documentUrl.startsWith('http://') || documentUrl.startsWith('https://');
    if (!isValidUrl) {
      setError('Please enter a valid URL');
      return;
    }

    // 保存状态到 localStorage
    localStorage.setItem('documentUrl', documentUrl);
    localStorage.setItem('showViewer', 'true');

    setError(null);
    setShowViewer(true);
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      text: `I've loaded your document. How can I help you understand it?`
    }]);
  };

  const handleBackToHome = () => {
    // 清除状态和 localStorage
    localStorage.removeItem('documentUrl');
    localStorage.removeItem('showViewer');
    setDocumentUrl('');
    setShowViewer(false);
    setMessages([]);
    setError(null);
  };

  return (
    <TransitionGroup>
      <CSSTransition
        key={showViewer ? 'viewer' : 'start'}
        timeout={300}
        classNames="page"
        unmountOnExit
      >
        {!showViewer ? (
          <div className="start-page">
            <div className="start-container">
              <h1>Document Reader</h1>
              <p>Enter a URL to your document</p>

              <form onSubmit={handleUrlSubmit} className="url-form">
                <input
                  type="text"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="Enter document URL (PDF or Word)"
                  className="url-input"
                />
                <button type="submit">Load Document</button>
              </form>

              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
        ) : (
          <div className="app">
            <div className="app">
              <Split
                className="split"
                sizes={[50, 50]}
                minSize={300}
                gutterSize={10}
                snapOffset={30}
              >
                <DocumentViewer documentUrl={documentUrl} error={error} />
                <div className="chat-container">
                  <button onClick={handleBackToHome} className="back-button">
                    ×
                  </button>
                  <ChatPanel messages={messages} setMessages={setMessages} />
                </div>
              </Split>
            </div>
          </div>
        )}
      </CSSTransition>
    </TransitionGroup>
  );
};

export default App;
