const MathHighlightComment = ({ highlight }: { highlight: MathHighlight }) => {
    const { toggleEditInProgress } = usePdfHighlighterContext();
    const { viewportToScaled, screenshot } = useHighlightContainerContext();
    
    const isTextHighlight = !Boolean(highlight.content && highlight.content.image);
    
    const component = isTextHighlight ? (
        <TextHighlight
        highlight={highlight}
        />
    ) : (
        <AreaHighlight
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
        bounds={highlight.bindings.textLayer}
        onEditStart={() => toggleEditInProgress(true)}
        />
    );
    
    return component;
}