import type { ViewportHighlight } from "react-pdf-highlighter-extended";
import type { MathHighlight } from "./types";

interface MathHighlightPopupProps {
    highlight: ViewportHighlight<MathHighlight>;
}

export function MathHighlightPopup({ highlight }: MathHighlightPopupProps) {
    return highlight.latex_index ? (
        <div className="MathHighlightPopup">
            You will be able to see this latex formula soon.
            <br />
            <strong>Index: {highlight.latex_index}</strong>
        </div>
    ) : (
        <div className="MathHighlightPopup">
            This highlight does not contain a LaTeX formula. Uh oh!
        </div>
    );
}

export default MathHighlightPopup;