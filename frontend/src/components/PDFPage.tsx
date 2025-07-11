import { memo, useEffect, useState } from "react";
import type { FormulaRegion } from "../types";
import { Page } from "react-pdf";
import Highlight from "./Highlight";

interface PDFPageProps {
    pageNumber: number;
    regions: FormulaRegion[];
    pdfUrl: string;
}

import ReactDOM from 'react-dom/client'; // Import ReactDOM for dynamic rendering

const PDFPage = memo(({ pageNumber, regions, pdfUrl }: PDFPageProps) => {
    console.log(`Rendering page ${pageNumber} with ${regions.length} regions`);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [pageLoadSuccess, setPageLoadSuccess] = useState(false);
    const [highlightsShouldBeHighlighted, setHighlightsShouldBeHighlighted] = useState({} as Record<number, boolean>);
    const updateTextLayer = () => {
        const parent = document.querySelector(`.react-pdf__Page[data-page-number="${pageNumber}"] .react-pdf__Page__textContent`);
        const parentBoundingRect = parent?.getBoundingClientRect();
        const spanElements = document.querySelectorAll(`.react-pdf__Page[data-page-number="${pageNumber}"] .react-pdf__Page__textContent span`);
        spanElements.forEach(span => {
            const spanBoundingRect = span.getBoundingClientRect();
            regions.forEach(region => {
                const regionBoundingRect = region.boundingRect;
                const scaledRegionBoundingRect = {
                    x1: regionBoundingRect.x1 * width,
                    y1: regionBoundingRect.y1 * height,
                    x2: regionBoundingRect.x2 * width,
                    y2: regionBoundingRect.y2 * height,
                };
                const adjustedSpanBoundingRect = {
                    left: spanBoundingRect.left - (parentBoundingRect?.left || 0),
                    top: spanBoundingRect.top - (parentBoundingRect?.top || 0),
                    right: spanBoundingRect.right - (parentBoundingRect?.left || 0),
                    bottom: spanBoundingRect.bottom - (parentBoundingRect?.top || 0),
                };// Check if the adjusted span bounding rect is within the scaled region bounding rect +/- 10 pixels
                if (
                    adjustedSpanBoundingRect.left >= scaledRegionBoundingRect.x1 - 10 &&
                    adjustedSpanBoundingRect.top >= scaledRegionBoundingRect.y1 - 10 &&
                    adjustedSpanBoundingRect.right <= scaledRegionBoundingRect.x2 + 10 &&
                    adjustedSpanBoundingRect.bottom <= scaledRegionBoundingRect.y2 + 10
                ) {
                    // Make the span unselectable
                    (span as HTMLElement).style.userSelect = 'none';
                    (span as HTMLElement).style.pointerEvents = 'none';
                    const existingHighlight = document.getElementById(`highlight-${region.id}`);
                    if (!existingHighlight) {
                        const container = document.createElement('span');
                        container.id = `highlight-${region.id}`;
                        span.parentNode?.insertBefore(container, span);
                        const root = ReactDOM.createRoot(container);
                        root.render(
                            <>
                                <Highlight
                                    region={region}
                                    pageWidth={width}
                                    pageHeight={height}
                                    pdfUrl={pdfUrl}
                                    isHighlighted={highlightsShouldBeHighlighted[region.id]}
                                />
                                <span style={{ clip: 'rect(0, 0, 0, 0)', position: 'absolute' }}>${region.latex || '[Formula not yet loaded]'}$</span>
                            </>
                        );
                        // Removed invalid useEffect here. See below for correct placement.
                    }
                }
            });
        });
    };
    useEffect(() => {
        if (pageLoadSuccess) {
            updateTextLayer();
        }
    }, [regions]);
    // Add a global selectionchange event listener to update highlight state
    useEffect(() => {
        const onTextSelectionChange = () => {
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const newHighlights: Record<number, boolean> = {};
                // regions.forEach(region => {
                //     // Try to find the highlight container for this region
                //     const highlightElem = document.getElementById(`highlight-${region.id}`);
                //     if (highlightElem && range.intersectsNode(highlightElem)) {
                //         newHighlights[region.id] = true;
                //     } else {
                //         newHighlights[region.id] = false;
                //     }
                // });
                // setHighlightsShouldBeHighlighted(prev => ({
                //     ...prev,
                //     ...newHighlights,
                // }));
            } else {
                // No selection, clear all highlights
                // const cleared: Record<number, boolean> = {};
                // regions.forEach(region => {
                //     cleared[region.id] = false;
                // });
                // setHighlightsShouldBeHighlighted(prev => ({
                //     ...prev,
                //     ...cleared,
                // }));
            }
        };
        document.addEventListener('selectionchange', onTextSelectionChange);
        return () => {
            document.removeEventListener('selectionchange', onTextSelectionChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount
    return (
        <div key={pageNumber} style={{ position: 'relative', marginBottom: '20px' }}>
            <Page key={pageNumber} pageNumber={pageNumber} onRenderSuccess={(page) => {
                setWidth(page.width);
                setHeight(page.height);
            }} onRenderTextLayerSuccess={() => {
                setPageLoadSuccess(true);
                updateTextLayer();
            }} />
        </div>
    );
});

export default PDFPage;
