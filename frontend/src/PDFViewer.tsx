import { useEffect, useState } from 'react';
import { Document } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url';

import { pdfjs } from 'react-pdf';
import type { DocumentCallback } from 'react-pdf/dist/shared/types.js';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

import type { FormulaRegion } from './types';
import PDFPage from './PDFPage';
import SelectionButton from './SelectionButton';

interface PDFViewerProps { }

export const API = import.meta.env.MODE === 'development' ? 'http://localhost:9090' : 'https://pdf-api.mathmex.com';

function PDFViewer({ }: PDFViewerProps) {
  const path = window.location.pathname;
  const delimiterIndex = path.indexOf('/pdf/');
  const pdfUrl = delimiterIndex !== -1 ? path.substring(delimiterIndex + 5) : '';

  if (!pdfUrl || pdfUrl.trim() === '') {
    return <div>Please provide a PDF URL in the query string, e.g., /pdf/https://example.com/sample.pdf</div>;
  }

  const [numPages, setNumPages] = useState<number | null>(null);
  async function onDocumentLoadSuccess(pdf: DocumentCallback) {
    setNumPages(pdf.numPages);
  }
  const pageNumbers = Array.from({ length: numPages || 0 }, (_, i) => i + 1);

  const [regions, setRegions] = useState<FormulaRegion[]>([]);
  useEffect(() => {
    fetch(`${API}/predict_math_regions/${pdfUrl}`)
      .then(response => response.json())
      .then(data => {
        const newRegions: FormulaRegion[] = data.regions.map((region: any) => ({
          id: region.id,
          pageNumber: region.pagenum,
          boundingRect: {
            x1: region.bbox[0],
            y1: region.bbox[1],
            x2: region.bbox[2],
            y2: region.bbox[3],
          }
        }))
        setRegions(newRegions);
      })
      .catch(error => {
        console.error('Error fetching formula regions:', error);
      });
  }, [pdfUrl]);

  const handleSelectionAction = (selectedText: string) => {
    const queryUrl = `https://www.mathmex.com/?q=${encodeURIComponent(selectedText)}`;
    window.open(queryUrl, '_blank');
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

  const sidebarHeadingStyle: React.CSSProperties = {
    marginTop: 0,
    color: '#333',
  };

  const sidebarListStyle: React.CSSProperties = {
    listStyleType: 'none',
    padding: 0,
  };

  const sidebarListItemStyle: React.CSSProperties = {
    marginBottom: '10px',
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
          file={`${API}/get_pdf/${pdfUrl}`}
          onLoadSuccess={onDocumentLoadSuccess}
          // The width property on Document sets the width for ALL pages.
          // This is often the easiest way to control the overall PDF width.
          // You can comment this out and use the pdfPageWrapperStyle if
          // you need more granular control within PDFPage itself.
          // For typical single-column PDF display, this is sufficient.
          // width={800} // Example fixed width for the document
        >
          {pageNumbers.map((pageNumber) => (
            // Wrap PDFPage in a div with controlled width
            <div key={pageNumber} style={pdfPageWrapperStyle}>
              <PDFPage
                pageNumber={pageNumber}
                regions={regions.filter(region => region.pageNumber === pageNumber)}
                pdfUrl={pdfUrl}
                // Optionally, pass a width prop to PDFPage if it handles it.
                // Assuming PDFPage uses react-pdf's <Page> internally,
                // you might also set a scale or width directly on <Page>.
                // For instance, if PDFPage renders <Page width={desiredWidth} />
                // Then you could pass: pageRenderWidth={800}
              />
            </div>
          ))}
          <div style={sidebarStyle}>
            <h2 style={sidebarHeadingStyle}>Sidebar Content</h2>
            <p>This is where you can add any information, controls, or additional features related to the PDF or your application.</p>
            <ul style={sidebarListStyle}>
              <li style={sidebarListItemStyle}>Item 1</li>
              <li style={sidebarListItemStyle}>Item 2</li>
              <li style={sidebarListItemStyle}>Item 3</li>
            </ul>
          </div>
        </Document>
        <SelectionButton onAction={handleSelectionAction} />
      </div>
    </div>
  );
}

export default PDFViewer;