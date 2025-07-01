import { useEffect, useState } from "react";
import type { FormulaRegion } from "./types";
import { Page } from "react-pdf";
import Highlight from "./Highlight";

interface PDFPageProps {
    pageNumber: number;
    regions: FormulaRegion[];
    pdfUrl: string;
}

import ReactDOM from 'react-dom/client'; // Import ReactDOM for dynamic rendering

function PDFPage({ pageNumber, regions, pdfUrl }: PDFPageProps) {
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [pageLoadSuccess, setPageLoadSuccess] = useState(false);
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
                    // // Insert an empty span if there is no empty span with id 'formula-span-{region.id}' right before the current span
                    // if (!document.getElementById(`formula-span-${region.id}`)) {
                    //     const emptySpan = document.createElement('span');
                    //     emptySpan.id = `formula-span-${region.id}`;
                    //     emptySpan.style.display = 'inline-block';
                    //     emptySpan.style.width = '0';
                    //     emptySpan.style.height = '0';
                    //     emptySpan.textContent = 'Hello World'; // Placeholder text to ensure the span is rendered
                    //     span.parentNode?.insertBefore(emptySpan, span);
                    //     console.log(`Inserted empty span for region ${region.id} on page ${pageNumber}`);
                    // }
                    // Insert highlight component if it doesn't already exist
                    const existingHighlight = document.getElementById(`highlight-${region.id}`);
                    if (!existingHighlight) {
                        const container = document.createElement('span');
                        container.id = `highlight-${region.id}`;
                        span.parentNode?.insertBefore(container, span);
                        const root = ReactDOM.createRoot(container);
                        root.render(
                            <Highlight
                                region={region}
                                pageWidth={width}
                                pageHeight={height}
                                pdfUrl={pdfUrl}
                            />
                        );
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
    return (
        <div key={pageNumber} style={{ position: 'relative', marginBottom: '20px' }}>
            <Page key={pageNumber} pageNumber={pageNumber} onRenderSuccess={(page) => {
                    setWidth(page.width);
                    setHeight(page.height);
                }} onRenderTextLayerSuccess={() => {
                    console.log('Text layer rendered successfully for page:', pageNumber);
                    setPageLoadSuccess(true);
                    updateTextLayer();
                }} />
            {/* {regions.map(region => (
                <Highlight
                    pdfUrl={pdfUrl}
                    key={region.id}
                    region={region}
                    pageWidth={width}
                    pageHeight={height}
                />
            ))} */}
        </div>
    );
}

export default PDFPage;