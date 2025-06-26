// import React, { useState, useEffect } from 'react';
// import { PdfHighlighter, set  } from 'react-pdf-highlighter-extended';
// import { Worker, Viewer } from '@react-pdf-viewer/core'; // For basic PDF viewing if you want to combine
// import { highlightPlugin } from '@react-pdf-viewer/highlight'; // For react-pdf-viewer's highlight plugin

import { useState } from "react";
import { AreaHighlight, PdfHighlighter, PdfLoader, TextHighlight, useHighlightContainerContext, usePdfHighlighterContext, type Highlight, type PdfHighlighterUtils } from "react-pdf-highlighter-extended";

// // Import PDF.js worker for react-pdf-highlighter-extended and react-pdf-viewer
// import { pdfjs } from 'react-pdf'; // Using react-pdf for worker setup simplicity
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// // You'll need these CSS imports for proper styling
// import 'react-pdf-highlighter-extended/dist/style.css'; // Essential for highlighter styles
// import '@react-pdf-viewer/core/lib/styles/index.css'; // Core styles for react-pdf-viewer
// import '@react-pdf-viewer/highlight/lib/styles/index.css'; // Highlight plugin styles for react-pdf-viewer

interface MathHighlightContainerProps {
    editHighlight: (id: string, edit: Partial<MathHighlight>) => void;
}

const MathHighlightContainer: React.FC<MathHighlightContainerProps> = ({ editHighlight }) => {
    const {
    highlight, // The highlight being rendred
    viewportToScaled, // Convert a highlight position to platform agnostic coords (useful for saving edits)
    screenshot, // Screenshot a bounding rectangle
    isScrolledTo, // Whether the highlight has been auto-scrolled to
    highlightBindings, // Whether the highlight has been auto-scrolled to
  } = useHighlightContainerContext();

  const {
    currentTip,
    setTip,
    toggleEditInProgress,
    isEditInProgress
  } = useTipViewerUtils();

  const { toggleEditInProgress } =
    usePdfHighlighterContext();

  const isTextHighlight = !Boolean(
    highlight.content && highlight.content.image
  );

  const component = isTextHighlight ? (
    <TextHighlight
      isScrolledTo={isScrolledTo}
      highlight={highlight}
    />
  ) : (
    <AreaHighlight
      isScrolledTo={isScrolledTo}
      highlight={highlight}
      onChange={(boundingRect) => {
        const edit = {
          position: {
            boundingRect: viewportToScaled(boundingRect),
            rects: [],
          },
          content: {
            image: screenshot(boundingRect),
          },
        };

        editHighlight(highlight.id, edit);
        toggleEditInProgress(false);
      }}
      bounds={highlightBindings.textLayer}
      onEditStart={() => toggleEditInProgress(true)}
    />
  );

  return (component);


interface PDFViewerProps {
    pdfUrl: string;
    highlights: MathHighlight[];
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, highlights }) => {
    const [pdfHighlighterUtils, setPdfHighlighterUtils] = useState<PdfHighlighterUtils>(null);
    return (
        <PdfLoader document={pdfUrl}>
            {(pdfDocument) => (
                <PdfHighlighter
                    enableAreaSelection={event => event.altKey}
                    pdfDocument={pdfDocument}
                    utilsRef={(_pdfHighlighterUtils) => {
                        setPdfHighlighterUtils(_pdfHighlighterUtils);
                    }}
                    highlights={highlights}>
                        {}
                </PdfHighlighter>
            )}
        </PdfLoader>
    )
};