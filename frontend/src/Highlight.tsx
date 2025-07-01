import FormulaPopup from "./FormulaPopup";
import type { FormulaRegion } from "./types";
import './Highlight.css';
import { useState } from "react";

interface HighlightProps {
    region: FormulaRegion;
    pageWidth?: number;
    pageHeight?: number;
    pdfUrl: string;
}

function loadLatexForRegion(formulaRegion: FormulaRegion, pdfUrl: string): Promise<string> {
    const regionId = formulaRegion.id;
    return fetch(`http://localhost:9090/get_latex_for_region/${regionId}/${pdfUrl}`)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched formula content:', data);
            if (data.latex) {
                formulaRegion.latex = data.latex; // Store LaTeX in the region object
                return data.latex;
            } else {
                console.warn(`No LaTeX content found for region ${regionId}`);
                return 'No LaTeX content available';
            }
        })
        .catch(error => {
            console.error('Error fetching formula content:', error);
            return 'Error loading formula content';
        });
}

function Highlight({ region, pageWidth, pageHeight, pdfUrl }: HighlightProps) {
    const [popupVisible, setPopupVisible] = useState(false);
    const handleRegionClick = () => {
        setPopupVisible(!popupVisible);
    };
    return (
        <div
            className="math-highlight"
            style={{
                left: region.boundingRect.x1 * (pageWidth || 1),
                top: region.boundingRect.y1 * (pageHeight || 1),
                width: (region.boundingRect.x2 - region.boundingRect.x1) * (pageWidth || 1),
                height: (region.boundingRect.y2 - region.boundingRect.y1) * (pageHeight || 1),
            }}
            onClick={handleRegionClick}
            id={`highlight-${region.id}`}
            aria-label={region.latex || '[Formula not yet loaded]'}
            onFocus={() => loadLatexForRegion(region, pdfUrl)} // Load LaTeX when focused
        >
            {popupVisible && <FormulaPopup region={region} pdfUrl={pdfUrl} loadLatexForRegion={loadLatexForRegion} />}
        </div>
    );
}

export default Highlight;