import { useState } from 'react';
import { Document } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url';

import { pdfjs } from 'react-pdf';
import type { DocumentCallback } from 'react-pdf/dist/shared/types.js';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

import type { PDFDocumentMetadata } from '../types';
import PDFPage from './PDFPage';
import SelectionButton from './SelectionButton';
import MathMexResult from './MathMexResult';
import { API } from '../App';

interface PDFViewerProps {
    pdfDocumentMetadata?: PDFDocumentMetadata;
}

function PDFViewer({ pdfDocumentMetadata }: PDFViewerProps) {
  const [queriesAndResults, setQueriesAndResults] = useState<{ query: string; result: string; spanId: Node | null }[]>([]);

  const [numPages, setNumPages] = useState<number | null>(null);
  async function onDocumentLoadSuccess(pdf: DocumentCallback) {
    setNumPages(pdf.numPages);
  }
  const pageNumbers = Array.from({ length: numPages || 0 }, (_, i) => i + 1);

  const handleSelectionAction = (selectedText: string, selectedSpan: Node | null) => {
    // Check if the selected text is empty
    if (!selectedText.trim()) {
      console.warn('No text selected for MathMex search.');
      return;
    }
    const result = "This is a mock result for: " + selectedText; // Mock result for demonstration
    setQueriesAndResults(prevResults => [
      ...prevResults,
      { query: selectedText, result, spanId: selectedSpan }
    ]);
  };

  // --- Inline Styles Definition ---
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    width: '100vw', // Ensure the container takes full viewport width
  };

  const contentStyle: React.CSSProperties = {
    flexShrink: 0, // Prevent the content area from shrinking
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    // Set a max-width for the content area to control PDF size
    maxWidth: 'calc(100vw - 300px)', // Example: 300px for sidebar, adjust as needed
    width: 'fit-content', // Allow content to take only as much width as needed by its children (the PDF)
  };

  const sidebarStyle: React.CSSProperties = {
    flexGrow: 1, // Allow the sidebar to grow and take remaining space
    backgroundColor: '#f0f0f0',
    padding: '20px',
    boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.1)',
    overflowY: 'auto',
    minWidth: '250px', // Optional: set a minimum width for the sidebar
  };

  const pdfPageWrapperStyle: React.CSSProperties = {
    maxWidth: '800px', // This will cap the individual PDF page width
    width: '100%', // Ensures it doesn't exceed its parent's width (contentStyle's max-width)
    marginBottom: '10px',
    boxShadow: '0 0 8px rgba(0,0,0,0.2)',
  };

  // --- End Inline Styles Definition ---

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <Document
          file={`${API}/get_pdf/${pdfDocumentMetadata?.url}`}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          {pageNumbers.map((pageNumber) => (
            <div key={pageNumber} style={pdfPageWrapperStyle}>
              <PDFPage
                pageNumber={pageNumber}
                regions={pdfDocumentMetadata?.regions.filter(region => region.pageNumber === pageNumber) || []}
                pdfUrl={pdfDocumentMetadata?.url || ''}
              />
            </div>
          ))}
        </Document>
        <SelectionButton onAction={handleSelectionAction} />
      </div>
      <div style={sidebarStyle}>
        {queriesAndResults.length > 0 && 
          queriesAndResults.map((qr) => (<MathMexResult
              key={qr.query}
              query={qr.query}
              result={qr.result}
            />
          ))}
      </div>
    </div>
  );
}

export default PDFViewer;