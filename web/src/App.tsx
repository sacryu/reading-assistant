import React, { useEffect, useState } from 'react';
import Split from 'react-split';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './App.css';
import { ChatPanel } from './components/ChatPanel';
import DocumentViewer from './components/DocumentViewer';
import { ChatProvider } from './contexts/ChatContext';
import { DocumentInfo } from './types';

const App: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedDocInfo, setSelectedDocInfo] = useState<DocumentInfo | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/documents');
        const data = await response.json();
        setDocuments(data);
      } catch (err) {
        setError('Failed to load documents');
      }
    };

    fetchDocuments();
  }, []);

  // Restore state from localStorage
  useEffect(() => {
    const savedDocId = localStorage.getItem('selectedDocument');
    const savedShowViewer = localStorage.getItem('showViewer');

    if (savedDocId && savedShowViewer === 'true') {
      setSelectedDocument(savedDocId);
      setShowViewer(true);
    }
  }, []);

  const handleDocumentSelect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocument) {
      setError('Please select a document');
      return;
    }

    // Find and store the selected document info
    const docInfo = documents.find(doc => doc.url === selectedDocument);
    if (docInfo) {
      setSelectedDocInfo(docInfo);
      // Save state to localStorage
      localStorage.setItem('selectedDocument', selectedDocument);
      localStorage.setItem('showViewer', 'true');
      setError(null);
      setShowViewer(true);
    }
  };

  const handleBackToHome = () => {
    localStorage.removeItem('selectedDocument');
    localStorage.removeItem('showViewer');
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('chatSessionId');
    setSelectedDocument('');
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
              <p>Select a document to read</p>
              <form onSubmit={handleDocumentSelect} className="document-form">
                <select
                  value={selectedDocument}
                  onChange={(e) => setSelectedDocument(e.target.value)}
                  className="document-select"
                >
                  <option value="">Select a document...</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.url}>
                      {doc.name}
                      {doc.source && ` (${doc.source})`}
                      {/* {doc.description && ` - ${doc.description}`} */}
                    </option>
                  ))}
                </select>
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
                <DocumentViewer documentUrl={selectedDocument} error={error} />
                <div className="chat-container">
                  <button onClick={handleBackToHome} className="back-button">
                    ×
                  </button>
                  {selectedDocInfo && (
                    <ChatPanel assistant_id={selectedDocInfo.assistant_id} />
                  )}
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
