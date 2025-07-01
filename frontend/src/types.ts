interface FormulaRegion {
    id: number;
    pageNumber: number;
    boundingRect: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    latex?: string; // Optional field for storing LaTeX content
}

export type { FormulaRegion }