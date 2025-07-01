import { useEffect, useState } from "react";
import type { FormulaRegion } from "./types";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

interface FormulaPopupProps {
    key?: string;
    region: FormulaRegion;
    pdfUrl: string;
    loadLatexForRegion: (regionId: FormulaRegion, pdfUrl: string) => Promise<string>;
}

function FormulaPopup({ region, pdfUrl, loadLatexForRegion }: FormulaPopupProps) {
    const [formulaContent, setFormulaContent] = useState<string | null>(null);
    useEffect(() => {
        if (region.latex) {
            // If the LaTeX content is already available in the region, use it directly
            setFormulaContent(region.latex);
            return;
        }
        // Fetch the formula content from the backend
        loadLatexForRegion(region, pdfUrl)
            .then(content => {
                setFormulaContent(content);
            });
    }, [region.id]);
    return (
        <div
            className="formula-popup"
            style={{
                position: 'absolute',
                top: '100%',
                left: '10%',
                backgroundColor: 'white',
                border: '1px solid black',
                padding: '10px',
                zIndex: 500,
                display: 'inline-block',
            }}
        >
            {formulaContent === null
                ? 'Loading...'
                : <Latex>${formulaContent}$</Latex>
            }
        </div>
    );
}
export default FormulaPopup;