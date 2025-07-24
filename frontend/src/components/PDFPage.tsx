import { memo, useEffect, useState } from "react";
import type { FormulaRegion } from "../types";
import { Page } from "react-pdf";
import Highlight from "./Highlight"; // Assuming Highlight component has its own styles

import ReactDOM from 'react-dom/client'; // Import ReactDOM for dynamic rendering
import styles from './PDFPage.module.css'; // Import the CSS module

interface PDFPageProps {
    pageNumber: number;
    regions: FormulaRegion[];
    pdfUrl: string;
    onHighlightClick?: (latex: string) => void;
}

const PDFPage = memo(({ pageNumber, regions, pdfUrl, onHighlightClick }: PDFPageProps) => {
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [pageLoadSuccess, setPageLoadSuccess] = useState(false);

    /**
     * Updates the text layer by identifying formula regions and
     * dynamically inserting Highlight components.
     */
    const updateTextLayer = () => {
        // Select the text content layer for the current page
        const parent = document.querySelector(`.react-pdf__Page[data-page-number="${pageNumber}"] .react-pdf__Page__textContent`);
        if (!parent) return; // Exit if parent not found

        const parentBoundingRect = parent.getBoundingClientRect();
        // Select all text spans within the current page's text content
        const spanElements = document.querySelectorAll(`.react-pdf__Page[data-page-number="${pageNumber}"] .react-pdf__Page__textContent span`);

        spanElements.forEach(span => {
            const spanBoundingRect = span.getBoundingClientRect();

            regions.forEach(region => {
                const regionBoundingRect = region.boundingRect;

                // Scale the region bounding rect to the current page dimensions
                const scaledRegionBoundingRect = {
                    x1: regionBoundingRect.x1 * width,
                    y1: regionBoundingRect.y1 * height,
                    x2: regionBoundingRect.x2 * width,
                    y2: regionBoundingRect.y2 * height,
                };

                // Adjust span bounding rect relative to its parent's position
                const adjustedSpanBoundingRect = {
                    left: spanBoundingRect.left - parentBoundingRect.left,
                    top: spanBoundingRect.top - parentBoundingRect.top,
                    right: spanBoundingRect.right - parentBoundingRect.left,
                    bottom: spanBoundingRect.bottom - parentBoundingRect.top,
                };

                // Check if the adjusted span bounding rect is within the scaled region bounding rect
                // A small tolerance (e.g., +/- 10 pixels) is used for robust matching
                if (
                    adjustedSpanBoundingRect.left >= scaledRegionBoundingRect.x1 - 10 &&
                    adjustedSpanBoundingRect.top >= scaledRegionBoundingRect.y1 - 10 &&
                    adjustedSpanBoundingRect.right <= scaledRegionBoundingRect.x2 + 10 &&
                    adjustedSpanBoundingRect.bottom <= scaledRegionBoundingRect.y2 + 10
                ) {
                    // Make the underlying text span unselectable to prevent interference with highlight
                    (span as HTMLElement).style.userSelect = 'none';
                    (span as HTMLElement).style.pointerEvents = 'none';

                    // Check if a highlight for this region already exists to prevent duplicates
                    const existingHighlight = document.getElementById(`highlight-${region.id}`);
                    if (!existingHighlight) {
                        // Create a new container for the Highlight component
                        const container = document.createElement('span');
                        container.id = `highlight-${region.id}`;
                        // Apply CSS module class for static styles (position, z-index)
                        container.className = styles.highlightContainer;

                        // Set dynamic positioning and sizing based on calculated values
                        container.style.left = `${scaledRegionBoundingRect.x1}px`;
                        container.style.top = `${scaledRegionBoundingRect.y1}px`;
                        container.style.width = `${scaledRegionBoundingRect.x2 - scaledRegionBoundingRect.x1}px`;
                        container.style.height = `${scaledRegionBoundingRect.y2 - scaledRegionBoundingRect.y1}px`;

                        // Insert the new container before the current span in the DOM
                        span.parentNode?.insertBefore(container, span);

                        // Render the React Highlight component into the new container
                        const root = ReactDOM.createRoot(container);
                        root.render(
                            <>
                                <Highlight
                                    region={region}
                                    pageWidth={width}
                                    pageHeight={height}
                                    pdfUrl={pdfUrl}
                                    onClick={region => {
                                        if (onHighlightClick) {
                                            console.log('Highlight clicked:', region.latex || '');
                                            console.log('Highlight ID:', region.id);
                                            onHighlightClick(region.latex || '');
                                        }
                                    }}
                                />
                                {/* Hidden span for LaTeX content, useful for accessibility/copying */}
                                <span className={styles.latexSpan}>${region.latex || '[Formula not yet loaded]'}$</span>
                            </>
                        );
                    }
                }
            });
        });
    };

    // Effect to re-run text layer update when regions change or page dimensions are set
    useEffect(() => {
        if (pageLoadSuccess && width > 0 && height > 0) {
            updateTextLayer();
        }
    }, [regions, pageLoadSuccess, width, height]); // Added width and height to dependencies

    return (
        <div key={pageNumber} className={styles.pageContainer}>
            <Page
                key={pageNumber}
                pageNumber={pageNumber}
                onRenderSuccess={(page) => {
                    // Set page dimensions upon successful render
                    setWidth(page.width);
                    setHeight(page.height);
                }}
                onRenderTextLayerSuccess={() => {
                    // Indicate that the text layer is ready for processing
                    setPageLoadSuccess(true);
                    // Call updateTextLayer here to ensure highlights are placed after text layer is available
                    updateTextLayer();
                }}
            />
        </div>
    );
});

export default PDFPage;
