import { useEffect, useState } from "react";
import type { FormulaRegion } from "./types";
import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

interface FormulaPopupProps {
    key?: string;
    region: FormulaRegion;
    pdfUrl: string;
}

function FormulaPopup({ region, pdfUrl }: FormulaPopupProps) {
    const [formulaContent, setFormulaContent] = useState<string | null>(null);
    useEffect(() => {
        // Fetch the formula content from the backend
        fetch(`http://localhost:9090/get_latex_for_region/${region.id}/${pdfUrl}`)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched formula content:', data);
                setFormulaContent(data.latex || 'No content found for this region');
            })
            .catch(error => {
                console.error('Error fetching formula content:', error);
                setFormulaContent('Error loading formula content');
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