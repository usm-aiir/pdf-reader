import "mathlive";
import { useEffect, useRef } from "react";

// Add TypeScript declaration for the custom element
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { placeholder?: string };
        }
    }
}

interface MathMexSearchBarProps {
}
function MathMexSearchBar({ }: MathMexSearchBarProps) {
    // MathLive's MathfieldElement type declaration
    interface MathfieldElement extends HTMLElement {
        executeCommand: (command: string, ...args: any[]) => void;
        focus: () => void;
    }

    const mathFieldRef = useRef<MathfieldElement>(null);
    useEffect(() => {
        if (mathFieldRef.current) {
            mathFieldRef.current.executeCommand("switchMode", "text");
            mathFieldRef.current.focus();
        }
    }, [mathFieldRef]);
    return (
        <div>
            <math-field placeholder="\mathrm{Search\ mathematics...}" ref={mathFieldRef} />
        </div>
    );
}
export default MathMexSearchBar;