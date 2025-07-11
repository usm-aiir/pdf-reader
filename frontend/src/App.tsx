import { useState, useEffect } from "react";
import type { FormulaRegion, PDFDocumentMetadata } from "./types";
import PDFViewer from "./components/PDFViewer";
import PDFOpener from "./components/PDFOpener";
import PDFLoadingPage from "./components/PDFLoadingPage";

export const API = import.meta.env.MODE === 'development' ? 'http://localhost:9090' : 'https://pdf-api.mathmex.com';

async function fetchPDFRegions(pdfUrl: string): Promise<FormulaRegion[]> {
  const response = await fetch(`${API}/predict_math_regions/${pdfUrl}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch formula regions for ${pdfUrl}`);
  }
  const data = await response.json();
  return data.regions.map((region: any) => ({
    id: region.id,
    pageNumber: region.pagenum,
    boundingRect: {
      x1: region.bbox[0],
      y1: region.bbox[1],
      x2: region.bbox[2],
      y2: region.bbox[3],
    },
  }));
}

async function fetchPDFMetadata(pdfUrl: string, onProgress: (progress: number) => void): Promise<PDFDocumentMetadata> {
  const regions = await fetchPDFRegions(pdfUrl);
  onProgress(50); // Update progress after fetching regions
  // Make it so that the regions are all fetched in parallel
  let regionsLoaded = 0;
  const fetchPromises = regions.map(region =>
    fetch(`${API}/get_latex_for_region/${region.id}/${pdfUrl}`)
      .then(response => {
        if (!response.ok) {
          console.warn(`No LaTeX content found for region ${region.id}`);
          regionsLoaded++;
          onProgress(Math.min(50 + (regionsLoaded / regions.length) * 50, 100));
          return { id: region.id, latex: '' }; // Return empty LaTeX if
          // the fetch fails
        }
        regionsLoaded++;
        onProgress(Math.min(50 + (regionsLoaded / regions.length) * 50, 100));
        return response.json().then(data => ({
          id: region.id,
          latex: data.latex || '', // Use empty string if no LaTeX is found
        }));
      })
  );
  const latexResults = await Promise.all(fetchPromises);
  for (const region of regions) {
    const latexResult = latexResults.find(result => result.id === region.id);
    region.latex = latexResult ? latexResult.latex : '[Formula loading error]';
  }
  return {
    url: pdfUrl,
    regions,
  };
}

function App() {
  const path = window.location.pathname;
  const delimiterIndex = path.indexOf('/pdf/');
  const pdfUrl = delimiterIndex !== -1 ? path.substring(delimiterIndex + 5) : '';
  if (!pdfUrl || pdfUrl.trim() === '') {
    return <>
      <PDFOpener />
    </>
  }
  const [pdfDocumentMetadata, setPdfDocumentMetadata] = useState<PDFDocumentMetadata | null>(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    fetchPDFMetadata(pdfUrl, (progressValue: number) => {
      setProgress(progressValue);
    })
      .then(metadata => setPdfDocumentMetadata(metadata))
      .catch(error => console.error('Error fetching PDF metadata:', error));
  }, [pdfUrl]);
  if (!pdfDocumentMetadata) {
    return (
      <>
        <PDFLoadingPage progress={progress} statusMessage={progress >= 50 ? "Loading LaTeX content..." : "Loading PDF metadata..."} />
      </>
    )
  }
  return (
    <>
      <PDFViewer pdfDocumentMetadata={pdfDocumentMetadata} />
    </>
  );
}

export default App
