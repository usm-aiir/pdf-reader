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
  };

  const contentStyle: React.CSSProperties = {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex', // Use flex to center the document
    flexDirection: 'column', // Stack pages vertically
    alignItems: 'center', // Center pages horizontally
  };

  const sidebarStyle: React.CSSProperties = {
    width: '300px',
    backgroundColor: '#f0f0f0',
    padding: '20px',
    boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.1)',
    overflowY: 'auto',
  };

  // Add a style for the individual PDF page container to control its width
  // Note: react-pdf's <Page> component might render a canvas directly,
  // so we might need to target the parent div that <PDFPage> renders.
  // Assuming PDFPage renders a div that wraps the react-pdf <Page>
  const pdfPageWrapperStyle: React.CSSProperties = {
    maxWidth: '800px', // Set a maximum width for the PDF pages (e.g., A4 width)
    width: '100%', // Allow it to shrink if content area is smaller
    marginBottom: '10px', // Space between pages
    boxShadow: '0 0 8px rgba(0,0,0,0.2)', // Optional: Add a subtle shadow to pages
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
            // Wrap PDFPage in a div with controlled width
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
              definitionText={qr.query}
              mathMexContent={qr.result}
              targetSpanId={qr.spanId}
            />
          ))}
      </div>
    </div>
  );
}

export default PDFViewer;