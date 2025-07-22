import { useEffect, useRef, useState } from 'react';
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
import "mathlive"
import { API } from '../App';
import type { SearchResult } from './QueryAndResult';
import QueryAndResult from './QueryAndResult';


async function performSearch(query: string): Promise<SearchResult[]> {
  try {
    const result = await fetch(`${API}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        sources: [],
        mediaTypes: [],
        from: 0,
        size: 5
      })
    });
    const json = await result.json();
    console.log("Search results:", json.results);
    return json.results as SearchResult[];
  }
  catch (error) {
    console.error("Error performing search:", error);
    throw error; // Re-throw the error for further handling
  }
}

interface PDFViewerProps {
    pdfDocumentMetadata?: PDFDocumentMetadata;
}

interface MathfieldElement extends HTMLElement {
  executeCommand: (command: string, ...args: any[]) => void;
  focus: () => void;
  setValue: (value: string) => void;
  getValue: () => string;
  latex: string;
}

function PDFViewer({ pdfDocumentMetadata }: PDFViewerProps) {
  const mathFieldRef = useRef<MathfieldElement>(null);
  const [isMathMode, setIsMathMode] = useState<boolean>(false); // State to track mode
  const [currentQueryAndResults, setCurrentQueryAndResults] = useState<{ query: string; results: SearchResult[] }[]>([]);

  useEffect(() => {
      if (mathFieldRef.current) {
          // Initialize with text mode as per your original logic
          mathFieldRef.current.executeCommand("switchMode", "text");
          mathFieldRef.current.focus();
      }
      const element = mathFieldRef.current as MathfieldElement;
      element.addEventListener('input', () => {
        if (element.getValue().trim() === '') {
          // Automatically switch to text mode when the math field is empty
          element.executeCommand("switchMode", "text");
        }
      });
      element.addEventListener('mode-change', (event: CustomEvent) => {
          setIsMathMode(event.detail.mode === 'math');
      });
      return () => {
          // Cleanup event listener on unmount
          element.removeEventListener('input', () => {});
      };
  }, []); // Empty dependency array to run once on mount

  useEffect(() => {
    if (mathFieldRef.current) {
      mathFieldRef.current.executeCommand("switchMode", isMathMode ? "math" : "text");
      mathFieldRef.current.focus(); // Keep focus on the mathfield after mode switch
    }
  }, [isMathMode]); // Re-run when isMathMode changes

  const [numPages, setNumPages] = useState<number | null>(null);
  async function onDocumentLoadSuccess(pdf: DocumentCallback) {
    setNumPages(pdf.numPages);
  }
  const pageNumbers = Array.from({ length: numPages || 0 }, (_, i) => i + 1);

  const handleSelectionAction = (selectedText: string) => {
    // Check if the selected text is empty
    if (!selectedText.trim()) {
      console.warn('No text selected for MathMex search.');
      return;
    }
    // Always append selected text as plain text
    mathFieldRef.current?.setValue(mathFieldRef.current.getValue() + ' ' + "\\text{" + selectedText + "}");
  };

  const handleSearch = () => {
    const searchValue = mathFieldRef.current?.getValue();
    if (searchValue) {
      console.log("Performing search for:", searchValue);
      // Here you would integrate your actual search logic,
      // e.g., calling an API, filtering data, etc.
      performSearch(searchValue)
        .then(results => {
          console.log("Search results:", results);
          setCurrentQueryAndResults(prev => [...prev, { query: searchValue, results }]);
          // Optionally clear the math field after search
          if (mathFieldRef.current) {
            mathFieldRef.current.setValue('');
            mathFieldRef.current.focus();
          }
        })
        .catch(error => {
          console.error("Search failed:", error);
        });
    } else {
      console.warn("Search initiated, but the MathField is empty.");
    }
  };

  // --- Inline Styles Definition ---
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    width: '100vw',
  };

  const contentStyle: React.CSSProperties = {
    flexShrink: 0,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: 'calc(100vw - 300px)',
    width: 'fit-content',
  };

  const sidebarStyle: React.CSSProperties = {
    flexGrow: 1,
    backgroundColor: '#f0f0f0',
    padding: '20px',
    boxShadow: '-2px 0 5px rgba(0, 0, 0, 0.1)',
    overflowY: 'auto',
    minWidth: '250px',
    display: 'flex', // Added for layout of search bar and buttons
    flexDirection: 'column', // Added for layout of search bar and buttons
  };

  const searchBarContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px', // Spacing below the search bar
    gap: '8px', // Space between elements
  };

  const modeToggleButtonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#e0e0e0',
    cursor: 'pointer',
    whiteSpace: 'nowrap', // Prevent text wrapping
  };

  const searchButtonStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #007bff',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    whiteSpace: 'nowrap', // Prevent text wrapping
  };

  const pdfPageWrapperStyle: React.CSSProperties = {
    maxWidth: '800px',
    width: '100%',
    marginBottom: '10px',
    boxShadow: '0 0 8px rgba(0,0,0,0.2)',
  };

  useEffect(() => {
    console.log('Mathfield value changed:', mathFieldRef.current?.getValue());
    // Removed the automatic switch to text mode when empty,
    // as we now have a manual toggle.
  }, [mathFieldRef.current?.latex]);

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
                onHighlightClick={latex => {
                  if (mathFieldRef.current) {
                    mathFieldRef.current.setValue(mathFieldRef.current.getValue() + ' ' + latex);
                    mathFieldRef.current.focus();
                  }
                }}
              />
            </div>
          ))}
        </Document>
        <SelectionButton onAction={handleSelectionAction} />
      </div>
      <div style={sidebarStyle}>
        <div style={searchBarContainerStyle}>
          <button
            style={modeToggleButtonStyle}
            onClick={() => setIsMathMode(!isMathMode)}
            title={isMathMode ? "Switch to Text Mode" : "Switch to Math Mode"}
          >
            {isMathMode ? "𝟄𝐚𝐛𝐜" : "𝑎𝑏𝑐"} {/* Unicode characters for visual representation */}
          </button>
          <math-field ref={mathFieldRef} placeholder="\[Search\ mathematics...\]" style={{ flexGrow: 1 }}></math-field>
          <button
            style={searchButtonStyle}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px 0' }}>
          {currentQueryAndResults.length > 0 ? (
            currentQueryAndResults.map((item, index) => (
              <QueryAndResult
                key={index}
                query={item.query}
                results={item.results}
              />
            ))
          ) : (
                        <p style={{ textAlign: 'center', color: '#777', fontSize: '0.9em' }}>
                            Perform a search to see results here.
                        </p>
                    )}
                </div>
      </div>
    </div>
  );
}

export default PDFViewer;