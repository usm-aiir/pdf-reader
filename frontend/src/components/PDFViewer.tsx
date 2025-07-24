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

// Import the CSS module
import styles from './PDFViewer.module.css';

// Add TypeScript declaration for the custom element
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { placeholder?: string };
        }
    }
}

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

  useEffect(() => {
    console.log('Mathfield value changed:', mathFieldRef.current?.getValue());
  }, [mathFieldRef.current?.latex]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Document
          file={`${API}/get_pdf/${pdfDocumentMetadata?.url}`}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          {pageNumbers.map((pageNumber) => (
            <div key={pageNumber} className={styles.pdfPageWrapper}>
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
      <div className={styles.sidebar}>
        <div className={styles.searchBarContainer}>
          <button
            className={styles.modeToggleButton}
            onClick={() => setIsMathMode(!isMathMode)}
            title={isMathMode ? "Switch to Text Mode" : "Switch to Math Mode"}
          >
            {isMathMode ? "𝟄𝐚𝐛𝐜" : "𝑎𝑏𝑐"} {/* Unicode characters for visual representation */}
          </button>
          <math-field ref={mathFieldRef} placeholder="\[Search\ mathematics...\]" style={{ flexGrow: 1 }}></math-field>
          <button
            className={styles.searchButton}
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
                        <p className={styles.noResultsMessage}>
                            Perform a search to see results here.
                        </p>
                    )}
                </div>
      </div>
    </div>
  );
}

export default PDFViewer;
