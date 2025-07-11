import type { FormulaRegion } from "../types";
import styles from './Highlight.module.css'; // Assuming you have a CSS module for styles

interface HighlightProps {
    region: FormulaRegion;
    pageWidth?: number;
    pageHeight?: number;
    pdfUrl: string;
    isHighlighted?: boolean; // Optional prop to indicate if the highlight is active
}

function Highlight({ region, pageWidth, pageHeight, isHighlighted }: HighlightProps) {

    return (
        <div
            className={`${styles.mathHighlight} ${isHighlighted ? styles.mathHighlight_active : ''}`}
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