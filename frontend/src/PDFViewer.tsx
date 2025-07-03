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


interface PDFViewerProps {
}

function PDFViewer({ }: PDFViewerProps) {
  // Get the PDF URL that is passed in after the '/pdf/' part of the URL
  const path = window.location.pathname;
  const delimiterIndex = path.indexOf('/pdf/');
  const pdfUrl = delimiterIndex !== -1 ? path.substring(delimiterIndex + 5) : '';
  // Log the PDF URL to the console for debugging
  if (!pdfUrl || pdfUrl.trim() === '') {
    return <div>Please provide a PDF URL in the query string, e.g., ?pdf=https://example.com/sample.pdf</div>;
  }
  const [numPages, setNumPages] = useState<number | null>(null);
  async function onDocumentLoadSuccess(pdf: DocumentCallback) {
    setNumPages(pdf.numPages);
  }
  const pageNumbers = Array.from({ length: numPages || 0 }, (_, i) => i + 1);
  const [regions, setRegions] = useState<FormulaRegion[]>([]);
  useEffect(() => {
    // Fetch the formula regions from the backend
    fetch(`http://localhost:9090/predict_math_regions/${pdfUrl}`)
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

  const [boxPosition, setBoxPosition] = useState<{ top: number, left: number } | null>(null);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        setBoxPosition({
          top: rect.bottom + window.scrollY + 5, // 5px below the selection
          left: rect.left + window.scrollX
        });
      }
      else {
        setBoxPosition(null);
      }
    } else {
      setBoxPosition(null);
    }
  }

  useEffect(() => {
    // Add event listener for text selection
    document.addEventListener('mouseup', handleTextSelection);
    // document.addEventListener('selectionchange', handleTextSelection);
    return () => {
      // Clean up the event listener
      document.removeEventListener('mouseup', handleTextSelection);
      // document.removeEventListener('selectionchange', handleTextSelection);
    };
  }, []);

  return (
    <>
      <Document file={"http://localhost:9090/get_pdf/" + pdfUrl} onLoadSuccess={onDocumentLoadSuccess} >
        {pageNumbers.map((pageNumber) => (
          <PDFPage
            key={pageNumber}
            pageNumber={pageNumber}
            regions={regions.filter(region => region.pageNumber === pageNumber)}
            pdfUrl={pdfUrl} />
        ))}
      </Document>
      {boxPosition && (
        <div className="selection-box" style={{
          top: boxPosition.top,
          left: boxPosition.left
        }}>
          <a href={`https://www.mathmex.com/?q=${encodeURIComponent(window.getSelection()?.toString() || '')}`} target="_blank" rel="noopener noreferrer">
            Open in MathMex
          </a>
        </div>
      )}
    </>
  )
}

export default PDFViewer;