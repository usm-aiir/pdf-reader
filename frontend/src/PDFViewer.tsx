import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url';

// Set the workerSrc for pdf.js
// This tells pdf.js where to find its worker file.
// In a production environment, you might serve this from a CDN or your own static files.
// // For development, we can point to the unpkg CDN.
// pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfViewerProps {
    pdfUrl: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [pageNum, setPageNum] = useState(1);
    const [pageRendering, setPageRendering] = useState(false);
    const [pageNumPending, setPageNumPending] = useState<number | null>(null);

    // Function to render a specific page
    const renderPage = async (num: number) => {
        setPageRendering(true);
        const canvas = canvasRef.current;
        if (!canvas) {
            setPageRendering(false);
            return;
        }
        const context = canvas.getContext('2d');
        if (!context) {
            setPageRendering(false);
            return;
        }

        try {
            if (!pdfDoc) {
                setPageRendering(false);
                return;
            }
            const page = await pdfDoc.getPage(num);
            const viewport = page.getViewport({ scale: 1.5 }); // Adjust scale as needed

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
            };
            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                setPageRendering(false);
                if (pageNumPending !== null) {
                    // New page rendering is pending
                    renderPage(pageNumPending);
                    setPageNumPending(null);
                }
            });
        } catch (error) {
            console.error('Error rendering page:', error);
            setPageRendering(false);
        }
    };

    const queueRenderPage = (num: number) => {
        if (pageRendering) {
            setPageNumPending(num);
        } else {
            renderPage(num);
        }
    };

    // Load PDF when pdfUrl changes
    useEffect(() => {
        const loadPdf = async () => {
            if (!pdfUrl) {
                setPdfDoc(null);
                return;
            }

            try {
                const loadingTask = pdfjsLib.getDocument("http://localhost:9090/get_pdf/" + pdfUrl);
                const pdf = await loadingTask.promise;
                setPdfDoc(pdf);
                setPageNum(1); // Reset to first page when new PDF loads
            } catch (error) {
                console.error('Error loading PDF:', error);
                setPdfDoc(null);
            }
        };

        loadPdf();
    }, [pdfUrl]);

    // Render page when pdfDoc or pageNum changes
    useEffect(() => {
        if (pdfDoc) {
            queueRenderPage(pageNum);
        }
    }, [pdfDoc, pageNum]);


    const onPrevPage = () => {
        if (pageNum <= 1) {
            return;
        }
        setPageNum(prevPageNum => prevPageNum - 1);
    };

    const onNextPage = () => {
        if (pdfDoc && pageNum >= pdfDoc.numPages) {
            return;
        }
        setPageNum(prevPageNum => prevPageNum + 1);
    };


    if (!pdfUrl) {
        return <div>Please provide a PDF URL to display.</div>;
    }

    if (!pdfDoc) {
        return <div>Loading PDF...</div>;
    }

    return (
        <div>
            <div>
                <button onClick={onPrevPage} disabled={pageNum <= 1 || pageRendering}>
                    Previous
                </button>
                <span>Page {pageNum} of {pdfDoc.numPages}</span>
                <button onClick={onNextPage} disabled={pageNum >= pdfDoc.numPages || pageRendering}>
                    Next
                </button>
            </div>
            <div>
                <canvas ref={canvasRef}></canvas>
            </div>
            {pageRendering && <div>Rendering page...</div>}
        </div>
    );
};

export default PdfViewer;