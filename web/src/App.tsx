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
        const response = await fetch('/api/documents');
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

    if (savedDocId && savedShowViewer === 'true' && documents.length > 0) {
      setSelectedDocument(savedDocId);
      // Find and restore the selected document info
      const docInfo = documents.find(doc => doc.url === savedDocId);
      if (docInfo) {
        setSelectedDocInfo(docInfo);
      }
      setShowViewer(true);
    }
  }, [documents]); // Add documents as dependency

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
    setSelectedDocument('');
    setShowViewer(false);
    setError(null);
  };

  return (
    <div className="h-screen relative overflow-hidden">
      <TransitionGroup>
        <CSSTransition
          key={showViewer ? 'viewer' : 'home'}
          timeout={300}
          classNames="page"
          unmountOnExit
        >
          <div className="absolute inset-0">
            {!showViewer ? (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg w-11/12">
                  <h1 className="text-2xl font-bold mb-4">Document Reader</h1>
                  <p className="mb-4">Select a document to read</p>
                  <form onSubmit={handleDocumentSelect} className="w-full max-w-lg">
                    <select
                      value={selectedDocument}
                      onChange={(e) => setSelectedDocument(e.target.value)}
                      className="w-full p-2 mb-4 border border-gray-300 rounded"
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
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700">
                      Load Document
                    </button>
                  </form>
                  {error && <div className="text-red-500 mt-4">{error}</div>}
                </div>
              </div>
            ) : (
              <ChatProvider>
                <div className="h-full w-screen overflow-hidden">
                  <Split
                    className="flex w-full h-full"
                    sizes={[50, 50]}
                    minSize={300}
                    gutterSize={10}
                    snapOffset={30}
                    gutter={(index, direction) => {
                      const gutterElement = document.createElement('div');
                      gutterElement.className = `gutter gutter-${direction}`;
                      return gutterElement;
                    }}
                  >
                    <DocumentViewer documentUrl={selectedDocument} error={error} />
                    <div className="relative h-full">
                      <button 
                        onClick={handleBackToHome} 
                        className={`absolute top-3 right-4 w-12 h-12 border-none rounded-lg 
                        bg-white text-black text-3xl font-bold cursor-pointer flex items-center justify-center z-[1000] 
                        transition-all duration-200 ease-in-out
                        hover:bg-black/20 hover:text-black/65 
                        group`}
                      >
                        ×
                        <span className="absolute bottom-[-30px] left-1/2 transform -translate-x-1/2 
                          bg-black text-white px-2 py-1 rounded text-sm
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                          transition-all duration-200 ease-in-out">
                          Close
                        </span>
                      </button>
                      {selectedDocInfo && (
                        <ChatPanel assistant_id={selectedDocInfo.assistant_id} />
                      )}
                    </div>
                  </Split>
                </div>
              </ChatProvider>
            )}
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
};

export default App;
