import type { Highlight } from "react-pdf-highlighter-extended";

export interface MathHighlight extends Highlight {
    latex_index: number; // Index of the LaTeX formula in the PDF
}