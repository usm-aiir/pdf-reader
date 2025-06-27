import { AreaHighlight, MonitoredHighlightContainer, useHighlightContainerContext, type Tip } from "react-pdf-highlighter-extended";
import type { MathHighlight } from "./types";
import { MathHighlightPopup } from "./MathHighlightPopup";

interface MathHighlightContainerProps {
}

export function MathHighlightContainer({  }: MathHighlightContainerProps) {
    console.log("MathHighlightContainer rendered");
    const {
        highlight,
        isScrolledTo,
        highlightBindings,
    } = useHighlightContainerContext<MathHighlight>();
    console.log("MathHighlightContainer higlight index:", highlight.latex_index);
    console.log("MathHighlightContainer highlight:", highlight);
    console.log("MathHighlightContainer highlight position:", highlight.position);
    const component = <AreaHighlight highlight={highlight} bounds={highlightBindings.textLayer} isScrolledTo={isScrolledTo} style={{
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
    }} />
    const highlightTip: Tip = {
        position: highlight.position,
        content: <MathHighlightPopup highlight={highlight} />,
    }
    return (
        <MonitoredHighlightContainer
            highlightTip={highlightTip}
            key={highlight.id}>
            {component}
        </MonitoredHighlightContainer>
    )
}

export default MathHighlightContainer;