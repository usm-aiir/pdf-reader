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

function Highlight({ region, pageWidth, pageHeight, pdfUrl }: HighlightProps) {
    const [popupVisible, setPopupVisible] = useState(false);
    const handleRegionClick = () => {
        setPopupVisible(!popupVisible);
    };
    return (
        <div
            className="highlight"
            style={{
                left: region.boundingRect.x1 * (pageWidth || 1),
                top: region.boundingRect.y1 * (pageHeight || 1),
                width: (region.boundingRect.x2 - region.boundingRect.x1) * (pageWidth || 1),
                height: (region.boundingRect.y2 - region.boundingRect.y1) * (pageHeight || 1),
            }}
            onClick={handleRegionClick}
        >
            {popupVisible && <FormulaPopup region={region} pdfUrl={pdfUrl} />}
        </div>
    );
}

export default Highlight;