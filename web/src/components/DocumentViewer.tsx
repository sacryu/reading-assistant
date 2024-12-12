import React, { useEffect, useRef } from 'react';

interface Props {
  documentUrl: string;
  error: string | null;
}

const DocumentViewer: React.FC<Props> = ({ documentUrl, error }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const isWordDocument = documentUrl.match(/\.(doc|docx)$/i);
  const isPdfDocument = documentUrl.match(/\.pdf$/i) || documentUrl.includes('arxiv.org');

  useEffect(() => {
    if (!isPdfDocument || !documentUrl) return;

    const viewer = viewerRef.current;
    if (viewer) {
      viewer.innerHTML = `
        <iframe
          src="https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(documentUrl)}"
          width="100%"
          height="100%"
          frameborder="0"
          title="pdf-viewer"
        ></iframe>
      `;
    }

    return () => {
      if (viewer) {
        viewer.innerHTML = '';
      }
    };
  }, [documentUrl, isPdfDocument]);

  return (
    <div className="h-full w-full overflow-hidden">
      {isWordDocument && (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`}
          width="100%"
          height="100%"
          frameBorder="0"
          title="word-viewer"
        />
      )}

      {isPdfDocument && (
        <div ref={viewerRef} className="h-full w-full"></div>
      )}

      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default DocumentViewer;
