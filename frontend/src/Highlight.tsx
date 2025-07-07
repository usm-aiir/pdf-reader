import type { FormulaRegion } from "./types";
import './Highlight.css';
import { useEffect } from "react";

interface HighlightProps {
    region: FormulaRegion;
    pageWidth?: number;
    pageHeight?: number;
    pdfUrl: string;
}

import { API } from "./PDFViewer";

async function loadLatexForRegion(formulaRegion: FormulaRegion, pdfUrl: string): Promise<string> {
    const regionId = formulaRegion.id;
    const response = await fetch(`${API}/get_latex_for_region/${regionId}/${pdfUrl}`);
    const data = await response.json();
    if (data.latex) {
        formulaRegion.latex = data.latex; // Store LaTeX in the region object
        return data.latex;
    } else {
        console.warn(`No LaTeX content found for region ${regionId}`);
        return 'No LaTeX content available';
    }
};

function Highlight({ region, pageWidth, pageHeight, pdfUrl }: HighlightProps) {
    useEffect(() => {
        // Load LaTeX for the region on load
        if (!region.latex) {
            loadLatexForRegion(region, pdfUrl);
        }
    }, [region, pdfUrl]);

    return (
        <div
            className="math-highlight"
            style={{
                left: region.boundingRect.x1 * (pageWidth || 1),
                top: region.boundingRect.y1 * (pageHeight || 1),
                width: (region.boundingRect.x2 - region.boundingRect.x1) * (pageWidth || 1),
                height: (region.boundingRect.y2 - region.boundingRect.y1) * (pageHeight || 1),
            }}
            id={`highlight-${region.id}`}
            aria-label={region.latex || '[Formula not yet loaded]'}
        />
    );
}

export default Highlight;
export { loadLatexForRegion };