import React, { useEffect, useRef } from 'react';
import SearchResultItem from './SearchResultItem';
import "mathlive"; // Ensure MathLive is imported for the custom element

// Define the type for a single search result item (re-use from SearchResultItem.tsx)
export interface SearchResult { // Exporting so SearchResultItem can use it
    body_text: string;
    link: string;
    media_type: string;
    score: number;
    title: string;
}

// Define props for the QueryAndResult component
interface QueryAndResultProps {
    query: string; // The search query, potentially containing LaTeX
    results: SearchResult[]; // Array of search results
}

// Extend HTMLElement to add MathLive specific properties for the ref
interface MathfieldElement extends HTMLElement {
    setValue: (value: string) => void; // Method to set the LaTeX value
    readOnly: boolean;
}

function QueryAndResult({ query, results }: QueryAndResultProps) {
    const mathFieldRef = useRef<MathfieldElement>(null);

    // Use useEffect to set the LaTeX value when the query prop changes
    useEffect(() => {
        if (mathFieldRef.current) {
            mathFieldRef.current.setValue(query); // Set the LaTeX value to the math field
            mathFieldRef.current.readOnly = true; // Ensure it's read-only for display
        }
    }, [query]); // Re-run effect if the query changes

    const containerStyle: React.CSSProperties = {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '15px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px', // Space between query and results
    };

    const querySectionStyle: React.CSSProperties = {
        padding: '8px',
        backgroundColor: '#e9f7ef', // Light green background for query
        borderRadius: '5px',
        border: '1px solid #d4edda',
    };

    const queryLabelStyle: React.CSSProperties = {
        fontSize: '0.85em',
        fontWeight: 'bold',
        color: '#28a745', // Green color for "Your Query"
        marginBottom: '5px',
    };

    const resultsSectionStyle: React.CSSProperties = {
        borderTop: '1px dashed #eee', // Dashed line separator
        paddingTop: '10px',
        marginTop: '5px',
        display: 'flex', // Enable flexbox for results
        flexWrap: 'wrap', // Allow results to wrap to the next line
        gap: '10px', // Space between result chips
        justifyContent: 'flex-start', // Align items to the start
    };

    const resultsLabelStyle: React.CSSProperties = {
        fontSize: '0.85em',
        fontWeight: 'bold',
        color: '#007bff', // Blue color for "Results"
        marginBottom: '8px',
        width: '100%', // Make the label take full width
    };

    const noResultsStyle: React.CSSProperties = {
        fontSize: '0.8em',
        color: '#777',
        fontStyle: 'italic',
        width: '100%', // Make "no results" message take full width
    };

    return (
        <div style={containerStyle}>
            {/* Query Section */}
            <div style={querySectionStyle}>
                <div style={queryLabelStyle}>Your Query:</div>
                {/* MathLive field for rendering the query */}
                <math-field ref={mathFieldRef} style={{ width: '100%', border: 'none', background: 'transparent' }}></math-field>
            </div>

            {/* Results Section */}
            <div style={resultsSectionStyle}>
                <div style={resultsLabelStyle}>Results:</div>
                {results.length > 0 ? (
                    // Slice results to ensure only up to 5 are displayed
                    results.slice(0, 5).map((result, index) => (
                        <SearchResultItem key={index} result={result} />
                    ))
                ) : (
                    <p style={noResultsStyle}>No results found for this query.</p>
                )}
            </div>
        </div>
    );
}

export default QueryAndResult;