import React, { useEffect, useState } from 'react';
import Split from 'react-split';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './App.css';
import { ChatPanel } from './components/ChatPanel';
import DocumentViewer from './components/DocumentViewer';
import { ChatProvider } from './contexts/ChatContext';

const App: React.FC = () => {
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);

  // 从 localStorage 恢复状态
  useEffect(() => {
    const savedUrl = localStorage.getItem('documentUrl');
    const savedShowViewer = localStorage.getItem('showViewer');

    if (savedUrl && savedShowViewer === 'true') {
      setDocumentUrl(savedUrl);
      setShowViewer(true);
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
  };

  const handleBackToHome = () => {
    localStorage.removeItem('documentUrl');
    localStorage.removeItem('showViewer');
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('chatSessionId');
    setDocumentUrl('');
    setShowViewer(false);
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
          <ChatProvider>
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
                  <ChatPanel />
                </div>
              </Split>
            </div>
          </ChatProvider>
        )}
      </CSSTransition>
    </TransitionGroup>
  );
};

export default App;
