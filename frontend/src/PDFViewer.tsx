// import React, { useState, useEffect } from 'react';
// import { PdfHighlighter, set  } from 'react-pdf-highlighter-extended';
// import { Worker, Viewer } from '@react-pdf-viewer/core'; // For basic PDF viewing if you want to combine
// import { highlightPlugin } from '@react-pdf-viewer/highlight'; // For react-pdf-viewer's highlight plugin

import { PdfHighlighter, PdfLoader } from "react-pdf-highlighter-extended";
import type { MathHighlight } from "./types";
import MathHighlightContainer from "./MathHighlightContainer";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const PDFViewer = () => {
  const { encodedPath } = useParams<{ encodedPath: string }>();
  // const [highlights, setHighlights] = useState<MathHighlight[]>([]);
  // console.log("Params:", useParams());
  // Example url of pdf with math highlights (that is not the one above but a new one not 23-09-14972.pdf):
  // http://localhost:9090/get_pdf/https://arxiv.org/pdf/2309.16199.pdf
  if (!encodedPath) {
    return <h1>Please provide a PDF path in the URL, e.g., /pdf/</h1>
  }
  const path = decodeURIComponent(encodedPath);
  // useEffect(() => {
  //   const fetchHighlights = async () => {
  //     console.log("PDF path changed:", path);
  //     if (!path) {
  //       console.error("No PDF path provided in the URL.");
  //       return;
  //     }
  //     try {
  //       const response = await fetch(`http://localhost:9090/predict_math_regions/${path}`);
  //       const data = await response.json();
  //       console.log("Received highlights:", data);
  //       const newHighlights: MathHighlight[] = [];
  //       for (const region of data.regions) {
  //           const pageNumber: number = region.pagenum;
  //           const latexIndex: number = region.id;
  //           const bbox: number[] = region.bbox;
  //           const highlight: MathHighlight = {
  //               content: undefined, // This will be set later in MathHighlightContainer
  //               position: {
  //                   boundingRect: {
  //                       x1: bbox[0],
  //                       y1: bbox[1],
  //                       x2: bbox[2],
  //                       y2: bbox[3],
  //                       width: bbox[2] - bbox[0],
  //                       height: bbox[3] - bbox[1],
  //                       pageNumber: pageNumber
  //                   },
  //                   rects: []
  //               },
  //               latex_index: latexIndex,
  //               id: `highlight-${pageNumber}-${latexIndex}`,
  //           }
  //           console.log("Adding highlight:", highlight);
  //           newHighlights.push(highlight);
  //       }
  //       setHighlights(newHighlights);
  //     }
  //     catch (error) {
  //       console.error("Error fetching highlights:", error);
  //     }
  //   }
  //   fetchHighlights();
  // }, [path]);
  // setHighlights([
  //   {
  //     content: undefined, // This will be set later in MathHighlightContainer
  //     position: {
  //       boundingRect: {
  //         x1: 100,
  //         y1: 100,
  //         x2: 200,
  //         y2: 200,
  //         width: 100,
  //         height: 100,
  //         pageNumber: 1
  //       },
  //       rects: []
  //     },
  //     latex_index: 0,
  //     id: `highlight-1-0`,
  //   }
  // ])
  const highlights: MathHighlight[] = [
    {
      content: undefined, // This will be set later in MathHighlightContainer
      position: {
        boundingRect: {
          x1: 10,
          y1: 10,
          x2: 60,
          y2: 60,
          width: 50,
          height: 50,
          pageNumber: 1
        },
        rects: []
      },
      latex_index: 0,
      id: `highlight-1-0`,
    }
  ];
  console.log("Opening PDF:", path);
    return (
        <PdfLoader document={"http://localhost:9090/get_pdf/" + path}>
            {(pdfDocument) => (
                <PdfHighlighter
                    enableAreaSelection={() => false}
                    pdfDocument={pdfDocument}
                    utilsRef={(_pdfHighlighterUtils) => {
                    } }
                    highlights={highlights}>
                        <MathHighlightContainer />
                </PdfHighlighter>
            )}
        </PdfLoader>
    )
};

export default PDFViewer;