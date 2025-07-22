import React, { useEffect, useState } from 'react';
import { processMathMarkdown } from '../utils/markdownProcessor'; // Import the new utility

// Re-import SearchResult from QueryAndResult for consistency, or define here if independent
import type { SearchResult } from './QueryAndResult';

// Define props for the component
interface SearchResultItemProps {
    result: SearchResult;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result }) => {
    const [processedTitle, setProcessedTitle] = useState<string>('');
    const [processedBodyText, setProcessedBodyText] = useState<string>('');

    useEffect(() => {
        const processContent = async () => {
            setProcessedTitle(await processMathMarkdown(result.title));
            setProcessedBodyText(await processMathMarkdown(result.body_text));
        };
        processContent();
    }, [result.title, result.body_text]);

    const itemStyle: React.CSSProperties = {
        border: '1px solid #ddd',
        borderRadius: '5px',
        padding: '8px', // Reduced padding for a smaller chip look
        backgroundColor: '#f9f9f9',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex', // Enable flex for vertical layout of content
        flexDirection: 'column', // Stack children vertically
        textDecoration: 'none', // Remove underline from link
        color: 'inherit', // Inherit text color
        // REMOVED: overflow: 'hidden', // Removing this to prevent cutoff
        // REMOVED: height: '110px', // Removing fixed height
        minWidth: '150px', // Minimum width for responsiveness
        maxWidth: 'calc(50% - 10px)', // Approximately 2 per line with 10px gap
        boxSizing: 'border-box', // Include padding and border in the width
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        flex: '1 1 auto', // Allow item to grow and shrink, but prefer base size
    };

    const itemHoverStyle: React.CSSProperties = {
        backgroundColor: '#e0e0e0', // Light grey on hover
    };

    const titleStyle: React.CSSProperties = {
        fontSize: '0.9em', // Slightly smaller font
        fontWeight: 'bold',
        marginBottom: '4px',
        // REMOVED: overflow: 'hidden',
        // REMOVED: textOverflow: 'ellipsis', // Doesn't work well with HTML content
        color: '#007bff', // Link color
        // REMOVED: maxHeight: '2.5em', // Removing fixed height
        // REMOVED: lineHeight: '1.25em', // Let browser determine based on content
    };

    const bodyTextStyle: React.CSSProperties = {
        fontSize: '0.75em', // Smaller font for body text
        color: '#555',
        lineHeight: '1.3', // Reduced line height
        flexGrow: 1, // Allow body text to take available space
        // REMOVED: overflow: 'hidden', // Removing this to prevent cutoff
        // REMOVED: No need for WebkitLineClamp here, as KaTeX renders directly into the HTML
    };

    const metaStyle: React.CSSProperties = {
        fontSize: '0.65em', // Even smaller font for meta info
        color: '#888',
        marginTop: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    const scoreStyle: React.CSSProperties = {
        backgroundColor: '#28a745', // Green for score
        color: 'white',
        padding: '1px 5px', // Smaller padding
        borderRadius: '3px',
    };

    const mediaTypeStyle: React.CSSProperties = {
        fontStyle: 'italic',
        textTransform: 'capitalize', // Capitalize first letter
    };

    const [isHovered, setIsHovered] = useState(false); // Using useState instead of React.useState

    return (
        <a
            href={result.link}
            target="_blank" // Open link in new tab
            rel="noopener noreferrer" // Security best practice for target="_blank"
            style={{ ...itemStyle, ...(isHovered ? itemHoverStyle : {}) }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                style={titleStyle}
                title={result.title}
                dangerouslySetInnerHTML={{ __html: processedTitle }}
            ></div>
            <div
                style={bodyTextStyle}
                dangerouslySetInnerHTML={{ __html: processedBodyText }}
            ></div>
            <div style={metaStyle}>
                <span style={mediaTypeStyle}>{result.media_type}</span>
                <span style={scoreStyle}>Score: {result.score.toFixed(2)}</span>
            </div>
        </a>
    );
};

export default SearchResultItem;