import mammoth from 'mammoth';
import React, { useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Props {
  file: File | null;
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const DocumentViewer: React.FC<Props> = ({ file, onFileSelect, isLoading, error }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pagesArray, setPagesArray] = useState<number[]>([]);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.type.includes('word')) {
        onFileSelect(file);
        if (file.type.includes('word')) {
          convertDocxToHtml(file);
        }
      } else {
        alert('Please upload PDF or Word documents only');
      }
    }
  };

  const convertDocxToHtml = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    setHtmlContent(result.value);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPagesArray(Array.from(new Array(numPages), (_, index) => index + 1));
  };

  return (
    <div className="document-viewer-container">
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.docx,.doc"
        className="file-input"
      />
      {isLoading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      {file && (
        <div className="document-content" ref={containerRef}>
          {file.type === 'application/pdf' ? (
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
              {pagesArray.map(pageNum => (
                <Page
                  key={`page_${pageNum}`}
                  pageNumber={pageNum}
                  width={containerRef.current?.clientWidth ? containerRef.current.clientWidth - 40 : undefined}
                />
              ))}
            </Document>
          ) : (
            <div className="docx-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;