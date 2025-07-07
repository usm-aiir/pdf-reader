import { useEffect, useState } from 'react';
import { Document } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url';

import { pdfjs } from 'react-pdf';
import type { DocumentCallback } from 'react-pdf/dist/shared/types.js';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

import './PDFViewer.css';
import type { FormulaRegion } from './types';
import PDFPage from './PDFPage';
import SelectionButton from './SelectionButton'; // Import the new component


interface PDFViewerProps {
}

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
    // Fetch the formula regions from the backend
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
    // Open a new tab querying the selected text
    const queryUrl = `https://www.mathmex.com/?q=${encodeURIComponent(selectedText)}`;
    window.open(queryUrl, '_blank');
  };

  return (
    <>
      <Document file={`${API}/get_pdf/${pdfUrl}`} onLoadSuccess={onDocumentLoadSuccess} >
        {pageNumbers.map((pageNumber) => (
          <PDFPage
            key={pageNumber}
            pageNumber={pageNumber}
            regions={regions.filter(region => region.pageNumber === pageNumber)}
            pdfUrl={pdfUrl} />
        ))}
      </Document>
      {/* Render the SelectionButton outside of the Document, as a sibling */}
      <SelectionButton onAction={handleSelectionAction} />
    </>
  )
}

export default PDFViewer;