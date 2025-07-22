import type { FormulaRegion } from "../types";
import styles from './Highlight.module.css'; // Assuming you have a CSS module for styles

interface HighlightProps {
    region: FormulaRegion;
    pageWidth?: number;
    pageHeight?: number;
    pdfUrl: string;
    isHighlighted?: boolean; // Optional prop to indicate if the highlight is active
    onClick?: (region: FormulaRegion) => void; // Optional click handler
}

function Highlight({ region, pageWidth, pageHeight, isHighlighted, onClick }: HighlightProps) {
    const width = (pageWidth || 1) * (region.boundingRect.x2 - region.boundingRect.x1);
    const height = (pageHeight || 1) * (region.boundingRect.y2 - region.boundingRect.y1);
    return (
        <div
            className={`${styles.mathHighlight} ${isHighlighted ? styles.mathHighlight_active : ''}`}
            style={{
                width: `${width}px`,
                height: `${height}px`,
            }}
            id={`highlight-${region.id}`}
            aria-label={region.latex || '[Formula not yet loaded]'}
            onClick={onClick ? () => onClick(region) : undefined}
        />
    );
}

export default Highlight;