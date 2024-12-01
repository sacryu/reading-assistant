// import mammoth from 'mammoth';
// import React, { useRef, useState } from 'react';
// import { Document, Page, pdfjs } from 'react-pdf';
// // import 'react-pdf/dist/esm/Page/TextLayer.css';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// interface Props {
//   file: File | null;
//   onFileSelect: (file: File) => void;
//   isLoading: boolean;
//   error: string | null;
// }

// const DocumentViewer: React.FC<Props> = ({ file, onFileSelect, isLoading, error }) => {
//   const [numPages, setNumPages] = useState<number>(0);
//   const [pagesArray, setPagesArray] = useState<number[]>([]);
//   const [htmlContent, setHtmlContent] = useState<string>('');
//   const [isDocumentProcessing, setIsDocumentProcessing] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       if (file.type === 'application/pdf' || file.type.includes('word')) {
//         onFileSelect(file);
//         if (file.type.includes('word')) {
//           convertDocxToHtml(file);
//         }
//       } else {
//         alert('Please upload PDF or Word documents only');
//       }
//     }
//   };

//   const convertDocxToHtml = async (file: File) => {
//     try {
//       setIsDocumentProcessing(true);
//       const arrayBuffer = await file.arrayBuffer();
//       const result = await mammoth.convertToHtml({ arrayBuffer });
//       setHtmlContent(result.value);
//     } catch (error) {
//       console.error('Error converting DOCX:', error);
//     } finally {
//       setIsDocumentProcessing(false);
//     }
//   };

//   const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
//     setIsDocumentProcessing(false);
//     setNumPages(numPages);
//     setPagesArray(Array.from(new Array(numPages), (_, index) => index + 1));
//   };

//   const onDocumentLoadError = (error: Error) => {
//     console.error('Error loading PDF:', error);
//     setIsDocumentProcessing(false);
//   };

//   return (
//     <div className="document-viewer-container">
//       <input
//         type="file"
//         onChange={handleFileChange}
//         accept=".pdf,.docx,.doc"
//         className="file-input"
//       />
//       {isLoading && <div>Uploading file...</div>}
//       {isDocumentProcessing && <div>Loading document...</div>}
//       {error && <div className="error">{error}</div>}
//       {file && (
//         <div className="document-content" ref={containerRef}>
//           {file.type === 'application/pdf' ? (
//             <Document
//               file={file}
//               onLoadSuccess={onDocumentLoadSuccess}
//               onLoadError={onDocumentLoadError}
//               loading={<div>Loading PDF...</div>}
//             >
//               {pagesArray.map(pageNumber => (
//                 <Page
//                   key={pageNumber}
//                   pageNumber={pageNumber}
//                   renderTextLayer={false}
//                 />
//               ))}
//             </Document>
//           ) : (
//             <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentViewer;

import React, { useRef, useState } from 'react';

interface Props {
  file: File | null;
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  error: string | null;
  documentHtml: string;
}

const DocumentViewer: React.FC<Props> = ({ file, onFileSelect, isLoading, error }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.type.includes('word')) {
        onFileSelect(file);
      } else {
        alert('Please upload PDF or Word documents only');
      }
    }
  };

  return (
    <div className="document-viewer-container">
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.docx,.doc"
        className="file-input"
      />
      {isLoading && <div>Processing document...</div>}
      {error && <div className="error">{error}</div>}
      {file && (
        <div className="document-content" ref={containerRef}>
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;